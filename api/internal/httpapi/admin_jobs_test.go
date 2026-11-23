package httpapi

import (
	"context"
	"errors"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/jackc/pgx/v5"
)

func validJobInput() jobInput {
	return jobInput{CompanyID: strings.Repeat("a", 32), Title: "Programme officer", Description: "Plain text job description", LocationID: "loc-mogadishu", CategoryID: "cat-ngo", JobType: "Full-time", Arrangement: "On-site", ApplicationMethod: "Email", Destination: "jobs@example.invalid", ClosesAt: "2026-11-11T12:00:00+03:00", Status: "draft"}
}
func TestJobPublicationAndFieldGuards(t *testing.T) {
	now := time.Date(2026, 11, 10, 9, 0, 0, 0, time.UTC)
	for _, tt := range []struct {
		name   string
		change func(*jobInput)
		create bool
		ok     bool
	}{
		{"new draft", func(v *jobInput) {}, true, true},
		{"cannot create published", func(v *jobInput) { v.Status = "published" }, true, false},
		{"cannot create forged version", func(v *jobInput) { v.Version = 1 }, true, false},
		{"publish external", func(v *jobInput) { v.Version = 1; v.Status = "published" }, false, true},
		{"deadline equality", func(v *jobInput) { v.Version = 1; v.Status = "published"; v.ClosesAt = "2026-11-10T12:00:00+03:00" }, false, false},
		{"past draft", func(v *jobInput) { v.ClosesAt = "2026-11-09T12:00:00+03:00" }, true, true},
		{"past archive", func(v *jobInput) { v.Version = 1; v.Status = "archived"; v.ClosesAt = "2026-11-09T12:00:00+03:00" }, false, true},
		{"on-site draft", func(v *jobInput) { v.ApplicationMethod = "Dalka recruitment"; v.Destination = "" }, true, true},
		{"on-site publication blocked", func(v *jobInput) {
			v.ApplicationMethod = "Dalka recruitment"
			v.Destination = ""
			v.Status = "published"
			v.Version = 1
		}, false, false},
		{"destination injection", func(v *jobInput) { v.Destination = "jobs@example.invalid\r\nBcc:other@example.invalid" }, true, false},
		{"wrong method", func(v *jobInput) { v.ApplicationMethod = "unknown" }, true, false},
		{"bad title", func(v *jobInput) { v.Title = "ab" }, true, false},
		{"title control", func(v *jobInput) { v.Title = "bad\x01title" }, true, false},
		{"unicode title", func(v *jobInput) { v.Title = "Hawl wadeen caafimaad" }, true, true},
		{"description bound", func(v *jobInput) { v.Description = strings.Repeat("a", 20001) }, true, false},
		{"multiline description", func(v *jobInput) { v.Description = "A role\n\twith details" }, true, true},
		{"nul description", func(v *jobInput) { v.Description = "bad\x00text" }, true, false},
		{"invalid company", func(v *jobInput) { v.CompanyID = "forged" }, true, false},
		{"wrong type", func(v *jobInput) { v.JobType = "Unapproved" }, true, false},
		{"wrong arrangement", func(v *jobInput) { v.Arrangement = "Unapproved" }, true, false},
		{"wrong status", func(v *jobInput) { v.Status = "deleted" }, true, false},
		{"missing version", func(v *jobInput) {}, false, false},
		{"offset required", func(v *jobInput) { v.ClosesAt = "2026-11-11T12:00:00" }, true, false},
		{"minute precision", func(v *jobInput) { v.ClosesAt = "2026-11-11T12:00:01Z" }, true, false},
		{"fraction rejected", func(v *jobInput) { v.ClosesAt = "2026-11-11T12:00:00.000Z" }, true, false},
		{"invalid calendar", func(v *jobInput) { v.ClosesAt = "2026-02-30T12:00:00Z" }, true, false},
	} {
		t.Run(tt.name, func(t *testing.T) {
			v := validJobInput()
			tt.change(&v)
			_, err := v.validate(now, tt.create)
			if (err == nil) != tt.ok {
				t.Fatalf("validation: %v", err)
			}
		})
	}
}
func TestJobTransportRejectsUntrustedWritesBeforeDatabase(t *testing.T) {
	calls := 0
	app := New(func(context.Context) (*pgx.Conn, error) { calls++; return nil, errors.New("private error") }, "http://127.0.0.1:3000", []byte(strings.Repeat("x", 32)))
	for _, method := range []string{"POST", "PATCH"} {
		path := "/api/v1/admin/jobs"
		if method == "PATCH" {
			path += "/" + strings.Repeat("a", 32)
		}
		r := httptest.NewRequest(method, path, strings.NewReader(`{}`))
		r.Header.Set("Origin", "https://attacker.invalid")
		w := httptest.NewRecorder()
		app.Handler().ServeHTTP(w, r)
		if w.Code != 403 {
			t.Fatal("origin bypass")
		}
	}
	if calls != 0 {
		t.Fatal("untrusted write reached database")
	}
}

func TestJobAuthoringRejectsAmbiguousWebsiteHosts(t *testing.T) {
	for _, destination := range []string{"https://127.1/apply", "https://0x7f.0.0.1/apply", "https://2130706433/apply", "https://0177.0.0.1/apply", "https://127.0.0.1./apply", "https://host.local./apply", "https://host.internal/apply", "https://host.localhost/apply", "https://bad_host.example/apply", "https://-bad.example/apply", "https://good..example/apply"} {
		v := validJobInput()
		v.ApplicationMethod = "Company website"
		v.Destination = destination
		if _, err := v.validate(time.Now(), true); err == nil {
			t.Fatalf("unsafe browser destination accepted: %s", destination)
		}
	}
	for _, destination := range []string{"https://careers.example.org/apply", "https://example.invalid/apply?role=1", "https://jobs.xn--p1ai/apply"} {
		if !validDestination("Company website", destination) {
			t.Fatalf("valid DNS destination refused: %s", destination)
		}
	}
}
