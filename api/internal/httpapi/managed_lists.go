package httpapi

import (
	"errors"
	"net/http"
	"regexp"
	"strings"
	"time"
	"unicode"

	"github.com/akrooble/Dalka-Jobs/api/internal/auth"
	"github.com/akrooble/Dalka-Jobs/api/internal/store"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

var managedID = regexp.MustCompile(`^(cat|loc)-[a-z0-9]+(-[a-z0-9]+)*$`)

func validManagedID(id string) bool { return len(id) <= 80 && managedID.MatchString(id) }
func listKind(kind string) bool     { return kind == "category" || kind == "location" }
func listLabel(value string) (string, error) {
	if strings.IndexFunc(value, unicode.IsControl) >= 0 {
		return "", deny(422, "validation_failed")
	}
	value = strings.TrimSpace(value)
	if !boundedText(value, 2, 100, false) {
		return "", deny(422, "validation_failed")
	}
	value = strings.Join(strings.Fields(value), " ")
	if !boundedText(value, 2, 100, false) {
		return "", deny(422, "validation_failed")
	}
	return value, nil
}

type managedListDTO struct {
	ID        string    `json:"id"`
	Kind      string    `json:"kind"`
	Label     string    `json:"label"`
	Active    bool      `json:"active"`
	Version   int64     `json:"version"`
	UpdatedAt time.Time `json:"updatedAt"`
	JobCount  int64     `json:"jobCount"`
}

func managedView(row store.AdminListRow) managedListDTO {
	return managedListDTO{row.ID, row.Kind, row.Label, row.Active, row.Version, row.UpdatedAt.Time, row.JobCount}
}
func loadManagedList(r *http.Request, t *transaction, id string) (result, error) {
	row, err := t.q.AdminList(r.Context(), id)
	if errors.Is(err, pgx.ErrNoRows) {
		return result{}, deny(404, "not_found")
	}
	return result{body: managedView(row)}, err
}
func managedError(err error) error {
	var p *pgconn.PgError
	if errors.As(err, &p) && p.Code == "23505" {
		return deny(409, "conflict")
	}
	return err
}
func (a *App) managedList(r *http.Request, t *transaction) (result, error) {
	if _, err := a.super(r, t); err != nil {
		return result{}, err
	}
	if err := queryKeys(r); err != nil {
		return result{}, err
	}
	id := chi.URLParam(r, "id")
	if !validManagedID(id) {
		return result{}, deny(404, "not_found")
	}
	return loadManagedList(r, t, id)
}
func (a *App) createManagedList(r *http.Request, t *transaction) (result, error) {
	if _, err := a.super(r, t); err != nil {
		return result{}, err
	}
	if err := queryKeys(r); err != nil {
		return result{}, err
	}
	var v struct {
		Kind  string `json:"kind"`
		Label string `json:"label"`
	}
	if err := decode(r, &v); err != nil {
		return result{}, err
	}
	label, err := listLabel(v.Label)
	if err != nil {
		return result{}, err
	}
	if !listKind(v.Kind) {
		return result{}, deny(422, "validation_failed")
	}
	prefix := "cat-"
	if v.Kind == "location" {
		prefix = "loc-"
	}
	id, err := t.q.CreateManagedList(r.Context(), store.CreateManagedListParams{ID: prefix + auth.RandomHex(16), Kind: v.Kind, Label: label, UpdatedAt: ts(t.now)})
	if err != nil {
		return result{}, managedError(err)
	}
	out, err := loadManagedList(r, t, id)
	out.status = 201
	return out, err
}
func (a *App) editManagedList(r *http.Request, t *transaction) (result, error) {
	if _, err := a.super(r, t); err != nil {
		return result{}, err
	}
	if err := queryKeys(r); err != nil {
		return result{}, err
	}
	id := chi.URLParam(r, "id")
	if !validManagedID(id) {
		return result{}, deny(404, "not_found")
	}
	var v struct {
		Label   string `json:"label"`
		Active  *bool  `json:"active"`
		Version int64  `json:"version"`
	}
	if err := decode(r, &v); err != nil {
		return result{}, err
	}
	label, err := listLabel(v.Label)
	if err != nil {
		return result{}, err
	}
	if v.Active == nil || v.Version < 1 {
		return result{}, deny(422, "validation_failed")
	}
	var version int64
	if err = t.tx.QueryRow(r.Context(), "SELECT version FROM managed_lists WHERE id=$1 FOR UPDATE", id).Scan(&version); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return result{}, deny(404, "not_found")
		}
		return result{}, err
	}
	if version != v.Version {
		return result{}, deny(409, "stale_list")
	}
	if !*v.Active {
		var used bool
		if err = t.tx.QueryRow(r.Context(), "SELECT EXISTS(SELECT 1 FROM jobs WHERE location_id=$1 OR category_id=$1)", id).Scan(&used); err != nil {
			return result{}, err
		}
		if used {
			return result{}, deny(409, "list_in_use")
		}
	}
	_, err = t.q.EditManagedList(r.Context(), store.EditManagedListParams{ID: id, Label: label, Active: *v.Active, UpdatedAt: ts(t.now), Version: v.Version})
	if errors.Is(err, pgx.ErrNoRows) {
		return result{}, deny(409, "stale_list")
	}
	if err != nil {
		return result{}, managedError(err)
	}
	return loadManagedList(r, t, id)
}
func (a *App) managedLists(r *http.Request, t *transaction) (result, error) {
	if _, err := a.super(r, t); err != nil {
		return result{}, err
	}
	if err := queryKeys(r, "q", "kind", "active", "page", "pageSize"); err != nil {
		return result{}, err
	}
	page, size, err := pagination(r)
	if err != nil {
		return result{}, err
	}
	p := r.URL.Query()
	q := strings.TrimSpace(p.Get("q"))
	kind := p.Get("kind")
	active := p.Get("active")
	if !boundedText(q, 0, 100, false) || kind != "" && !listKind(kind) || active != "" && active != "true" && active != "false" {
		return result{}, deny(422, "validation_failed")
	}
	const from = ` FROM managed_lists m WHERE strpos(lower(m.label),lower($1))>0 AND ($2='' OR m.kind=$2) AND ($3='' OR m.active::text=$3)`
	var total int
	if err = t.tx.QueryRow(r.Context(), "SELECT count(*)"+from, q, kind, active).Scan(&total); err != nil {
		return result{}, err
	}
	rows, err := t.tx.Query(r.Context(), "SELECT m.id,m.kind,m.label,m.active,m.version,m.updated_at,(SELECT count(*) FROM jobs j WHERE j.location_id=m.id OR j.category_id=m.id)"+from+" ORDER BY m.kind,lower(m.label),m.id LIMIT $4 OFFSET $5", q, kind, active, size, (page-1)*size)
	if err != nil {
		return result{}, err
	}
	defer rows.Close()
	items := []managedListDTO{}
	for rows.Next() {
		var row managedListDTO
		if err = rows.Scan(&row.ID, &row.Kind, &row.Label, &row.Active, &row.Version, &row.UpdatedAt, &row.JobCount); err != nil {
			return result{}, err
		}
		items = append(items, row)
	}
	return result{body: map[string]any{"items": items, "total": total, "page": page, "pageSize": size}}, rows.Err()
}
