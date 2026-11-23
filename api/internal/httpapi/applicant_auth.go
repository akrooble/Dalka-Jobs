package httpapi

import (
	"bytes"
	"crypto/subtle"
	"encoding/hex"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/akrooble/Dalka-Jobs/api/internal/auth"
	"github.com/akrooble/Dalka-Jobs/api/internal/store"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

func validSessionSubject(s store.Session) bool {
	switch s.Phase {
	case "anonymous":
		return !s.AccountID.Valid && !s.ApplicantID.Valid
	case "pending", "full":
		return s.AccountID.Valid && !s.ApplicantID.Valid
	case "applicant":
		return !s.AccountID.Valid && s.ApplicantID.Valid
	default:
		return false
	}
}
func sessionExpired(s store.Session, now time.Time) bool {
	if !s.ExpiresAt.Time.After(now) {
		return true
	}
	if s.Phase == "full" {
		return !s.TouchedAt.Time.Add(30 * time.Minute).After(now)
	}
	if s.Phase == "applicant" {
		return !s.TouchedAt.Time.Add(auth.ApplicantSessionIdle).After(now)
	}
	return false
}
func (a *App) applicantOptions(r *http.Request, t *transaction) (result, error) {
	if err := queryKeys(r); err != nil {
		return result{}, err
	}
	return result{body: map[string]any{"enabled": a.ApplicantSender != nil, "syntheticOnly": true, "privacyVersion": auth.SyntheticPrivacyVersion}}, nil
}
func (a *App) lockApplicantIdentity(r *http.Request, t *transaction, identity []byte) error {
	// All applicant challenge operations acquire this before session/challenge
	// locks. Cross-browser resends serialize on the same opaque identity key.
	_, err := t.tx.Exec(r.Context(), "SELECT pg_advisory_xact_lock(hashtextextended($1,0))", hex.EncodeToString(identity))
	return err
}
func (a *App) applicantLimits(r *http.Request, t *transaction, prefix string, identity []byte, identityMax, peerMax int) (bool, error) {
	good := true
	for _, v := range []struct {
		key string
		max int
	}{{prefix + "-identity:" + hex.EncodeToString(identity), identityMax}, {prefix + "-peer:" + peer(r), peerMax}} {
		ok, err := a.limit(r, t, v.key, v.max, time.Hour)
		if err != nil {
			return false, err
		}
		good = good && ok
	}
	return good, nil
}
func (a *App) requestApplicantCode(r *http.Request, t *transaction) (result, error) {
	var input struct {
		Email          string `json:"email"`
		PrivacyVersion string `json:"privacyVersion"`
		Accepted       bool   `json:"accepted"`
	}
	if err := decode(r, &input); err != nil {
		return result{}, err
	}
	if a.ApplicantSender == nil {
		return rejected(503, "applicant_unavailable"), nil
	}
	email, ok := auth.ApplicantEmail(input.Email)
	if !ok || !strings.HasSuffix(email, ".invalid") || !input.Accepted || input.PrivacyVersion != auth.SyntheticPrivacyVersion {
		return rejected(422, "validation_failed"), nil
	}
	identity := auth.LimitKey(a.Key, "applicant-identity:"+email)
	if err := a.lockApplicantIdentity(r, t, identity); err != nil {
		return result{}, err
	}
	s, err := a.readSession(r, t, true)
	if err != nil {
		return result{}, err
	}
	if s.Phase != "anonymous" {
		return result{}, deny(403, "sign_out_required")
	}
	return a.issueApplicantChallenge(r, t, s, email, "sign_in", input.PrivacyVersion)
}

func (a *App) issueApplicantChallenge(r *http.Request, t *transaction, s store.Session, email, purpose, privacyVersion string) (result, error) {
	identity := auth.LimitKey(a.Key, "applicant-identity:"+email)
	permitted, err := a.applicantLimits(r, t, "applicant-send", identity, 5, 20)
	if err != nil {
		return result{}, err
	}
	if !permitted {
		return rejected(429, "rate_limited"), nil
	}
	var recent bool
	err = t.tx.QueryRow(r.Context(), "SELECT EXISTS(SELECT 1 FROM applicant_challenges WHERE identity_hash=$1 AND purpose=$3 AND created_at>$2)", identity, t.now.Add(-time.Minute), purpose).Scan(&recent)
	if err != nil {
		return result{}, err
	}
	if recent {
		return rejected(429, "rate_limited"), nil
	}
	// Invalidate prior codes even on accepted delivery failure. The failed
	// challenge below stays invalidated, preserving resend throttling evidence.
	_, err = t.tx.Exec(r.Context(), "UPDATE applicant_challenges SET invalidated=true WHERE identity_hash=$1 AND purpose=$2 AND invalidated=false", identity, purpose)
	if err != nil {
		return result{}, err
	}
	id, code := auth.RandomHex(16), auth.NewApplicantCode()
	expires := t.now.Add(auth.ApplicantOTPExpiry)
	err = t.q.CreateApplicantChallenge(r.Context(), store.CreateApplicantChallengeParams{ID: id, SessionHash: s.TokenHash, IdentityHash: identity, Email: email, Purpose: purpose, CodeHash: auth.ApplicantCodeDigest(a.Key, id, purpose, email, hex.EncodeToString(s.TokenHash), code), PrivacyVersion: privacyVersion, CreatedAt: ts(t.now), ExpiresAt: ts(expires)})
	if err != nil {
		return result{}, err
	}
	err = a.ApplicantSender.Send(r.Context(), auth.ApplicantMessage{Email: email, Code: code, Challenge: id, Purpose: purpose})
	if err != nil {
		_, err = t.tx.Exec(r.Context(), "UPDATE applicant_challenges SET invalidated=true WHERE id=$1", id)
		return rejected(503, "delivery_unavailable"), err
	}
	if s.Phase == "anonymous" {
		_, err = t.tx.Exec(r.Context(), "UPDATE sessions SET expires_at=GREATEST(expires_at,$2) WHERE token_hash=$1", s.TokenHash, expires)
	}
	return result{status: 202, body: map[string]any{"challengeId": id, "resendAfter": 60, "expiresAt": expires}}, err
}

func (a *App) verifyApplicantCode(r *http.Request, t *transaction) (result, error) {
	var input struct {
		ChallengeID string `json:"challengeId"`
		Code        string `json:"code"`
	}
	if err := decode(r, &input); err != nil {
		return result{}, err
	}
	if a.ApplicantSender == nil {
		return rejected(503, "applicant_unavailable"), nil
	}
	// Lookup immutable identity before acquiring the canonical identity lock.
	// A missing ID still consumes the peer verification budget below.
	var identity []byte
	if len(input.ChallengeID) == 32 {
		decoded, e := hex.DecodeString(input.ChallengeID)
		if e == nil && len(decoded) == 16 {
			err := t.tx.QueryRow(r.Context(), "SELECT identity_hash FROM applicant_challenges WHERE id=$1", input.ChallengeID).Scan(&identity)
			if err != nil && !errors.Is(err, pgx.ErrNoRows) {
				return result{}, err
			}
		}
	}
	if len(identity) > 0 {
		if err := a.lockApplicantIdentity(r, t, identity); err != nil {
			return result{}, err
		}
	}
	s, err := a.readSession(r, t, true)
	if err != nil {
		return result{}, err
	}
	if s.Phase != "anonymous" {
		return result{}, deny(403, "sign_out_required")
	}
	var permitted bool
	if len(identity) == 0 {
		permitted, err = a.limit(r, t, "applicant-verify-peer:"+peer(r), 20, time.Hour)
	} else {
		permitted, err = a.applicantLimits(r, t, "applicant-verify", identity, 20, 20)
	}
	if err != nil {
		return result{}, err
	}
	if !permitted {
		return rejected(429, "rate_limited"), nil
	}
	if len(identity) == 0 {
		return rejected(401, "invalid_code"), nil
	}
	c, err := t.q.ApplicantChallenge(r.Context(), input.ChallengeID)
	if errors.Is(err, pgx.ErrNoRows) {
		return rejected(401, "invalid_code"), nil
	}
	if err != nil {
		return result{}, err
	}
	if !bytes.Equal(c.SessionHash, s.TokenHash) || c.Purpose != "sign_in" || c.Invalidated || !c.ExpiresAt.Time.After(t.now) {
		return rejected(401, "invalid_code"), nil
	}
	if c.Attempts >= 5 {
		return rejected(429, "rate_limited"), nil
	}
	_, err = t.tx.Exec(r.Context(), "UPDATE applicant_challenges SET attempts=attempts+1 WHERE id=$1", c.ID)
	if err != nil {
		return result{}, err
	}
	wanted := auth.ApplicantCodeDigest(a.Key, c.ID, c.Purpose, c.Email, hex.EncodeToString(s.TokenHash), input.Code)
	if !auth.ValidApplicantCode(input.Code) || subtle.ConstantTimeCompare(c.CodeHash, wanted) != 1 {
		return rejected(401, "invalid_code"), nil
	}
	u, err := t.q.FindApplicant(r.Context(), pgtype.Text{String: c.Email, Valid: true})
	if errors.Is(err, pgx.ErrNoRows) {
		u, err = t.q.CreateApplicant(r.Context(), store.CreateApplicantParams{ID: auth.RandomHex(16), Email: pgtype.Text{String: c.Email, Valid: true}, PrivacyVersion: c.PrivacyVersion, AcknowledgedAt: ts(t.now)})
		if err == nil {
			err = t.q.CreateApplicantProfile(r.Context(), store.CreateApplicantProfileParams{ApplicantID: u.ID, ContactEmail: u.Email, UpdatedAt: ts(t.now)})
		}
	}
	if err != nil {
		return result{}, err
	}
	if u.DeletedAt.Valid {
		return rejected(401, "invalid_code"), nil
	}
	_, err = t.tx.Exec(r.Context(), "DELETE FROM applicant_challenges WHERE identity_hash=$1 AND purpose='sign_in'", identity)
	if err != nil {
		return result{}, err
	}
	if err = t.q.DeleteSession(r.Context(), s.TokenHash); err != nil {
		return result{}, err
	}
	token, csrf := auth.RandomHex(32), auth.RandomHex(32)
	err = t.q.CreateApplicantSession(r.Context(), store.CreateApplicantSessionParams{TokenHash: auth.Digest(token), Csrf: csrf, ApplicantID: pgtype.Text{String: u.ID, Valid: true}, ExpiresAt: ts(t.now.Add(auth.ApplicantSessionExpiry)), TouchedAt: ts(t.now)})
	return result{body: map[string]string{"state": "applicant", "subject": "applicant", "csrfToken": csrf}, cookie: token}, err
}
