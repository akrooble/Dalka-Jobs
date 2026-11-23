package localdb

import (
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestServerRefusalReasons(t *testing.T) {
	for _, tc := range []struct {
		version, port             int
		addresses, endpoint, kind string
	}{
		{180005, 5433, "localhost", "127.0.0.1", "version"},
		{180006, 5432, "localhost", "127.0.0.1", "port"},
		{180006, 5433, "*", "127.0.0.1", "listener"},
		{180006, 5433, "localhost", "192.168.1.2", "listener"},
		{180006, 5433, "localhost", "127.0.0.1", ""},
	} {
		err := ValidateServer(tc.version, tc.port, tc.addresses, tc.endpoint)
		if tc.kind == "" {
			if err != nil {
				t.Fatal("valid metadata refused")
			}
			continue
		}
		var refusal ServerRefusal
		if !errors.As(err, &refusal) || string(refusal) != tc.kind {
			t.Fatal("wrong sanitized metadata refusal")
		}
	}
}

func TestAppEnvRejectsPrivilegeOrEndpointChanges(t *testing.T) {
	base := "APP_ENV=development\nAPI_HOST=127.0.0.1\nAPI_PORT=8080\nPG_BIN=C:/Program Files/PostgreSQL/18/bin\nPGHOST=127.0.0.1\nPGPORT=5433\nPGUSER=dalka_dev\nPGDATABASE=dalka_jobs_dev\nPGCHECKDATABASE=dalka_jobs_check\nPGPASSWORD=" + strings.Repeat("a", 64) + "\nPGSSLMODE=disable\n"
	for _, tc := range []struct {
		name, value string
		valid       bool
	}{
		{"valid", base, true},
		{"superuser", strings.ReplaceAll(base, "PGUSER=dalka_dev", "PGUSER=postgres"), false},
		{"remote", strings.ReplaceAll(base, "PGHOST=127.0.0.1", "PGHOST=192.168.1.10"), false},
		{"wrong-port", strings.ReplaceAll(base, "PGPORT=5433", "PGPORT=5432"), false},
		{"duplicate", base + "PGUSER=dalka_dev\n", false},
		{"admin-key", base + "PG_BOOTSTRAP_PASSWORD=not-a-secret-test-value\n", false},
		{"missing", strings.ReplaceAll(base, "PGPASSWORD="+strings.Repeat("a", 64), "PGPASSWORD="), false},
	} {
		t.Run(tc.name, func(t *testing.T) {
			path := filepath.Join(t.TempDir(), "app.env")
			if err := os.WriteFile(path, []byte(tc.value), 0600); err != nil {
				t.Fatal(err)
			}
			_, err := ReadAppEnv(path)
			if (err == nil) != tc.valid {
				t.Fatal("unexpected environment validation result")
			}
		})
	}
}

func TestListenerPolicy(t *testing.T) {
	for _, test := range []struct {
		value   string
		allowed bool
	}{
		{"localhost", true}, {"127.0.0.1,::1", true}, {"localhost, 127.0.0.1", true},
		{"*", false}, {"0.0.0.0", false}, {"::", false}, {"localhost,192.168.1.4", false}, {"", false}, {"localhost,", false}, {"example.com", false},
	} {
		if (ValidateListeners(test.value) == nil) != test.allowed {
			t.Errorf("listener policy failed for %q", test.value)
		}
	}
}
