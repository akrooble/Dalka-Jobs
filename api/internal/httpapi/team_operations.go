package httpapi

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/akrooble/Dalka-Jobs/api/internal/auth"
	"github.com/akrooble/Dalka-Jobs/api/internal/store"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
)

type teamUserDTO struct {
	ID          string `json:"id"`
	Email       string `json:"email"`
	Role        string `json:"role"`
	CompanyID   string `json:"companyId"`
	Active      bool   `json:"active"`
	MFAEnrolled bool   `json:"mfaEnrolled"`
	Version     int64  `json:"version"`
}

func teamUserView(u store.Account) teamUserDTO {
	return teamUserDTO{u.ID, u.Email, u.Role, u.CompanyID.String, u.Active, len(u.TotpSecret) > 0, u.Version}
}
func (a *App) teamUsers(r *http.Request, t *transaction) (result, error) {
	if _, err := a.super(r, t); err != nil {
		return result{}, err
	}
	if err := queryKeys(r, "q", "page", "pageSize"); err != nil {
		return result{}, err
	}
	page, size, err := pagination(r)
	if err != nil {
		return result{}, err
	}
	q := strings.TrimSpace(r.URL.Query().Get("q"))
	if len(q) > 254 {
		return result{}, deny(422, "validation_failed")
	}
	var total int
	err = t.tx.QueryRow(r.Context(), "SELECT count(*) FROM accounts WHERE strpos(email,lower($1))>0", q).Scan(&total)
	if err != nil {
		return result{}, err
	}
	rows, err := t.tx.Query(r.Context(), "SELECT id,email,role,COALESCE(company_id,''),active,totp_secret IS NOT NULL,version FROM accounts WHERE strpos(email,lower($1))>0 ORDER BY email,id LIMIT $2 OFFSET $3", q, size, (page-1)*size)
	if err != nil {
		return result{}, err
	}
	defer rows.Close()
	items := []teamUserDTO{}
	for rows.Next() {
		var v teamUserDTO
		if err = rows.Scan(&v.ID, &v.Email, &v.Role, &v.CompanyID, &v.Active, &v.MFAEnrolled, &v.Version); err != nil {
			return result{}, err
		}
		items = append(items, v)
	}
	return result{body: map[string]any{"items": items, "total": total, "page": page, "pageSize": size}}, rows.Err()
}
func (a *App) activity(r *http.Request, t *transaction, actor, record, action string) error {
	if !opaqueID.MatchString(actor) || !opaqueID.MatchString(record) || (action != "account_state" && action != "assignment_state") {
		return deny(422, "validation_failed")
	}
	_, err := t.tx.Exec(r.Context(), "INSERT INTO activity_events(id,actor_id,record_id,action,occurred_at,expires_at) VALUES($1,$2,$3,$4,$5,$6)", auth.RandomHex(16), actor, record, action, t.now, t.now.Add(30*24*time.Hour))
	return err
}
func (a *App) editTeamUser(r *http.Request, t *transaction) (result, error) {
	actor, err := a.super(r, t)
	if err != nil {
		return result{}, err
	}
	id := chi.URLParam(r, "id")
	if !opaqueID.MatchString(id) {
		return result{}, deny(404, "not_found")
	}
	var in struct {
		Active  *bool `json:"active"`
		Version int64 `json:"version"`
	}
	if err = decode(r, &in); err != nil {
		return result{}, err
	}
	if in.Active == nil || in.Version < 1 {
		return result{}, deny(422, "validation_failed")
	}
	u, err := t.q.LockAccount(r.Context(), id)
	if errors.Is(err, pgx.ErrNoRows) {
		return result{}, deny(404, "not_found")
	}
	if err != nil {
		return result{}, err
	}
	if u.Role == "super_admin" || u.ID == actor.ID {
		return result{}, deny(403, "forbidden")
	}
	if u.Version != in.Version {
		return result{}, deny(409, "conflict")
	}
	if u.Active != *in.Active {
		_, err = t.tx.Exec(r.Context(), "UPDATE accounts SET active=$2,version=version+1 WHERE id=$1", id, *in.Active)
		if err != nil {
			return result{}, err
		}
		_, err = t.tx.Exec(r.Context(), "DELETE FROM sessions WHERE account_id=$1", id)
		if err != nil {
			return result{}, err
		}
		if !*in.Active {
			_, err = t.tx.Exec(r.Context(), "UPDATE recruiter_assignments SET active=false,version=version+1,updated_at=$2 WHERE account_id=$1 AND active=true", id, t.now)
			if err != nil {
				return result{}, err
			}
		}
		if err = a.activity(r, t, actor.ID, id, "account_state"); err != nil {
			return result{}, err
		}
		u.Active = *in.Active
		u.Version++
	}
	return result{body: teamUserView(u)}, nil
}

