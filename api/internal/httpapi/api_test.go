package httpapi

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/jackc/pgx/v5"
)

func TestOriginAndRoutingNeverReachDatabase(t *testing.T) {
	calls := 0
	a := New(func(context.Context) (*pgx.Conn, error) { calls++; return nil, errors.New("secret database detail") }, "http://127.0.0.1:3000", []byte(strings.Repeat("x", 32)))
	handler := a.Handler()
	for _, v := range []struct {
		method, path, origin string
		status               int
	}{{"GET", "/api/v1/health", "", 200}, {"POST", "/api/v1/auth/password", "", 403}, {"POST", "/api/v1/auth/password", "http://attacker.invalid", 403}, {"GET", "/api/v1/unknown", "", 404}, {"DELETE", "/api/v1/admin/companies", "", 405}} {
		req := httptest.NewRequest(v.method, v.path, nil)
		if v.origin != "" {
			req.Header.Set("Origin", v.origin)
		}
		w := httptest.NewRecorder()
		handler.ServeHTTP(w, req)
		if w.Code != v.status {
			t.Fatalf("%s %s: %d", v.method, v.path, w.Code)
		}
		if w.Header().Get("Cache-Control") != "no-store" || w.Header().Get("Access-Control-Allow-Origin") != "" {
			t.Fatal("unsafe response policy")
		}
	}
	if calls != 0 {
		t.Fatal("untrusted transport reached database")
	}
	req := httptest.NewRequest("GET", "/api/v1/session", nil)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)
	if w.Code != 503 || strings.Contains(w.Body.String(), "secret database detail") {
		t.Fatal("database failure exposed")
	}
}
func TestDecoderLimitsUnknownFieldsAndTrailingJSON(t *testing.T) {
	for _, body := range []string{`null`, `[]`, `{"name":"first","name":"second"}`} {
		r := httptest.NewRequest("POST", "/", strings.NewReader(body))
		r.Header.Set("Content-Type", "application/json")
		var input struct {
			Name string `json:"name"`
		}
		if decode(r, &input) == nil {
			t.Fatal("non-object or duplicate-key body accepted")
		}
	}
	for _, v := range []struct {
		body, kind string
		ok         bool
	}{{`{"name":"Sample"}`, "application/json", true}, {`{"name":"Sample","role":"super_admin"}`, "application/json", false}, {`{"name":"Sample"}{}`, "application/json", false}, {`null`, "text/plain", false}, {strings.Repeat("x", 65537), "application/json", false}} {
		r := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(v.body))
		r.Header.Set("Content-Type", v.kind)
		var dst struct {
			Name string `json:"name"`
		}
		if (decode(r, &dst) == nil) != v.ok {
			t.Fatal("decoder boundary")
		}
	}
}
func TestPublicDestinationValidation(t *testing.T) {
	for _, v := range []struct {
		method, value string
		ok            bool
	}{{"Company website", "https://jobs.example.com/careers", true}, {"Company website", "javascript:alert(1)", false}, {"Company website", "https://user:pass@jobs.example.com", false}, {"Company website", "https://127.0.0.1", false}, {"Company website", "https://host.local", false}, {"Email", "jobs@example.com", true}, {"Email", "Name <jobs@example.com>", false}, {"Email", "jobs@example.com\r\nBcc:bad@example.com", false}, {"WhatsApp", "https://wa.me/252610000000", true}, {"WhatsApp", "https://wa.me/252610000000?text=private", false}, {"Dalka recruitment", "", true}, {"Dalka recruitment", "https://unexpected.example.com", false}} {
		if validDestination(v.method, v.value) != v.ok {
			t.Fatalf("destination validation for %s", v.method)
		}
	}
}
func TestPaginationAndQueryTampering(t *testing.T) {
	for _, query := range []string{"page=0", "pageSize=51", "page=99999999999999999", "page=-1", "pageSize=wrong"} {
		r := httptest.NewRequest("GET", "/?"+query, nil)
		if _, _, err := pagination(r); err == nil {
			t.Fatal("unbounded pagination accepted")
		}
	}
	for _, query := range []string{"role=super_admin", "page=1&page=2"} {
		r := httptest.NewRequest("GET", "/?"+query, nil)
		if queryKeys(r, "page", "pageSize") == nil {
			t.Fatal("unknown/duplicate query accepted")
		}
	}
	if companyFields("x", "NGO") || companyFields("Example", "super_admin") || companyFields("bad\nname", "NGO") {
		t.Fatal("invalid company accepted")
	}
}
