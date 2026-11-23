// Package localdb provides only local development setup/check safety guards.
package localdb

import (
	"context"
	"errors"
	"net"
	"os"
	"strings"

	"github.com/jackc/pgx/v5"
)

var ErrUnsafe = errors.New("local database precondition failed")

type ServerRefusal string

func (s ServerRefusal) Error() string { return "local server safety check failed" }

func ValidateServer(version, port int, addresses, endpoint string) error {
	if version != 180006 {
		return ServerRefusal("version")
	}
	if port != 5433 {
		return ServerRefusal("port")
	}
	if ValidateListeners(addresses) != nil {
		return ServerRefusal("listener")
	}
	if ip := net.ParseIP(endpoint); ip == nil || !ip.IsLoopback() {
		return ServerRefusal("listener")
	}
	return nil
}

func ValidateListeners(value string) error {
	if strings.TrimSpace(value) == "" {
		return ErrUnsafe
	}
	for _, part := range strings.Split(value, ",") {
		part = strings.TrimSpace(part)
		if part != "localhost" && part != "127.0.0.1" && part != "::1" {
			return ErrUnsafe
		}
	}
	return nil
}

func Connect(ctx context.Context, user, database, password string) (*pgx.Conn, error) {
	if password == "" || (user != "postgres" && user != "dalka_dev") || (database != "postgres" && database != "dalka_jobs_dev" && database != "dalka_jobs_check") {
		return nil, ErrUnsafe
	}
	// Explicit parameters avoid inherited service files, SSL files, hosts or passwords.
	cfg, err := pgx.ParseConfig("host=127.0.0.1 port=5433 user=" + user + " dbname=" + database + " password=unused sslmode=disable connect_timeout=5")
	if err != nil {
		return nil, ErrUnsafe
	}
	cfg.Password = password
	cfg.Fallbacks = nil
	return pgx.ConnectConfig(ctx, cfg)
}

func CheckServer(ctx context.Context, conn *pgx.Conn) error {
	var version, port int
	var addresses, endpoint string
	err := conn.QueryRow(ctx, "SELECT current_setting('server_version_num')::int, current_setting('port')::int, current_setting('listen_addresses'), inet_server_addr()::text").Scan(&version, &port, &addresses, &endpoint)
	if err != nil {
		return ServerRefusal("metadata")
	}
	return ValidateServer(version, port, addresses, endpoint)
}

func ReadAppEnv(path string) (string, error) {
	contents, err := os.ReadFile(path)
	if err != nil {
		return "", ErrUnsafe
	}
	expected := map[string]string{"APP_ENV": "development", "API_HOST": "127.0.0.1", "API_PORT": "8080", "PG_BIN": "C:/Program Files/PostgreSQL/18/bin", "PGHOST": "127.0.0.1", "PGPORT": "5433", "PGUSER": "dalka_dev", "PGDATABASE": "dalka_jobs_dev", "PGCHECKDATABASE": "dalka_jobs_check", "PGSSLMODE": "disable"}
	seen := map[string]bool{}
	password := ""
	for _, line := range strings.Split(string(contents), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, ok := strings.Cut(line, "=")
		if !ok || seen[key] {
			return "", ErrUnsafe
		}
		seen[key] = true
		if key == "PGPASSWORD" {
			if len(value) != 64 || strings.Trim(value, "0123456789abcdef") != "" {
				return "", ErrUnsafe
			}
			password = value
		} else if wanted, ok := expected[key]; !ok || wanted != value {
			return "", ErrUnsafe
		}
	}
	if password == "" || len(seen) != len(expected)+1 {
		return "", ErrUnsafe
	}
	return password, nil
}
