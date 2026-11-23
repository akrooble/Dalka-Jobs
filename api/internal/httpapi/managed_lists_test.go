package httpapi

import (
	"context"
	"errors"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

func TestManagedListLabelAndIdentityBoundaries(t *testing.T) {
	for _, tc := range []struct {
		value, want string
		ok          bool
	}{{"  New   category  ", "New category", true}, {"Caafimaadka", "Caafimaadka", true}, {"a", "", false}, {"   ", "", false}, {"\nBad label", "", false}, {"Bad\nlabel", "", false}, {"Bad\tlabel", "", false}, {"Bad\x00label", "", false}, {strings.Repeat("x", 101), "", false}, {string([]byte{0xff, 0xfe}), "", false}} {
		got, err := listLabel(tc.value)
		if (err == nil) != tc.ok || got != tc.want {
			t.Fatalf("label boundary: %q", tc.value)
		}
	}
	for _, id := range []string{"cat-ngo", "loc-mogadishu", "cat-" + strings.Repeat("a", 32)} {
		if !validManagedID(id) {
			t.Fatal("valid seeded/generated ID")
		}
	}
	for _, id := range []string{"other-example", "cat-", "loc-UPPER", "cat-../secret", "cat-" + strings.Repeat("a", 81)} {
		if validManagedID(id) {
			t.Fatal("invalid ID")
		}
	}
	if !listKind("category") || !listKind("location") || listKind("role") {
		t.Fatal("list kind guard")
	}
}
func TestManagedListErrorsAndTransport(t *testing.T) {
	if e := managedError(&pgconn.PgError{Code: "23505", Detail: "private SQL"}); e != (problem{409, "conflict"}) {
		t.Fatal("duplicate must be safe conflict")
	}
	calls := 0
	app := New(func(context.Context) (*pgx.Conn, error) { calls++; return nil, errors.New("private SQL") }, "http://127.0.0.1:3000", []byte(strings.Repeat("x", 32)))
	for _, tc := range []struct {
		method, path string
		want         int
	}{{"POST", "/api/v1/admin/lists", 403}, {"PATCH", "/api/v1/admin/lists/cat-ngo", 403}, {"DELETE", "/api/v1/admin/lists/cat-ngo", 405}} {
		r := httptest.NewRequest(tc.method, tc.path, strings.NewReader(`{}`))
		r.Header.Set("Origin", "https://attacker.invalid")
		w := httptest.NewRecorder()
		app.Handler().ServeHTTP(w, r)
		if w.Code != tc.want {
			t.Fatal("transport rejection")
		}
	}
	if calls != 0 {
		t.Fatal("untrusted transport reached DB")
	}
	for _, code := range []string{"list_in_use", "stale_list"} {
		w := httptest.NewRecorder()
		writeError(w, deny(409, code))
		if !strings.Contains(w.Body.String(), code) || strings.Contains(w.Body.String(), `"message":""`) {
			t.Fatal("missing recoverable error")
		}
	}
}
