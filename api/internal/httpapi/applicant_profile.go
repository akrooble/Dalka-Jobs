package httpapi

import (
	"bytes"
	"crypto/subtle"
	"encoding/hex"
	"errors"
	"net/http"
	"regexp"
	"strings"
	"unicode"
	"unicode/utf8"

	"github.com/akrooble/Dalka-Jobs/api/internal/auth"
	"github.com/akrooble/Dalka-Jobs/api/internal/store"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type profileDTO struct {
	Name         string `json:"name"`
	LoginEmail   string `json:"loginEmail"`
	ContactEmail string `json:"contactEmail"`
	Phone        string `json:"phone"`
	LocationID   string `json:"locationId"`
	Bio          string `json:"bio"`
	Version      int64  `json:"version"`
	UpdatedAt    string `json:"updatedAt"`
}

func profileView(p store.ApplicantProfile, u store.Applicant) profileDTO {
	return profileDTO{p.Name, u.Email.String, p.ContactEmail.String, p.Phone, p.LocationID.String, p.Bio, p.Version, p.UpdatedAt.Time.Format("2006-01-02T15:04:05Z07:00")}
}

func (a *App) applicant(r *http.Request, t *transaction, write bool) (store.Session, store.Applicant, error) {
	s, err := a.readSession(r, t, write)
	if err != nil {
		return s, store.Applicant{}, err
	}
	if s.Phase != "applicant" || !s.ApplicantID.Valid || s.AccountID.Valid {
		return s, store.Applicant{}, deny(403, "forbidden")
	}
	u, err := t.q.LockApplicant(r.Context(), s.ApplicantID.String)
	if err != nil {
		return s, u, err
	}
	if u.DeletedAt.Valid {
		return s, u, deny(403, "forbidden")
	}
	_, err = t.tx.Exec(r.Context(), "UPDATE sessions SET touched_at=$2 WHERE token_hash=$1", s.TokenHash, t.now)
	return s, u, err
}

func (a *App) applicantProfile(r *http.Request, t *transaction) (result, error) {
	if err := queryKeys(r); err != nil {
		return result{}, err
	}
	_, u, err := a.applicant(r, t, false)
	if err != nil {
		return result{}, err
	}
	p, err := t.q.ApplicantProfile(r.Context(), u.ID)
	return result{body: profileView(p, u)}, err
}

func validProfileText(value string, min, max int, multiline bool) bool {
	if !utf8.ValidString(value) || utf8.RuneCountInString(value) < min || utf8.RuneCountInString(value) > max {
		return false
	}
	for _, c := range value {
		if unicode.IsControl(c) && !(multiline && (c == '\n' || c == '\r' || c == '\t')) {
			return false
		}
	}
	return true
}
func (a *App) editApplicantProfile(r *http.Request, t *transaction) (result, error) {
	var in struct {
		Name         string `json:"name"`
		ContactEmail string `json:"contactEmail"`
		Phone        string `json:"phone"`
		LocationID   string `json:"locationId"`
		Bio          string `json:"bio"`
		Version      int64  `json:"version"`
	}
	if err := decode(r, &in); err != nil {
		return result{}, err
	}
	_, u, err := a.applicant(r, t, true)
	if err != nil {
		return result{}, err
	}
	in.Name = strings.TrimSpace(in.Name)
	in.Phone = strings.TrimSpace(in.Phone)
	email := pgtype.Text{}
	if in.ContactEmail != "" {
		v, ok := auth.ApplicantEmail(in.ContactEmail)
		if !ok || !strings.HasSuffix(v, ".invalid") {
			return result{}, deny(422, "validation_failed")
		}
		email = pgtype.Text{String: v, Valid: true}
	}
	if !validProfileText(in.Name, 2, 100, false) || !validProfileText(in.Bio, 0, 2000, true) || in.Version < 1 || (!email.Valid && in.Phone == "") || (in.Phone != "" && !regexp.MustCompile(`^\+[1-9][0-9]{6,14}$`).MatchString(in.Phone)) {
		return result{}, deny(422, "validation_failed")
	}
	location := pgtype.Text{}
	if in.LocationID != "" {
		var found string
		err = t.tx.QueryRow(r.Context(), "SELECT id FROM managed_lists WHERE id=$1 AND kind='location' AND active=true FOR SHARE", in.LocationID).Scan(&found)
		if errors.Is(err, pgx.ErrNoRows) {
			return result{}, deny(422, "validation_failed")
		}
		if err != nil {
			return result{}, err
		}
		location = pgtype.Text{String: found, Valid: true}
	}
	p, err := t.q.EditApplicantProfile(r.Context(), store.EditApplicantProfileParams{ApplicantID: u.ID, Name: in.Name, ContactEmail: email, Phone: in.Phone, LocationID: location, Bio: in.Bio, UpdatedAt: ts(t.now), Version: in.Version})
	if errors.Is(err, pgx.ErrNoRows) {
		return result{}, deny(409, "conflict")
	}
	return result{body: profileView(p, u)}, err
}

// Fetch only the immutable owner/identity before locks; readSession below
// rechecks it under lock. Deletion/sign-in always lock identity before owner.
func (a *App) currentApplicantIdentity(r *http.Request, t *transaction) ([]byte, error) {
	cookie, err := r.Cookie(cookieName)
	if err != nil || len(cookie.Value) != 64 {
		return nil, deny(403, "forbidden")
	}
	if _, err = hex.DecodeString(cookie.Value); err != nil {
		return nil, deny(403, "forbidden")
	}
	var email string
	err = t.tx.QueryRow(r.Context(), "SELECT a.email FROM sessions s JOIN applicants a ON a.id=s.applicant_id WHERE s.token_hash=$1 AND s.phase='applicant' AND a.deleted_at IS NULL", auth.Digest(cookie.Value)).Scan(&email)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, deny(403, "forbidden")
	}
	if err != nil {
		return nil, err
	}
	identity := auth.LimitKey(a.Key, "applicant-identity:"+email)
	if err = a.lockApplicantIdentity(r, t, identity); err != nil {
		return nil, err
	}
	return identity, nil
}
func (a *App) requestApplicantDeletion(r *http.Request, t *transaction) (result, error) {
	var input struct{}
	if err := decode(r, &input); err != nil {
		return result{}, err
	}
	if a.ApplicantSender == nil {
		return rejected(503, "applicant_unavailable"), nil
	}
	if _, err := a.currentApplicantIdentity(r, t); err != nil {
		return result{}, err
	}
	s, u, err := a.applicant(r, t, true)
	if err != nil {
		return result{}, err
	}
	return a.issueApplicantChallenge(r, t, s, u.Email.String, "delete_account", u.PrivacyVersion)
}
func (a *App) confirmApplicantDeletion(r *http.Request, t *transaction) (result, error) {
	var input struct {
		ChallengeID string `json:"challengeId"`
		Code        string `json:"code"`
		Confirmed   bool   `json:"confirmed"`
	}
	if err := decode(r, &input); err != nil {
		return result{}, err
	}
	if !input.Confirmed || !opaqueID.MatchString(input.ChallengeID) {
		return result{}, deny(422, "validation_failed")
	}
	identity, err := a.currentApplicantIdentity(r, t)
	if err != nil {
		return result{}, err
	}
	s, u, err := a.applicant(r, t, true)
	if err != nil {
		return result{}, err
	}
	ok, err := a.applicantLimits(r, t, "applicant-verify", identity, 20, 20)
	if err != nil {
		return result{}, err
	}
	if !ok {
		return rejected(429, "rate_limited"), nil
	}
	c, err := t.q.ApplicantChallenge(r.Context(), input.ChallengeID)
	if errors.Is(err, pgx.ErrNoRows) {
		return rejected(401, "invalid_code"), nil
	}
	if err != nil {
		return result{}, err
	}
	if c.Purpose != "delete_account" || !bytes.Equal(c.SessionHash, s.TokenHash) || !bytes.Equal(c.IdentityHash, identity) || c.Email != u.Email.String || c.Invalidated || !c.ExpiresAt.Time.After(t.now) {
		return rejected(401, "invalid_code"), nil
	}
	if c.Attempts >= 5 {
		return rejected(429, "rate_limited"), nil
	}
	_, err = t.tx.Exec(r.Context(), "UPDATE applicant_challenges SET attempts=attempts+1 WHERE id=$1", c.ID)
	if err != nil {
		return result{}, err
	}
	digest := auth.ApplicantCodeDigest(a.Key, c.ID, c.Purpose, c.Email, hex.EncodeToString(s.TokenHash), input.Code)
	if !auth.ValidApplicantCode(input.Code) || subtle.ConstantTimeCompare(c.CodeHash, digest) != 1 {
		return rejected(401, "invalid_code"), nil
	}
	// No files/applications can be accepted by this source. Future intake must
	// extend durable purge reconciliation before completing this receipt.
	for _, op := range []struct {
		sql  string
		args []any
	}{
		{"INSERT INTO applicant_deletions(applicant_id,requested_at,completed_at) VALUES($1,$2,$2)", []any{u.ID, t.now}},
		{"DELETE FROM applicant_profiles WHERE applicant_id=$1", []any{u.ID}},
		{"DELETE FROM applicant_challenges WHERE identity_hash=$1", []any{identity}},
		{"DELETE FROM sessions WHERE applicant_id=$1", []any{u.ID}},
		{"UPDATE applicants SET email=NULL,deleted_at=$2 WHERE id=$1", []any{u.ID, t.now}},
	} {
		if _, err = t.tx.Exec(r.Context(), op.sql, op.args...); err != nil {
			return result{}, err
		}
	}
	return result{body: map[string]string{"state": "deleted"}, expire: true}, nil
}
func (a *App) applicantFilesUnavailable(r *http.Request, t *transaction) (result, error) {
	if _, _, err := a.applicant(r, t, r.Method != "GET"); err != nil {
		return result{}, err
	}
	return rejected(503, "private_files_unavailable"), nil
}
