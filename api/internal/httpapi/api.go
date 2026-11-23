package httpapi

import (
	"context"
	"crypto/subtle"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"mime"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/akrooble/Dalka-Jobs/api/internal/auth"
	"github.com/akrooble/Dalka-Jobs/api/internal/store"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type App struct {
	Connect func(context.Context) (*pgx.Conn, error)
	Origin  string
	Key     []byte
	Now     func() time.Time
	// Explicit synthetic-only local adapter. Nil disables applicant intake.
	ApplicantSender auth.ApplicantSender
	slots           chan struct{}
	dummy           string
}
type problem struct {
	status int
	code   string
}

func (p problem) Error() string          { return p.code }
func deny(status int, code string) error { return problem{status, code} }

const cookieName = "dalka_session"

func New(connect func(context.Context) (*pgx.Conn, error), origin string, key []byte) *App {
	dummy, _ := auth.PasswordHash("dummy-account-hash-not-a-login")
	return &App{Connect: connect, Origin: origin, Key: key, Now: time.Now, slots: make(chan struct{}, 16), dummy: dummy}
}
func (a *App) Handler() http.Handler {
	r := chi.NewRouter()
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Cache-Control", "no-store")
			w.Header().Set("X-Content-Type-Options", "nosniff")
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			select {
			case a.slots <- struct{}{}:
				defer func() { <-a.slots }()
			default:
				writeError(w, deny(429, "rate_limited"))
				return
			}
			ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
			defer cancel()
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	})
	r.Get("/api/v1/health", func(w http.ResponseWriter, r *http.Request) { respond(w, 200, map[string]string{"status": "ok"}) })
	r.Get("/api/v1/session", a.wrap(a.session))
	r.Post("/api/v1/auth/password", a.wrap(a.password))
	r.Post("/api/v1/auth/totp/enrollment", a.wrap(a.enrollment))
	r.Post("/api/v1/auth/totp/confirm", a.wrap(a.confirm))
	r.Post("/api/v1/auth/recovery", a.wrap(a.recovery))
	r.Post("/api/v1/auth/logout", a.wrap(a.logout))
	r.Get("/api/v1/auth/applicant/options", a.wrap(a.applicantOptions))
	r.Post("/api/v1/auth/applicant/request", a.wrap(a.requestApplicantCode))
	r.Post("/api/v1/auth/applicant/verify", a.wrap(a.verifyApplicantCode))
	r.Get("/api/v1/applicant/profile", a.wrap(a.applicantProfile))
	r.Patch("/api/v1/applicant/profile", a.wrap(a.editApplicantProfile))
	r.Post("/api/v1/applicant/deletion/request", a.wrap(a.requestApplicantDeletion))
	r.Post("/api/v1/applicant/deletion/confirm", a.wrap(a.confirmApplicantDeletion))
	r.Get("/api/v1/applicant/cv", a.wrap(a.applicantFilesUnavailable))
	r.Post("/api/v1/applicant/cv", a.wrap(a.applicantFilesUnavailable))
	r.Post("/api/v1/applicant/cv/remove", a.wrap(a.applicantFilesUnavailable))
	r.Get("/api/v1/public/lists", a.wrap(a.lists))
	r.Get("/api/v1/public/jobs", a.wrap(a.jobs))
	r.Get("/api/v1/public/jobs/{slug}", a.wrap(a.job))
	r.Get("/api/v1/admin/companies", a.wrap(a.companies))
	r.Post("/api/v1/admin/companies", a.wrap(a.createCompany))
	r.Get("/api/v1/admin/companies/{id}", a.wrap(a.company))
	r.Patch("/api/v1/admin/companies/{id}", a.wrap(a.editCompany))
	r.Get("/api/v1/admin/jobs", a.wrap(a.adminJobs))
	r.Post("/api/v1/admin/jobs", a.wrap(a.createJob))
	r.Get("/api/v1/admin/jobs/{id}", a.wrap(a.adminJob))
	r.Patch("/api/v1/admin/jobs/{id}", a.wrap(a.editJob))
	r.Get("/api/v1/admin/lists", a.wrap(a.managedLists))
	r.Post("/api/v1/admin/lists", a.wrap(a.createManagedList))
	r.Get("/api/v1/admin/lists/{id}", a.wrap(a.managedList))
	r.Patch("/api/v1/admin/lists/{id}", a.wrap(a.editManagedList))
	r.Get("/api/v1/admin/users", a.wrap(a.teamUsers))
	r.Patch("/api/v1/admin/users/{id}", a.wrap(a.editTeamUser))
	r.Get("/api/v1/admin/assignments", a.wrap(a.assignments))
	r.Post("/api/v1/admin/assignments", a.wrap(a.createAssignment))
	r.Patch("/api/v1/admin/assignments/{id}", a.wrap(a.editAssignment))
	r.Get("/api/v1/admin/overview", a.wrap(a.overview))
	r.Get("/api/v1/admin/activity", a.wrap(a.activityEvents))
	r.Get("/api/v1/recruiter/jobs", a.wrap(a.scopedJobs("recruiter")))
	r.Get("/api/v1/company/jobs", a.wrap(a.scopedJobs("company_admin")))
	r.NotFound(func(w http.ResponseWriter, r *http.Request) { writeError(w, deny(404, "not_found")) })
	r.MethodNotAllowed(func(w http.ResponseWriter, r *http.Request) { writeError(w, deny(405, "method_not_allowed")) })
	return r
}

