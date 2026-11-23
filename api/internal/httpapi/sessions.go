package httpapi

import (
	"crypto/subtle"
	"encoding/hex"
	"errors"
	"net/http"
	"net/url"
	"time"

	"github.com/akrooble/Dalka-Jobs/api/internal/auth"
	"github.com/akrooble/Dalka-Jobs/api/internal/config"
	"github.com/akrooble/Dalka-Jobs/api/internal/store"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// Failure results deliberately commit attempt counters; transport/database failures roll back.
func rejected(status int, code string) result {
	return result{status: status, body: map[string]any{"error": map[string]string{"code": code, "message": "Unable to complete this request. Review the fields or try again later."}}}
}
func (a *App) session(r *http.Request, t *transaction) (result, error) {
	s, err := a.readSession(r, t, false)
	if err == nil {
		body := map[string]any{"state": s.Phase, "csrfToken": s.Csrf}
		if s.Phase == "applicant" {
			body["subject"] = "applicant"
			_, err = t.tx.Exec(r.Context(), "UPDATE sessions SET touched_at=$2 WHERE token_hash=$1", s.TokenHash, t.now)
		} else if s.Phase != "anonymous" {
			u, e := a.account(r, t, s)
			if e != nil {
				return result{}, e
			}
			if s.Phase == "full" && len(u.TotpSecret) == 0 {
				return result{}, deny(403, "forbidden")
			}
			if s.Phase == "full" {
				body["role"] = u.Role
				_, err = t.tx.Exec(r.Context(), "UPDATE sessions SET touched_at=$2 WHERE token_hash=$1", s.TokenHash, t.now)
			} else {
				body["enrollmentRequired"] = len(u.TotpSecret) == 0
			}
		}
		return result{body: body}, err
	}
	var p problem
	if !errors.As(err, &p) {
		return result{}, err
	}
	ok, err := a.limit(r, t, "anonymous:"+peer(r), 30, time.Minute)
	if err != nil {
		return result{}, err
	}
	if !ok {
		return rejected(429, "rate_limited"), nil
	}
	// Bounded opportunistic cleanup; no user/company/job data is touched.
	_, err = t.tx.Exec(r.Context(), "DELETE FROM sessions WHERE token_hash IN (SELECT token_hash FROM sessions WHERE expires_at<=$1 ORDER BY expires_at LIMIT 100 FOR UPDATE SKIP LOCKED)", t.now)
	if err != nil {
		return result{}, err
	}
	_, err = t.tx.Exec(r.Context(), "DELETE FROM auth_limits WHERE key_hash IN (SELECT key_hash FROM auth_limits WHERE window_start<$1 LIMIT 100 FOR UPDATE SKIP LOCKED)", t.now.Add(-time.Hour))
	if err != nil {
		return result{}, err
	}
	_, err = t.tx.Exec(r.Context(), "DELETE FROM applicant_challenges WHERE id IN (SELECT id FROM applicant_challenges WHERE expires_at<=$1 LIMIT 100 FOR UPDATE SKIP LOCKED)", t.now)
	if err != nil {
		return result{}, err
	}
	return a.newSession(r, t, nil, pgtype.Text{}, "anonymous")
}
func (a *App) password(r *http.Request, t *transaction) (result, error) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := decode(r, &input); err != nil {
		return result{}, err
	}
	s, err := a.readSession(r, t, true)
	if err != nil {
		return result{}, err
	}
	if s.Phase != "anonymous" {
		return result{}, deny(403, "forbidden")
	}
	email, valid := config.Email(input.Email)
	if !valid {
		return rejected(422, "validation_failed"), nil
	}
	for _, limit := range []struct {
		key string
		max int
	}{{"password-ip:" + peer(r), 30}, {"password-account:" + email, 5}} {
		ok, e := a.limit(r, t, limit.key, limit.max, 15*time.Minute)
		if e != nil {
			return result{}, e
		}
		if !ok {
			return rejected(429, "rate_limited"), nil
		}
	}
	u, err := t.q.FindAccount(r.Context(), email)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return result{}, err
	}
	hash := u.PasswordHash
	if errors.Is(err, pgx.ErrNoRows) {
		hash = a.dummy
	}
	validPassword := auth.VerifyPassword(hash, input.Password)
	if !validPassword || !u.Active {
		return rejected(401, "invalid_credentials"), nil
	}
	_, err = t.tx.Exec(r.Context(), "DELETE FROM auth_limits WHERE key_hash=$1", auth.LimitKey(a.Key, "password-account:"+email))
	if err != nil {
		return result{}, err
	}
	value, err := a.newSession(r, t, &s, pgtype.Text{String: u.ID, Valid: true}, "pending")
	if err == nil {
		value.body.(map[string]any)["enrollmentRequired"] = len(u.TotpSecret) == 0
	}
	return value, err
}
func (a *App) pending(r *http.Request, t *transaction) (store.Session, store.Account, error) {
	s, err := a.readSession(r, t, true)
	if err != nil {
		return s, store.Account{}, err
	}
	if s.Phase != "pending" {
		return s, store.Account{}, deny(403, "forbidden")
	}
	u, err := a.account(r, t, s)
	return s, u, err
}
func (a *App) enrollment(r *http.Request, t *transaction) (result, error) {
	var input struct{}
	if err := decode(r, &input); err != nil {
		return result{}, err
	}
	s, u, err := a.pending(r, t)
	if err != nil {
		return result{}, err
	}
	if len(u.TotpSecret) != 0 {
		return result{}, deny(403, "forbidden")
	}
	encrypted := s.Enrollment
	if len(encrypted) == 0 {
		encrypted, err = auth.Seal(a.Key, u.ID+":totp-v1", []byte(auth.NewTOTPSecret()))
		if err != nil {
			return result{}, err
		}
		_, err = t.tx.Exec(r.Context(), "UPDATE sessions SET enrollment=$2 WHERE token_hash=$1", s.TokenHash, encrypted)
		if err != nil {
			return result{}, err
		}
	}
	secret, err := auth.Open(a.Key, u.ID+":totp-v1", encrypted)
	if err != nil {
		return result{}, err
	}
	uri := url.URL{Scheme: "otpauth", Host: "totp", Path: "/Dalka Jobs:" + u.Email}
	query := url.Values{"secret": {string(secret)}, "issuer": {"Dalka Jobs"}, "algorithm": {"SHA1"}, "digits": {"6"}, "period": {"30"}}
	uri.RawQuery = query.Encode()
	return result{body: map[string]string{"secret": string(secret), "uri": uri.String()}}, nil
}
func (a *App) confirm(r *http.Request, t *transaction) (result, error) {
	var input struct {
		Code string `json:"code"`
	}
	if err := decode(r, &input); err != nil {
		return result{}, err
	}
	s, u, err := a.pending(r, t)
	if err != nil {
		return result{}, err
	}
	if s.Attempts >= 5 {
		return rejected(429, "rate_limited"), nil
	}
	_, err = t.tx.Exec(r.Context(), "UPDATE sessions SET attempts=attempts+1 WHERE token_hash=$1", s.TokenHash)
	if err != nil {
		return result{}, err
	}
	encrypted := u.TotpSecret
	enrolling := len(encrypted) == 0
	if enrolling {
		encrypted = s.Enrollment
	}
	if len(encrypted) == 0 {
		return rejected(422, "enrollment_required"), nil
	}
	secret, err := auth.Open(a.Key, u.ID+":totp-v1", encrypted)
	if err != nil {
		return result{}, err
	}
	counter, ok := auth.MatchCode(string(secret), input.Code, t.now, u.LastCounter)
	if !ok {
		return rejected(401, "invalid_credentials"), nil
	}
	_, err = t.tx.Exec(r.Context(), "UPDATE accounts SET totp_secret=$2,last_counter=$3 WHERE id=$1", u.ID, encrypted, counter)
	if err != nil {
		return result{}, err
	}
	var codes []string
	if enrolling {
		_, err = t.tx.Exec(r.Context(), "DELETE FROM recovery_codes WHERE account_id=$1", u.ID)
		if err != nil {
			return result{}, err
		}
		for i := 0; i < 10; i++ {
			code := auth.RandomHex(16)
			codes = append(codes, code)
			_, err = t.tx.Exec(r.Context(), "INSERT INTO recovery_codes(account_id,code_hash) VALUES($1,$2)", u.ID, auth.Digest(code))
			if err != nil {
				return result{}, err
			}
		}
	}
	value, err := a.newSession(r, t, &s, pgtype.Text{String: u.ID, Valid: true}, "full")
	if err == nil {
		body := value.body.(map[string]any)
		body["role"] = u.Role
		if enrolling {
			body["recoveryCodes"] = codes
		}
	}
	return value, err
}
func (a *App) recovery(r *http.Request, t *transaction) (result, error) {
	var input struct {
		Code string `json:"code"`
	}
	if err := decode(r, &input); err != nil {
		return result{}, err
	}
	s, u, err := a.pending(r, t)
	if err != nil {
		return result{}, err
	}
	if len(u.TotpSecret) == 0 {
		return result{}, deny(403, "forbidden")
	}
	for _, limit := range []struct {
		key string
		max int
	}{{"recovery-ip:" + peer(r), 30}, {"recovery-account:" + u.ID, 5}} {
		ok, e := a.limit(r, t, limit.key, limit.max, 15*time.Minute)
		if e != nil {
			return result{}, e
		}
		if !ok {
			return rejected(429, "rate_limited"), nil
		}
	}
	// Fixed-length canonical codes; compare hashes without logging or returning the supplied value.
	decoded, e := hex.DecodeString(input.Code)
	if e != nil || len(decoded) != 16 {
		return rejected(401, "invalid_credentials"), nil
	}
	var hash []byte
	err = t.tx.QueryRow(r.Context(), "DELETE FROM recovery_codes WHERE account_id=$1 AND code_hash=$2 RETURNING code_hash", u.ID, auth.Digest(input.Code)).Scan(&hash)
	if errors.Is(err, pgx.ErrNoRows) {
		return rejected(401, "invalid_credentials"), nil
	}
	if err != nil {
		return result{}, err
	}
	if subtle.ConstantTimeCompare(hash, auth.Digest(input.Code)) != 1 {
		return result{}, deny(401, "invalid_credentials")
	}
	_, err = t.tx.Exec(r.Context(), "UPDATE accounts SET totp_secret=NULL,last_counter=-1 WHERE id=$1", u.ID)
	if err != nil {
		return result{}, err
	}
	_, err = t.tx.Exec(r.Context(), "DELETE FROM sessions WHERE account_id=$1", u.ID)
	if err != nil {
		return result{}, err
	}
	_, err = t.tx.Exec(r.Context(), "DELETE FROM recovery_codes WHERE account_id=$1", u.ID)
	if err != nil {
		return result{}, err
	}
	_ = s
	value, err := a.newSession(r, t, nil, pgtype.Text{String: u.ID, Valid: true}, "pending")
	if err == nil {
		value.body.(map[string]any)["enrollmentRequired"] = true
	}
	return value, err
}
func (a *App) logout(r *http.Request, t *transaction) (result, error) {
	var input struct{}
	if err := decode(r, &input); err != nil {
		return result{}, err
	}
	s, err := a.readSession(r, t, true)
	if err != nil {
		var p problem
		if !errors.As(err, &p) {
			return result{}, err
		}
		// A nonexistent/revoked cookie has no live authority to mutate; expire it.
		if len(s.TokenHash) == 0 {
			return result{body: map[string]string{"state": "anonymous"}, expire: true}, nil
		}
		// Expired records may be removed only with their matching synchronizer token.
		expired := sessionExpired(s, t.now)
		if !expired || subtle.ConstantTimeCompare([]byte(s.Csrf), []byte(r.Header.Get("X-CSRF-Token"))) != 1 {
			return result{}, err
		}
	}
	if err = t.q.DeleteSession(r.Context(), s.TokenHash); err != nil {
		return result{}, err
	}
	return result{body: map[string]string{"state": "anonymous"}, expire: true}, nil
}
