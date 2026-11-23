package main

import (
	"context"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/akrooble/Dalka-Jobs/api/internal/localdb"
)

func check() error {
	path := filepath.Join("..", ".env")
	if _, err := os.Stat(path); errors.Is(err, os.ErrNotExist) {
		return refusal(11)
	}
	password, err := localdb.ReadAppEnv(path)
	if err != nil {
		return refusal(10)
	}
	for _, database := range []string{"dalka_jobs_dev", "dalka_jobs_check"} {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		conn, err := localdb.Connect(ctx, "dalka_dev", database, password)
		if err != nil {
			cancel()
			return phaseFailure(connectionKind(err), database)
		}
		err = localdb.CheckServer(ctx, conn)
		kind := 0
		if err != nil {
			kind = metadataKind(err)
		}
		if err == nil {
			var state roleState
			err = conn.QueryRow(ctx, `SELECT current_user='dalka_dev' AND current_database()=$1,r.rolcanlogin,r.rolsuper,r.rolcreatedb,r.rolcreaterole,r.rolreplication,r.rolbypassrls,d.datdba=r.oid,EXISTS(SELECT 1 FROM pg_auth_members WHERE member=r.oid),EXISTS(SELECT 1 FROM aclexplode(COALESCE(d.datacl,acldefault('d',d.datdba))) WHERE grantee=0 AND privilege_type='CONNECT') FROM pg_roles r JOIN pg_database d ON d.datname=current_database() WHERE r.rolname=current_user`, database).Scan(&state.identity, &state.login, &state.super, &state.createDB, &state.createRole, &state.replicate, &state.bypass, &state.owner, &state.membership, &state.publicConnect)
			if err != nil {
				kind = 46
			} else {
				kind = roleKind(state)
			}
		}
		var one int
		if kind == 0 {
			err = conn.QueryRow(ctx, "SELECT 1").Scan(&one)
			if err != nil || one != 1 {
				kind = 47
			}
		}
		conn.Close(context.Background())
		cancel()
		if kind != 0 {
			return phaseFailure(kind, database)
		}
	}
	return nil
}
func main() {
	if err := check(); err != nil {
		code := failureCode(err)
		fmt.Fprintf(os.Stderr, "[dbcheck:%d] %s\n", code, refusal(code).Error())
		os.Exit(code)
	}
	fmt.Println("PostgreSQL 18.6 localhost:5433: both project databases verified using dalka_dev only.")
}