type assignmentDTO struct {
	ID        string    `json:"id"`
	JobID     string    `json:"jobId"`
	JobTitle  string    `json:"jobTitle"`
	AccountID string    `json:"accountId"`
	Email     string    `json:"email"`
	Active    bool      `json:"active"`
	Version   int64     `json:"version"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (a *App) assignments(r *http.Request, t *transaction) (result, error) {
	if _, err := a.super(r, t); err != nil {
		return result{}, err
	}
	if err := queryKeys(r, "page", "pageSize"); err != nil {
		return result{}, err
	}
	page, size, err := pagination(r)
	if err != nil {
		return result{}, err
	}
	var total int
	err = t.tx.QueryRow(r.Context(), "SELECT count(*) FROM recruiter_assignments").Scan(&total)
	if err != nil {
		return result{}, err
	}
	rows, err := t.tx.Query(r.Context(), "SELECT x.id,x.job_id,j.title,x.account_id,a.email,x.active,x.version,x.updated_at FROM recruiter_assignments x JOIN jobs j ON j.id=x.job_id JOIN accounts a ON a.id=x.account_id ORDER BY x.updated_at DESC,x.id DESC LIMIT $1 OFFSET $2", size, (page-1)*size)
	if err != nil {
		return result{}, err
	}
	defer rows.Close()
	items := []assignmentDTO{}
	for rows.Next() {
		var v assignmentDTO
		if err = rows.Scan(&v.ID, &v.JobID, &v.JobTitle, &v.AccountID, &v.Email, &v.Active, &v.Version, &v.UpdatedAt); err != nil {
			return result{}, err
		}
		items = append(items, v)
	}
	return result{body: map[string]any{"items": items, "total": total, "page": page, "pageSize": size}}, rows.Err()
}
func (a *App) createAssignment(r *http.Request, t *transaction) (result, error) {
	actor, err := a.super(r, t)
	if err != nil {
		return result{}, err
	}
	var in struct {
		JobID     string `json:"jobId"`
		AccountID string `json:"accountId"`
	}
	if err = decode(r, &in); err != nil {
		return result{}, err
	}
	if !opaqueID.MatchString(in.JobID) || !opaqueID.MatchString(in.AccountID) {
		return result{}, deny(422, "validation_failed")
	}
	u, err := t.q.LockAccount(r.Context(), in.AccountID)
	if errors.Is(err, pgx.ErrNoRows) {
		return result{}, deny(422, "validation_failed")
	}
	if err != nil {
		return result{}, err
	}
	if u.Role != "recruiter" || !u.Active {
		return result{}, deny(422, "validation_failed")
	}
	var job string
	err = t.tx.QueryRow(r.Context(), "SELECT id FROM jobs WHERE id=$1 FOR SHARE", in.JobID).Scan(&job)
	if errors.Is(err, pgx.ErrNoRows) {
		return result{}, deny(422, "validation_failed")
	}
	if err != nil {
		return result{}, err
	}
	id := auth.RandomHex(16)
	_, err = t.tx.Exec(r.Context(), "INSERT INTO recruiter_assignments(id,job_id,account_id,updated_at) VALUES($1,$2,$3,$4)", id, in.JobID, in.AccountID, t.now)
	if err != nil {
		return result{}, companyError(err)
	}
	if err = a.activity(r, t, actor.ID, id, "assignment_state"); err != nil {
		return result{}, err
	}
	return result{status: 201, body: map[string]any{"id": id, "jobId": job, "accountId": u.ID, "active": true, "version": 1}}, nil
}
func (a *App) editAssignment(r *http.Request, t *transaction) (result, error) {
	actor, err := a.super(r, t)
	if err != nil {
		return result{}, err
	}
	id := chi.URLParam(r, "id")
	if !opaqueID.MatchString(id) {
		return result{}, deny(404, "not_found")
	}
	var in struct {
		Active  *bool `json:"active"`
		Version int64 `json:"version"`
	}
	if err = decode(r, &in); err != nil {
		return result{}, err
	}
	if in.Active == nil || in.Version < 1 {
		return result{}, deny(422, "validation_failed")
	}
	// Discover immutable target before locks; account precedes assignment, also
	// when an account deactivation revokes all current assignments.
	var accountID string
	err = t.tx.QueryRow(r.Context(), "SELECT account_id FROM recruiter_assignments WHERE id=$1", id).Scan(&accountID)
	if errors.Is(err, pgx.ErrNoRows) {
		return result{}, deny(404, "not_found")
	}
	if err != nil {
		return result{}, err
	}
	u, err := t.q.LockAccount(r.Context(), accountID)
	if err != nil {
		return result{}, err
	}
	if *in.Active && (!u.Active || u.Role != "recruiter") {
		return result{}, deny(422, "validation_failed")
	}
	var active bool
	var version int64
	err = t.tx.QueryRow(r.Context(), "SELECT active,version FROM recruiter_assignments WHERE id=$1 FOR UPDATE", id).Scan(&active, &version)
	if err != nil {
		return result{}, err
	}
	if version != in.Version {
		return result{}, deny(409, "conflict")
	}
	if active != *in.Active {
		_, err = t.tx.Exec(r.Context(), "UPDATE recruiter_assignments SET active=$2,version=version+1,updated_at=$3 WHERE id=$1", id, *in.Active, t.now)
		if err != nil {
			return result{}, err
		}
		if err = a.activity(r, t, actor.ID, id, "assignment_state"); err != nil {
			return result{}, err
		}
		version++
	}
	return result{body: map[string]any{"id": id, "active": *in.Active, "version": version}}, nil
}
func (a *App) team(r *http.Request, t *transaction, role string) (store.Account, error) {
	s, err := a.readSession(r, t, false)
	if err != nil {
		return store.Account{}, err
	}
	u, err := a.account(r, t, s)
	if err != nil {
		return u, err
	}
	if s.Phase != "full" || len(u.TotpSecret) == 0 || u.Role != role {
		return u, deny(403, "forbidden")
	}
	_, err = t.tx.Exec(r.Context(), "UPDATE sessions SET touched_at=$2 WHERE token_hash=$1", s.TokenHash, t.now)
	return u, err
}
func (a *App) scopedJobs(role string) endpoint {
	return func(r *http.Request, t *transaction) (result, error) {
		u, err := a.team(r, t, role)
		if err != nil {
			return result{}, err
		}
		if err = queryKeys(r, "page", "pageSize", "jobId"); err != nil {
			return result{}, err
		}
		page, size, err := pagination(r)
		if err != nil {
			return result{}, err
		}
		id := r.URL.Query().Get("jobId")
		if id != "" && !opaqueID.MatchString(id) {
			return result{}, deny(404, "not_found")
		}
		// Role is a server constant, never a request/header-selected SQL fragment.
		scope := "j.company_id=$1"
		owner := u.CompanyID.String
		if role == "recruiter" {
			scope = "EXISTS(SELECT 1 FROM recruiter_assignments x WHERE x.job_id=j.id AND x.account_id=$1 AND x.active=true)"
			owner = u.ID
		}
		var total int
		err = t.tx.QueryRow(r.Context(), "SELECT count(*) FROM jobs j WHERE "+scope+" AND ($2='' OR j.id=$2)", owner, id).Scan(&total)
		if err != nil {
			return result{}, err
		}
		if id != "" && total == 0 {
			return result{}, deny(404, "not_found")
		}
		rows, err := t.tx.Query(r.Context(), "SELECT j.id,j.title,c.name,j.status,j.closes_at FROM jobs j JOIN companies c ON c.id=j.company_id WHERE "+scope+" AND ($2='' OR j.id=$2) ORDER BY j.posted_at DESC,j.id DESC LIMIT $3 OFFSET $4", owner, id, size, (page-1)*size)
		if err != nil {
			return result{}, err
		}
		defer rows.Close()
		type item struct {
			ID       string    `json:"id"`
			Title    string    `json:"title"`
			Employer string    `json:"employer"`
			Status   string    `json:"status"`
			ClosesAt time.Time `json:"closesAt"`
		}
		items := []item{}
		for rows.Next() {
			var v item
			if err = rows.Scan(&v.ID, &v.Title, &v.Employer, &v.Status, &v.ClosesAt); err != nil {
				return result{}, err
			}
			items = append(items, v)
		}
		return result{body: map[string]any{"items": items, "total": total, "page": page, "pageSize": size}}, rows.Err()
	}
}
func (a *App) overview(r *http.Request, t *transaction) (result, error) {
	if _, err := a.super(r, t); err != nil {
		return result{}, err
	}
	if err := queryKeys(r); err != nil {
		return result{}, err
	}
	var companies, jobs, team, assignments int
	err := t.tx.QueryRow(r.Context(), "SELECT (SELECT count(*) FROM companies),(SELECT count(*) FROM jobs),(SELECT count(*) FROM accounts WHERE active=true),(SELECT count(*) FROM recruiter_assignments x JOIN accounts a ON a.id=x.account_id WHERE x.active=true AND a.active=true AND a.role='recruiter')").Scan(&companies, &jobs, &team, &assignments)
	return result{body: map[string]any{"companies": companies, "jobs": jobs, "activeTeam": team, "activeAssignments": assignments, "asOf": t.now}}, err
}
func (a *App) activityEvents(r *http.Request, t *transaction) (result, error) {
	if _, err := a.super(r, t); err != nil {
		return result{}, err
	}
	if err := queryKeys(r, "page", "pageSize"); err != nil {
		return result{}, err
	}
	page, size, err := pagination(r)
	if err != nil {
		return result{}, err
	}
	var total int
	err = t.tx.QueryRow(r.Context(), "SELECT count(*) FROM activity_events WHERE expires_at>$1", t.now).Scan(&total)
	if err != nil {
		return result{}, err
	}
	rows, err := t.tx.Query(r.Context(), "SELECT id,actor_id,record_id,action,occurred_at FROM activity_events WHERE expires_at>$1 ORDER BY occurred_at DESC,id DESC LIMIT $2 OFFSET $3", t.now, size, (page-1)*size)
	if err != nil {
		return result{}, err
	}
	defer rows.Close()
	type item struct {
		ID         string    `json:"id"`
		ActorID    string    `json:"actorId"`
		RecordID   string    `json:"recordId"`
		Action     string    `json:"action"`
		OccurredAt time.Time `json:"occurredAt"`
	}
	items := []item{}
	for rows.Next() {
		var v item
		if err = rows.Scan(&v.ID, &v.ActorID, &v.RecordID, &v.Action, &v.OccurredAt); err != nil {
			return result{}, err
		}
		items = append(items, v)
	}
	return result{body: map[string]any{"items": items, "total": total, "page": page, "pageSize": size}}, rows.Err()
}
