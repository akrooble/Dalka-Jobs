package main

import (
	"context"
	"errors"
	"net"

	"github.com/akrooble/Dalka-Jobs/api/internal/localdb"
	"github.com/jackc/pgx/v5/pgconn"
)

// Codes/messages contain only allowlisted metadata; never wrap underlying errors.
type refusal int

var reasons = map[int]string{
	10: "Local .env is invalid or unreadable. Keep its original provisioning keys, including API_PORT=8080; use DALKA_API_PORT separately for the product API.",
	11: "Local .env is missing. The user-run database setup must complete first.",
	20: "Cannot reach PostgreSQL on 127.0.0.1:5433, or the connection timed out.",
	21: "App-role authentication failed. Verify the local app credential and authentication policy; do not supply the postgres password to this checker.",
	22: "PostgreSQL refused the connection through another policy or protocol check.",
	23: "The target project database does not exist. Setup may be incomplete; do not delete resources or rerun provisioning blindly.",
	24: "The app role is not permitted to connect to the target database.",
	30: "Wrong PostgreSQL version; exactly 18.6 is required.",
	31: "Wrong PostgreSQL port; 5433 is required.",
	32: "PostgreSQL listen settings or connected endpoint are not strictly loopback.",
	33: "Cannot read PostgreSQL server safety metadata.",
	40: "The connected role or database does not match the fixed project identity.",
	41: "The app role is not a LOGIN role.",
	42: "The app role has an elevated superuser, database, role, replication or RLS-bypass privilege.",
	43: "The app role does not own the target project database.",
	44: "The app role has an inherited role membership.",
	45: "PUBLIC retains CONNECT permission on the target project database.",
	46: "Cannot inspect app-role or database permission metadata.",
	47: "The read-only SELECT 1 probe failed.",
	99: "Unexpected verification failure; raw diagnostics are suppressed.",
}

func (r refusal) Error() string {
	kind := int(r)
	if kind >= 100 {
		kind -= 100
	}
	if value, ok := reasons[kind]; ok {
		return value
	}
	return reasons[99]
}
func failureCode(err error) int {
	var r refusal
	if errors.As(err, &r) {
		code := int(r)
		kind := code
		if code >= 100 {
			kind -= 100
		}
		if _, ok := reasons[kind]; ok && (code < 100 || code >= 120 && code <= 199) {
			return code
		}
	}
	return 99
}
func phaseFailure(kind int, database string) error {
	if database == "dalka_jobs_check" {
		kind += 100
	}
	return refusal(kind)
}
func connectionKind(err error) int {
	var pg *pgconn.PgError
	if errors.As(err, &pg) {
		switch pg.Code {
		case "28P01", "28000":
			return 21
		case "3D000":
			return 23
		case "42501":
			return 24
		default:
			return 22
		}
	}
	var network *net.OpError
	if errors.As(err, &network) || errors.Is(err, context.DeadlineExceeded) || pgconn.Timeout(err) {
		return 20
	}
	return 22
}
func metadataKind(err error) int {
	var r localdb.ServerRefusal
	if errors.As(err, &r) {
		switch r {
		case "version":
			return 30
		case "port":
			return 31
		case "listener":
			return 32
		}
	}
	return 33
}

type roleState struct{ identity, login, super, createDB, createRole, replicate, bypass, owner, membership, publicConnect bool }

func roleKind(s roleState) int {
	switch {
	case !s.identity:
		return 40
	case !s.login:
		return 41
	case s.super || s.createDB || s.createRole || s.replicate || s.bypass:
		return 42
	case !s.owner:
		return 43
	case s.membership:
		return 44
	case s.publicConnect:
		return 45
	}
	return 0
}
