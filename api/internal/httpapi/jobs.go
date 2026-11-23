package httpapi

import (
	"errors"
	"fmt"
	"net"
	"net/http"
	"net/mail"
	"net/url"
	"regexp"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/akrooble/Dalka-Jobs/api/internal/store"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
)

type jobDTO struct {
	ID                string    `json:"id"`
	Slug              string    `json:"slug"`
	Title             string    `json:"title"`
	Description       string    `json:"description"`
	Employer          string    `json:"employer"`
	EmployerType      string    `json:"employerType"`
	LocationID        string    `json:"locationId"`
	Location          string    `json:"location"`
	CategoryID        string    `json:"categoryId"`
	Category          string    `json:"category"`
	JobType           string    `json:"jobType"`
	Arrangement       string    `json:"arrangement"`
	ApplicationMethod string    `json:"applicationMethod"`
	Destination       string    `json:"destination"`
	PostedAt          time.Time `json:"postedAt"`
	ClosesAt          time.Time `json:"closesAt"`
}

func publicView(j store.PublicJobRow) jobDTO {
	destination := j.Destination
	if !validDestination(j.ApplicationMethod, destination) {
		destination = ""
	}
	return jobDTO{j.ID, j.Slug, j.Title, j.Description, j.Employer, j.EmployerType, j.LocationID, j.Location, j.CategoryID, j.Category, j.JobType, j.Arrangement, j.ApplicationMethod, destination, j.PostedAt.Time, j.ClosesAt.Time}
}
func validDestination(method, value string) bool {
	switch method {
	case "Dalka recruitment":
		return value == ""
	case "Email":
		m, err := mail.ParseAddress(value)
		return err == nil && m.Address == value && !strings.ContainsAny(value, "\r\n")
	case "WhatsApp":
		u, err := url.Parse(value)
		return err == nil && u.Scheme == "https" && u.Host == "wa.me" && u.User == nil && u.RawQuery == "" && u.Fragment == "" && regexp.MustCompile(`^/[1-9][0-9]{6,14}$`).MatchString(u.Path)
	case "Company website":
		u, err := url.Parse(value)
		if err != nil || u.Scheme != "https" || u.User != nil || u.Host == "" || u.Fragment != "" || u.Port() != "" {
			return false
		}
		host := strings.ToLower(u.Hostname())
		if net.ParseIP(host) != nil || len(host) > 253 || strings.HasSuffix(host, ".") || strings.HasSuffix(host, ".localhost") || strings.HasSuffix(host, ".local") || strings.HasSuffix(host, ".internal") || strings.ContainsAny(value, "\r\n\\") {
			return false
		}
		labels := strings.Split(host, ".")
		if len(labels) < 2 {
			return false
		}
		// Browser URL parsers accept shortened, octal and hexadecimal IPv4 forms
		// that net.ParseIP rejects. A DNS-style alphabetic/punycode TLD excludes
		// those alternatives; strict labels also reject ambiguous host syntax.
		if !regexp.MustCompile(`^(?:[a-z]{2,63}|xn--[a-z0-9-]{2,59})$`).MatchString(labels[len(labels)-1]) {
			return false
		}
		for _, label := range labels {
			if !regexp.MustCompile(`^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$`).MatchString(label) {
				return false
			}
		}
		return true
	}
	return false
}
func (a *App) lists(r *http.Request, t *transaction) (result, error) {
	if err := queryKeys(r); err != nil {
		return result{}, err
	}
	rows, err := t.q.Lists(r.Context())
	return result{body: map[string]any{"items": rows}}, err
}
func (a *App) job(r *http.Request, t *transaction) (result, error) {
	slug := chi.URLParam(r, "slug")
	if len(slug) > 180 || !regexp.MustCompile(`^[a-z0-9]+(-[a-z0-9]+)*$`).MatchString(slug) {
		return result{}, deny(404, "not_found")
	}
	row, err := t.q.PublicJob(r.Context(), store.PublicJobParams{Slug: slug, ClosesAt: ts(t.now)})
	if errors.Is(err, pgx.ErrNoRows) {
		return result{}, deny(404, "not_found")
	}
	return result{body: publicView(row)}, err
}
func (a *App) jobs(r *http.Request, t *transaction) (result, error) {
	if err := queryKeys(r, "q", "locationId", "categoryId", "employerType", "jobType", "closingSoon", "sort", "page", "pageSize"); err != nil {
		return result{}, err
	}
	page, size, err := pagination(r)
	if err != nil {
		return result{}, err
	}
	params := r.URL.Query()
	keyword := strings.TrimSpace(params.Get("q"))
	if utf8.RuneCountInString(keyword) > 160 {
		return result{}, deny(422, "validation_failed")
	}
	where := []string{"j.status='published'", "j.closes_at>$1"}
	args := []any{t.now}
	add := func(expr string, value any) {
		args = append(args, value)
		where = append(where, fmt.Sprintf(expr, len(args)))
	}
	for _, word := range strings.Fields(keyword) {
		add("strpos(lower(j.title||' '||c.name),lower($%d))>0", word)
	}
	for _, filter := range []struct{ key, column, kind string }{{"locationId", "j.location_id", "location"}, {"categoryId", "j.category_id", "category"}} {
		value := params.Get(filter.key)
		if value != "" {
			var exists bool
			err = t.tx.QueryRow(r.Context(), "SELECT EXISTS(SELECT 1 FROM managed_lists WHERE id=$1 AND kind=$2 AND active=true)", value, filter.kind).Scan(&exists)
			if err != nil {
				return result{}, err
			}
			if !exists {
				return result{}, deny(422, "validation_failed")
			}
			add(filter.column+"=$%d", value)
		}
	}
	if value := params.Get("employerType"); value != "" {
		if !companyFields("ok", value) {
			return result{}, deny(422, "validation_failed")
		}
		add("c.employer_type=$%d", value)
	}
	if value := params.Get("jobType"); value != "" {
		if value != "Full-time" && value != "Contract" && value != "Part-time" {
			return result{}, deny(422, "validation_failed")
		}
		add("j.job_type=$%d", value)
	}
	if value := params.Get("closingSoon"); value != "" {
		if value != "true" && value != "false" {
			return result{}, deny(422, "validation_failed")
		}
		if value == "true" {
			add("j.closes_at<=$%d", t.now.Add(168*time.Hour))
		}
	}
	order := "j.posted_at DESC,j.id DESC"
	if value := params.Get("sort"); value != "" && value != "newest" {
		if value != "closing" {
			return result{}, deny(422, "validation_failed")
		}
		order = "j.closes_at ASC,j.id DESC"
	}
	from := " FROM jobs j JOIN companies c ON c.id=j.company_id JOIN managed_lists l ON l.id=j.location_id AND l.kind='location' JOIN managed_lists g ON g.id=j.category_id AND g.kind='category' WHERE " + strings.Join(where, " AND ")
	var total int
	if err = t.tx.QueryRow(r.Context(), "SELECT count(*)"+from, args...).Scan(&total); err != nil {
		return result{}, err
	}
	args = append(args, size, (page-1)*size)
	query := "SELECT j.id,j.slug,j.title,j.description,c.name,c.employer_type,j.location_id,l.label,j.category_id,g.label,j.job_type,j.arrangement,j.application_method,j.destination,j.posted_at,j.closes_at" + from + fmt.Sprintf(" ORDER BY %s LIMIT $%d OFFSET $%d", order, len(args)-1, len(args))
	rows, err := t.tx.Query(r.Context(), query, args...)
	if err != nil {
		return result{}, err
	}
	defer rows.Close()
	items := []jobDTO{}
	for rows.Next() {
		var j jobDTO
		if err = rows.Scan(&j.ID, &j.Slug, &j.Title, &j.Description, &j.Employer, &j.EmployerType, &j.LocationID, &j.Location, &j.CategoryID, &j.Category, &j.JobType, &j.Arrangement, &j.ApplicationMethod, &j.Destination, &j.PostedAt, &j.ClosesAt); err != nil {
			return result{}, err
		}
		if !validDestination(j.ApplicationMethod, j.Destination) {
			j.Destination = ""
		}
		items = append(items, j)
	}
	return result{body: map[string]any{"items": items, "total": total, "page": page, "pageSize": size}}, rows.Err()
}
