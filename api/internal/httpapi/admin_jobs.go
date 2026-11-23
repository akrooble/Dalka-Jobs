package httpapi

import (
	"errors"
	"net/http"
	"strings"
	"time"
	"unicode"
	"unicode/utf8"

	"github.com/akrooble/Dalka-Jobs/api/internal/auth"
	"github.com/akrooble/Dalka-Jobs/api/internal/store"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type jobInput struct {
	CompanyID         string `json:"companyId"`
	Title             string `json:"title"`
	Description       string `json:"description"`
	LocationID        string `json:"locationId"`
	CategoryID        string `json:"categoryId"`
	JobType           string `json:"jobType"`
	Arrangement       string `json:"arrangement"`
	ApplicationMethod string `json:"applicationMethod"`
	Destination       string `json:"destination"`
	ClosesAt          string `json:"closesAt"`
	Status            string `json:"status"`
	Version           int64  `json:"version"`
}
type adminJobDTO struct {
	jobDTO
	CompanyID string    `json:"companyId"`
	Status    string    `json:"status"`
	Version   int64     `json:"version"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func adminView(j store.AdminJobRow) adminJobDTO {
	return adminJobDTO{jobDTO{j.ID, j.Slug, j.Title, j.Description, j.Employer, j.EmployerType, j.LocationID, j.Location, j.CategoryID, j.Category, j.JobType, j.Arrangement, j.ApplicationMethod, j.Destination, j.PostedAt.Time, j.ClosesAt.Time}, j.CompanyID, j.Status, j.Version, j.UpdatedAt.Time}
}
func boundedText(value string, min, max int, multiline bool) bool {
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
func (v *jobInput) validate(now time.Time, create bool) (time.Time, error) {
	v.Title = strings.TrimSpace(v.Title)
	v.Description = strings.TrimSpace(v.Description)
	v.Destination = strings.TrimSpace(v.Destination)
	closing, err := time.Parse(time.RFC3339, v.ClosesAt)
	if err != nil || closing.Year() < 2000 || closing.Year() > 9999 || closing.Second() != 0 || closing.Nanosecond() != 0 || closing.Format(time.RFC3339) != v.ClosesAt {
		return time.Time{}, deny(422, "validation_failed")
	}
	if !opaqueID.MatchString(v.CompanyID) || !boundedText(v.Title, 3, 160, false) || !boundedText(v.Description, 1, 20000, true) || !boundedText(v.Destination, 0, 2048, false) || !validDestination(v.ApplicationMethod, v.Destination) {
		return time.Time{}, deny(422, "validation_failed")
	}
	if v.JobType != "Full-time" && v.JobType != "Contract" && v.JobType != "Part-time" {
		return time.Time{}, deny(422, "validation_failed")
	}
	if v.Arrangement != "On-site" && v.Arrangement != "Hybrid" && v.Arrangement != "Remote" {
		return time.Time{}, deny(422, "validation_failed")
	}
	if create {
		if v.Version != 0 || v.Status != "draft" {
			return time.Time{}, deny(422, "validation_failed")
		}
	} else if v.Version < 1 {
		return time.Time{}, deny(422, "validation_failed")
	}
	if v.Status != "draft" && v.Status != "published" && v.Status != "archived" {
		return time.Time{}, deny(422, "validation_failed")
	}
	if v.Status == "published" && (!closing.After(now) || v.ApplicationMethod == "Dalka recruitment") {
		return time.Time{}, deny(422, "validation_failed")
	}
	return closing.UTC(), nil
}
func jobWriteError(err error) error {
	var p *pgconn.PgError
	if errors.As(err, &p) {
		switch p.Code {
		case "23503", "23514":
			return deny(422, "validation_failed")
		case "23505":
			return deny(409, "conflict")
		}
	}
	return err
}
func jobReferences(r *http.Request, t *transaction, v jobInput) error {
	// Read locks preserve references against future list/company administration.
	var company string
	if err := t.tx.QueryRow(r.Context(), "SELECT id FROM companies WHERE id=$1 FOR SHARE", v.CompanyID).Scan(&company); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return deny(422, "validation_failed")
		}
		return err
	}
	for _, ref := range []struct{ id, kind string }{{v.CategoryID, "category"}, {v.LocationID, "location"}} {
		var id string
		if err := t.tx.QueryRow(r.Context(), "SELECT id FROM managed_lists WHERE id=$1 AND kind=$2 AND active=true FOR SHARE", ref.id, ref.kind).Scan(&id); err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return deny(422, "validation_failed")
			}
			return err
		}
	}
	return nil
}
func loadAdminJob(r *http.Request, t *transaction, id string) (result, error) {
	row, err := t.q.AdminJob(r.Context(), id)
	if errors.Is(err, pgx.ErrNoRows) {
		return result{}, deny(404, "not_found")
	}
	return result{body: adminView(row)}, err
}
func (a *App) adminJob(r *http.Request, t *transaction) (result, error) {
	if _, err := a.super(r, t); err != nil {
		return result{}, err
	}
	id := chi.URLParam(r, "id")
	if !opaqueID.MatchString(id) {
		return result{}, deny(404, "not_found")
	}
	if err := queryKeys(r); err != nil {
		return result{}, err
	}
	return loadAdminJob(r, t, id)
}
func (a *App) createJob(r *http.Request, t *transaction) (result, error) {
	if _, err := a.super(r, t); err != nil {
		return result{}, err
	}
	if err := queryKeys(r); err != nil {
		return result{}, err
	}
	var v jobInput
	if err := decode(r, &v); err != nil {
		return result{}, err
	}
	closing, err := v.validate(t.now, true)
	if err != nil {
		return result{}, err
	}
	if err = jobReferences(r, t, v); err != nil {
		return result{}, err
	}
	id := auth.RandomHex(16)
	_, err = t.q.CreateJob(r.Context(), store.CreateJobParams{ID: id, CompanyID: v.CompanyID, Slug: "job-" + id, Title: v.Title, Description: v.Description, LocationID: v.LocationID, CategoryID: v.CategoryID, JobType: v.JobType, Arrangement: v.Arrangement, ApplicationMethod: v.ApplicationMethod, Destination: v.Destination, PostedAt: ts(t.now), ClosesAt: ts(closing)})
	if err != nil {
		return result{}, jobWriteError(err)
	}
	out, err := loadAdminJob(r, t, id)
	out.status = 201
	return out, err
}
func (a *App) editJob(r *http.Request, t *transaction) (result, error) {
	if _, err := a.super(r, t); err != nil {
		return result{}, err
	}
	id := chi.URLParam(r, "id")
	if !opaqueID.MatchString(id) {
		return result{}, deny(404, "not_found")
	}
	if err := queryKeys(r); err != nil {
		return result{}, err
	}
	var v jobInput
	if err := decode(r, &v); err != nil {
		return result{}, err
	}
	closing, err := v.validate(t.now, false)
	if err != nil {
		return result{}, err
	}
	current, err := t.q.AdminJob(r.Context(), id)
	if errors.Is(err, pgx.ErrNoRows) {
		return result{}, deny(404, "not_found")
	}
	if err != nil {
		return result{}, err
	}
	if current.CompanyID != v.CompanyID {
		return result{}, deny(422, "validation_failed")
	}
	if current.Version != v.Version {
		return result{}, deny(409, "conflict")
	}
	if err = jobReferences(r, t, v); err != nil {
		return result{}, err
	}
	_, err = t.q.EditJob(r.Context(), store.EditJobParams{ID: id, Title: v.Title, Description: v.Description, LocationID: v.LocationID, CategoryID: v.CategoryID, JobType: v.JobType, Arrangement: v.Arrangement, ApplicationMethod: v.ApplicationMethod, Destination: v.Destination, ClosesAt: ts(closing), Status: v.Status, UpdatedAt: ts(t.now), Version: v.Version, CompanyID: v.CompanyID})
	if errors.Is(err, pgx.ErrNoRows) {
		return result{}, deny(409, "conflict")
	}
	if err != nil {
		return result{}, jobWriteError(err)
	}
	return loadAdminJob(r, t, id)
}
func (a *App) adminJobs(r *http.Request, t *transaction) (result, error) {
	if _, err := a.super(r, t); err != nil {
		return result{}, err
	}
	if err := queryKeys(r, "q", "status", "companyId", "page", "pageSize"); err != nil {
		return result{}, err
	}
	page, size, err := pagination(r)
	if err != nil {
		return result{}, err
	}
	p := r.URL.Query()
	q := strings.TrimSpace(p.Get("q"))
	status := p.Get("status")
	company := p.Get("companyId")
	if !boundedText(q, 0, 160, false) || status != "" && status != "draft" && status != "published" && status != "archived" || company != "" && !opaqueID.MatchString(company) {
		return result{}, deny(422, "validation_failed")
	}
	const from = ` FROM jobs j JOIN companies c ON c.id=j.company_id WHERE strpos(lower(j.title||' '||c.name),lower($1))>0 AND ($2='' OR j.status=$2) AND ($3='' OR j.company_id=$3)`
	var total int
	if err = t.tx.QueryRow(r.Context(), "SELECT count(*)"+from, q, status, company).Scan(&total); err != nil {
		return result{}, err
	}
	rows, err := t.tx.Query(r.Context(), "SELECT j.id,j.slug,j.title,c.name,j.status,j.version,j.closes_at"+from+" ORDER BY j.updated_at DESC,j.id DESC LIMIT $4 OFFSET $5", q, status, company, size, (page-1)*size)
	if err != nil {
		return result{}, err
	}
	defer rows.Close()
	type summary struct {
		ID       string    `json:"id"`
		Slug     string    `json:"slug"`
		Title    string    `json:"title"`
		Employer string    `json:"employer"`
		Status   string    `json:"status"`
		Version  int64     `json:"version"`
		ClosesAt time.Time `json:"closesAt"`
	}
	items := []summary{}
	for rows.Next() {
		var j summary
		if err = rows.Scan(&j.ID, &j.Slug, &j.Title, &j.Employer, &j.Status, &j.Version, &j.ClosesAt); err != nil {
			return result{}, err
		}
		items = append(items, j)
	}
	return result{body: map[string]any{"items": items, "total": total, "page": page, "pageSize": size}}, rows.Err()
}
