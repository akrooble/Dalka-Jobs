package httpapi

import (
	"errors"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"unicode/utf8"

	"github.com/akrooble/Dalka-Jobs/api/internal/auth"
	"github.com/akrooble/Dalka-Jobs/api/internal/store"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

var opaqueID = regexp.MustCompile(`^[a-f0-9]{32}$`)

type companyDTO struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	EmployerType string `json:"employerType"`
	Version      int64  `json:"version"`
	CreatedAt    string `json:"createdAt"`
	UpdatedAt    string `json:"updatedAt"`
}

func companyView(c store.Company) companyDTO {
	return companyDTO{c.ID, c.Name, c.EmployerType, c.Version, c.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00"), c.UpdatedAt.Time.Format("2006-01-02T15:04:05Z07:00")}
}
func pagination(r *http.Request) (int, int, error) {
	page, size := 1, 20
	var err error
	if value := r.URL.Query().Get("page"); value != "" {
		page, err = strconv.Atoi(value)
		if err != nil {
			return 0, 0, deny(422, "validation_failed")
		}
	}
	if value := r.URL.Query().Get("pageSize"); value != "" {
		size, err = strconv.Atoi(value)
		if err != nil {
			return 0, 0, deny(422, "validation_failed")
		}
	}
	if page < 1 || page > 100000 || size < 1 || size > 50 {
		return 0, 0, deny(422, "validation_failed")
	}
	return page, size, nil
}
func queryKeys(r *http.Request, allowed ...string) error {
	for key, values := range r.URL.Query() {
		valid := false
		for _, a := range allowed {
			if key == a {
				valid = true
			}
		}
		if !valid || len(values) != 1 {
			return deny(422, "validation_failed")
		}
	}
	return nil
}
func companyFields(name, kind string) bool {
	return utf8.ValidString(name) && utf8.RuneCountInString(name) >= 2 && utf8.RuneCountInString(name) <= 160 && !strings.ContainsAny(name, "\r\n\t\x00") && (kind == "Private company" || kind == "NGO" || kind == "Government")
}
func companyError(err error) error {
	var p *pgconn.PgError
	if errors.As(err, &p) && p.Code == "23505" {
		return deny(409, "conflict")
	}
	return err
}
func (a *App) companies(r *http.Request, t *transaction) (result, error) {
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
	if utf8.RuneCountInString(q) > 160 {
		return result{}, deny(422, "validation_failed")
	}
	var total int
	err = t.tx.QueryRow(r.Context(), "SELECT count(*) FROM companies WHERE strpos(lower(name),lower($1))>0", q).Scan(&total)
	if err != nil {
		return result{}, err
	}
	rows, err := t.tx.Query(r.Context(), "SELECT id,name,employer_type,version,created_at,updated_at FROM companies WHERE strpos(lower(name),lower($1))>0 ORDER BY lower(name),id LIMIT $2 OFFSET $3", q, size, (page-1)*size)
	if err != nil {
		return result{}, err
	}
	defer rows.Close()
	items := []companyDTO{}
	for rows.Next() {
		var c store.Company
		if err = rows.Scan(&c.ID, &c.Name, &c.EmployerType, &c.Version, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return result{}, err
		}
		items = append(items, companyView(c))
	}
	return result{body: map[string]any{"items": items, "total": total, "page": page, "pageSize": size}}, rows.Err()
}
func (a *App) createCompany(r *http.Request, t *transaction) (result, error) {
	if _, err := a.super(r, t); err != nil {
		return result{}, err
	}
	var input struct {
		Name         string `json:"name"`
		EmployerType string `json:"employerType"`
	}
	if err := decode(r, &input); err != nil {
		return result{}, err
	}
	input.Name = strings.TrimSpace(input.Name)
	if !companyFields(input.Name, input.EmployerType) {
		return result{}, deny(422, "validation_failed")
	}
	c, err := t.q.CreateCompany(r.Context(), store.CreateCompanyParams{ID: auth.RandomHex(16), Name: input.Name, EmployerType: input.EmployerType})
	return result{status: 201, body: companyView(c)}, companyError(err)
}
func (a *App) editCompany(r *http.Request, t *transaction) (result, error) {
	if _, err := a.super(r, t); err != nil {
		return result{}, err
	}
	id := chi.URLParam(r, "id")
	if !opaqueID.MatchString(id) {
		return result{}, deny(404, "not_found")
	}
	var input struct {
		Name         string `json:"name"`
		EmployerType string `json:"employerType"`
		Version      int64  `json:"version"`
	}
	if err := decode(r, &input); err != nil {
		return result{}, err
	}
	input.Name = strings.TrimSpace(input.Name)
	if !companyFields(input.Name, input.EmployerType) || input.Version < 1 {
		return result{}, deny(422, "validation_failed")
	}
	c, err := t.q.EditCompany(r.Context(), store.EditCompanyParams{ID: id, Name: input.Name, EmployerType: input.EmployerType, Version: input.Version})
	if errors.Is(err, pgx.ErrNoRows) {
		_, err = t.q.CompanyByID(r.Context(), id)
		if errors.Is(err, pgx.ErrNoRows) {
			return result{}, deny(404, "not_found")
		}
		if err != nil {
			return result{}, err
		}
		return result{}, deny(409, "conflict")
	}
	return result{body: companyView(c)}, companyError(err)
}
func (a *App) company(r *http.Request, t *transaction) (result, error) {
	if _, err := a.super(r, t); err != nil {
		return result{}, err
	}
	id := chi.URLParam(r, "id")
	if !opaqueID.MatchString(id) {
		return result{}, deny(404, "not_found")
	}
	if err := queryKeys(r, "page", "pageSize"); err != nil {
		return result{}, err
	}
	page, size, err := pagination(r)
	if err != nil {
		return result{}, err
	}
	c, err := t.q.CompanyByID(r.Context(), id)
	if errors.Is(err, pgx.ErrNoRows) {
		return result{}, deny(404, "not_found")
	}
	if err != nil {
		return result{}, err
	}
	var total int
	err = t.tx.QueryRow(r.Context(), "SELECT count(*) FROM jobs WHERE company_id=$1", id).Scan(&total)
	if err != nil {
		return result{}, err
	}
	rows, err := t.tx.Query(r.Context(), "SELECT id,title,status,closes_at FROM jobs WHERE company_id=$1 ORDER BY posted_at DESC,id DESC LIMIT $2 OFFSET $3", id, size, (page-1)*size)
	if err != nil {
		return result{}, err
	}
	defer rows.Close()
	type association struct {
		ID     string `json:"id"`
		Title  string `json:"title"`
		Status string `json:"status"`
	}
	items := []association{}
	for rows.Next() {
		var v association
		var closing interface{}
		if err = rows.Scan(&v.ID, &v.Title, &v.Status, &closing); err != nil {
			return result{}, err
		}
		items = append(items, v)
	}
	return result{body: map[string]any{"company": companyView(c), "jobs": map[string]any{"items": items, "total": total, "page": page, "pageSize": size}}}, rows.Err()
}