type transaction struct {
	tx  pgx.Tx
	q   *store.Queries
	now time.Time
}
type result struct {
	status int
	body   any
	cookie string
	expire bool
}
type endpoint func(*http.Request, *transaction) (result, error)

func (a *App) wrap(fn endpoint) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "GET" && r.Header.Get("Origin") != a.Origin {
			writeError(w, deny(403, "origin_rejected"))
			return
		}
		conn, err := a.Connect(r.Context())
		if err != nil {
			writeError(w, deny(503, "service_unavailable"))
			return
		}
		defer conn.Close(context.Background())
		tx, err := conn.Begin(r.Context())
		if err != nil {
			writeError(w, err)
			return
		}
		defer tx.Rollback(context.Background())
		value, err := fn(r, &transaction{tx, store.New(tx), a.Now().UTC()})
		if err != nil {
			writeError(w, err)
			return
		}
		if err = tx.Commit(r.Context()); err != nil {
			writeError(w, err)
			return
		}
		if value.cookie != "" || value.expire {
			c := &http.Cookie{Name: cookieName, Value: value.cookie, Path: "/", HttpOnly: true, SameSite: http.SameSiteLaxMode, Secure: strings.HasPrefix(a.Origin, "https://")}
			if value.expire {
				c.MaxAge = -1
				c.Expires = time.Unix(1, 0)
			}
			http.SetCookie(w, c)
		}
		respond(w, value.status, value.body)
	}
}
func respond(w http.ResponseWriter, status int, value any) {
	if status == 0 {
		status = 200
	}
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
func writeError(w http.ResponseWriter, err error) {
	p := problem{503, "service_unavailable"}
	var known problem
	if errors.As(err, &known) {
		p = known
	}
	respond(w, p.status, map[string]any{"error": map[string]string{"code": p.code, "message": map[string]string{"validation_failed": "Check the supplied fields.", "invalid_credentials": "Unable to verify these credentials.", "forbidden": "This action is unavailable.", "csrf_rejected": "Refresh your session and try again.", "origin_rejected": "This request origin is unavailable.", "conflict": "The record changed or already exists. Reload and review it.", "list_in_use": "This value is used by a job. Keep it active, or update the job references first.", "stale_list": "This entry changed. Reload the saved entry and review it before saving.", "not_found": "The requested record was not found.", "rate_limited": "Too many attempts. Try again later."}[p.code]}})
}
func decode(r *http.Request, value any) error {
	kind, _, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if err != nil || kind != "application/json" {
		return deny(415, "unsupported_media_type")
	}
	data, err := io.ReadAll(io.LimitReader(r.Body, 65537))
	if err != nil || len(data) > 65536 {
		return deny(413, "request_too_large")
	}
	// API bodies are single objects; reject duplicate keys rather than accepting last-wins credentials.
	check := json.NewDecoder(strings.NewReader(string(data)))
	opening, e := check.Token()
	if e != nil || opening != json.Delim('{') {
		return deny(422, "validation_failed")
	}
	seen := map[string]bool{}
	for check.More() {
		token, e := check.Token()
		key, ok := token.(string)
		if e != nil || !ok || seen[key] {
			return deny(422, "validation_failed")
		}
		seen[key] = true
		var raw json.RawMessage
		if check.Decode(&raw) != nil {
			return deny(422, "validation_failed")
		}
	}
	if closing, e := check.Token(); e != nil || closing != json.Delim('}') {
		return deny(422, "validation_failed")
	}
	d := json.NewDecoder(strings.NewReader(string(data)))
	d.DisallowUnknownFields()
	if d.Decode(value) != nil {
		return deny(422, "validation_failed")
	}
	if d.Decode(new(any)) != io.EOF {
		return deny(422, "validation_failed")
	}
	return nil
}
func ts(t time.Time) pgtype.Timestamptz { return pgtype.Timestamptz{Time: t, Valid: true} }
func (a *App) readSession(r *http.Request, t *transaction, write bool) (store.Session, error) {
	c, err := r.Cookie(cookieName)
	if err != nil || len(c.Value) != 64 {
		return store.Session{}, deny(403, "csrf_rejected")
	}
	if _, err = hex.DecodeString(c.Value); err != nil {
		return store.Session{}, deny(403, "csrf_rejected")
	}
	// Read the immutable owner first, then always lock account before session.
	// Recovery/operator reset use the same order when revoking all of an account's sessions.
	lookup, err := t.q.ReadSession(r.Context(), auth.Digest(c.Value))
	if errors.Is(err, pgx.ErrNoRows) {
		return store.Session{}, deny(403, "csrf_rejected")
	}
	if err != nil {
		return store.Session{}, err
	}
	if lookup.AccountID.Valid {
		u, e := t.q.LockAccount(r.Context(), lookup.AccountID.String)
		if errors.Is(e, pgx.ErrNoRows) || e == nil && !u.Active {
			return store.Session{}, deny(403, "forbidden")
		}
		if e != nil {
			return store.Session{}, e
		}
	}
	if lookup.ApplicantID.Valid {
		u, e := t.q.LockApplicant(r.Context(), lookup.ApplicantID.String)
		if errors.Is(e, pgx.ErrNoRows) || e == nil && u.DeletedAt.Valid {
			return store.Session{}, deny(403, "forbidden")
		}
		if e != nil {
			return store.Session{}, e
		}
	}
	s, err := t.q.LockSession(r.Context(), auth.Digest(c.Value))
	if errors.Is(err, pgx.ErrNoRows) {
		return s, deny(403, "csrf_rejected")
	}
	if err != nil {
		return s, err
	}
	if s.AccountID != lookup.AccountID || s.ApplicantID != lookup.ApplicantID || !validSessionSubject(s) {
		return s, deny(403, "csrf_rejected")
	}
	if sessionExpired(s, t.now) {
		return s, deny(403, "csrf_rejected")
	}
	if write && subtle.ConstantTimeCompare([]byte(s.Csrf), []byte(r.Header.Get("X-CSRF-Token"))) != 1 {
		return s, deny(403, "csrf_rejected")
	}
	return s, nil
}
func (a *App) newSession(r *http.Request, t *transaction, old *store.Session, account pgtype.Text, phase string) (result, error) {
	token, csrf := auth.RandomHex(32), auth.RandomHex(32)
	ttl := 5 * time.Minute
	if phase == "full" {
		ttl = 8 * time.Hour
	}
	if old != nil {
		if err := t.q.DeleteSession(r.Context(), old.TokenHash); err != nil {
			return result{}, err
		}
	}
	err := t.q.InsertSession(r.Context(), store.InsertSessionParams{TokenHash: auth.Digest(token), Csrf: csrf, AccountID: account, Phase: phase, ExpiresAt: ts(t.now.Add(ttl)), TouchedAt: ts(t.now)})
	return result{body: map[string]any{"state": phase, "csrfToken": csrf}, cookie: token}, err
}
func (a *App) account(r *http.Request, t *transaction, s store.Session) (store.Account, error) {
	if !s.AccountID.Valid {
		return store.Account{}, deny(403, "forbidden")
	}
	u, err := t.q.LockAccount(r.Context(), s.AccountID.String)
	if errors.Is(err, pgx.ErrNoRows) || err == nil && !u.Active {
		return u, deny(403, "forbidden")
	}
	return u, err
}
func (a *App) super(r *http.Request, t *transaction) (store.Account, error) {
	s, err := a.readSession(r, t, r.Method != "GET")
	if err != nil {
		return store.Account{}, err
	}
	u, err := a.account(r, t, s)
	if err != nil {
		return u, err
	}
	if s.Phase != "full" || len(u.TotpSecret) == 0 || u.Role != "super_admin" {
		return u, deny(403, "forbidden")
	}
	_, err = t.tx.Exec(r.Context(), "UPDATE sessions SET touched_at=$2 WHERE token_hash=$1", s.TokenHash, t.now)
	return u, err
}
func peer(r *http.Request) string {
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return "unknown"
	}
	return ip
}
func (a *App) limit(r *http.Request, t *transaction, key string, max int, window time.Duration) (bool, error) {
	var n int
	err := t.tx.QueryRow(r.Context(), `INSERT INTO auth_limits(key_hash,window_start,attempts) VALUES($1,$2,1) ON CONFLICT(key_hash) DO UPDATE SET attempts=CASE WHEN auth_limits.window_start<=$3 THEN 1 ELSE auth_limits.attempts+1 END,window_start=CASE WHEN auth_limits.window_start<=$3 THEN $2 ELSE auth_limits.window_start END RETURNING attempts`, auth.LimitKey(a.Key, key), t.now, t.now.Add(-window)).Scan(&n)
	return n <= max, err
}
