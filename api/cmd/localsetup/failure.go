package main

import (
	"context"
	"errors"
	"net"

	"github.com/jackc/pgx/v5/pgconn"
)

// No failure wraps raw errors, paths, SQL, connection strings or input values.
type refusal int

func (r refusal) Error() string { return reasons[int(r)] }
func fail(code int) error       { return refusal(code) }

var reasons = map[int]string{
	10: "Windows is required.", 11: "Invalid setup request or empty administrative password.", 12: "Setup target path is invalid.", 13: "Local credential file already exists or cannot be inspected; nothing is overwritten.",
	20: "Cannot reach local PostgreSQL on the required port, or connection timed out.", 21: "PostgreSQL authentication failed; verify the postgres password and applicable authentication rule.", 22: "PostgreSQL connection was refused by another connection policy or protocol check.",
	30: "Wrong PostgreSQL version; exactly 18.6 is required.", 31: "Wrong PostgreSQL port; 5433 is required.", 32: "PostgreSQL listen settings or connected endpoint are not strictly loopback.", 33: "Cannot read PostgreSQL server safety metadata.",
	34: "The connection is not the postgres superuser.", 35: "Server password_encryption is not scram-sha-256.", 36: "Cannot inspect authentication policy.", 37: "Authentication configuration contains an invalid rule.", 38: "At least one host authentication rule is not scram-sha-256, including possible unrelated or replication rules.",
	40: "Another setup holds the setup lock, or lock acquisition failed.", 41: "Cannot inspect existing project resources.", 42: "Project role or database already exists; setup will not adopt, overwrite or rotate it.",
	50: "Secure password or verifier generation failed.", 51: "Cannot exclusively create the local app credential file.", 52: "Cannot restrict the new app credential file to the current Windows user.", 53: "Cannot write or sync the app credential file; preserve any partial file for local recovery.",
	60: "Project role creation failed; app credentials may already be saved, so inspect locally before retrying.", 61: "Project database creation failed; partial provisioning may exist.", 62: "Project database connection-permission update failed; a new database remains closed.", 63: "Enabling a configured project database failed; it remains closed.",
	99: "Unexpected setup failure; raw diagnostics were suppressed to protect credentials.",
}

func failureCode(err error) int {
	var r refusal
	if errors.As(err, &r) {
		if _, ok := reasons[int(r)]; ok {
			return int(r)
		}
	}
	return 99
}
func connectionFailure(err error) error {
	var pg *pgconn.PgError
	if errors.As(err, &pg) {
		if pg.Code == "28P01" || pg.Code == "28000" {
			return fail(21)
		}
		return fail(22)
	}
	var network *net.OpError
	if errors.As(err, &network) || errors.Is(err, context.DeadlineExceeded) || pgconn.Timeout(err) {
		return fail(20)
	}
	return fail(22)
}
