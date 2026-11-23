// admin is invoked by an owner-run hidden-input wrapper. Never pass passwords as flags.
package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"strings"
	"time"

	"github.com/akrooble/Dalka-Jobs/api/internal/auth"
	"github.com/akrooble/Dalka-Jobs/api/internal/config"
	"github.com/akrooble/Dalka-Jobs/api/internal/localdb"
)

func main() {
	if run() != nil {
		fmt.Fprintln(os.Stderr, "Administrative operation refused. Check prerequisites and input locally; no credentials are printed.")
		os.Exit(1)
	}
	fmt.Println("Administrative operation completed. Sign in to enroll your authenticator.")
}
func run() error {
	var input struct {
		Action       string `json:"action"`
		Email        string `json:"email"`
		Password     string `json:"password"`
		Role         string `json:"role"`
		CompanyID    string `json:"companyId"`
		Confirmation string `json:"confirmation"`
	}
	d := json.NewDecoder(io.LimitReader(os.Stdin, 16384))
	d.DisallowUnknownFields()
	if d.Decode(&input) != nil || d.Decode(new(any)) != io.EOF {
		return config.ErrConfig
	}
	email, ok := config.Email(input.Email)
	if !ok {
		return config.ErrConfig
	}
	hash, err := auth.PasswordHash(input.Password)
	if err != nil {
		return err
	}
	cfg, err := config.Load()
	if err != nil {
		return err
	}
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	conn, err := localdb.Connect(ctx, "dalka_dev", cfg.Database, cfg.Password)
	if err != nil {
		return err
	}
	defer conn.Close(context.Background())
	if err = localdb.CheckServer(ctx, conn); err != nil {
		return err
	}
	tx, err := conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(context.Background())
	// Serialise bootstrap/provision/reset so concurrent operators cannot create a second owner.
	if _, err = tx.Exec(ctx, "SELECT pg_advisory_xact_lock(482100105)"); err != nil {
		return err
	}
	switch input.Action {
	case "bootstrap":
		var exists bool
		if err = tx.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM accounts WHERE role='super_admin')").Scan(&exists); err != nil || exists {
			return config.ErrConfig
		}
		_, err = tx.Exec(ctx, "INSERT INTO accounts(id,email,password_hash,role) VALUES($1,$2,$3,'super_admin')", auth.RandomHex(16), email, hash)
	case "provision":
		var owner bool
		if err = tx.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM accounts WHERE role='super_admin' AND active AND totp_secret IS NOT NULL)").Scan(&owner); err != nil || !owner {
			return config.ErrConfig
		}
		if input.Role != "recruiter" && input.Role != "company_admin" {
			return config.ErrConfig
		}
		var company any
		if input.Role == "company_admin" {
			company = input.CompanyID
			if len(input.CompanyID) != 32 {
				return config.ErrConfig
			}
		} else if input.CompanyID != "" {
			return config.ErrConfig
		}
		_, err = tx.Exec(ctx, "INSERT INTO accounts(id,email,password_hash,role,company_id) VALUES($1,$2,$3,$4,$5)", auth.RandomHex(16), email, hash, input.Role, company)
	case "reset":
		if input.Confirmation != "RESET "+email {
			return config.ErrConfig
		}
		var id string
		if err = tx.QueryRow(ctx, "SELECT id FROM accounts WHERE email=$1 FOR UPDATE", email).Scan(&id); err != nil {
			return err
		}
		if _, err = tx.Exec(ctx, "DELETE FROM sessions WHERE account_id=$1", id); err != nil {
			return err
		}
		if _, err = tx.Exec(ctx, "DELETE FROM recovery_codes WHERE account_id=$1", id); err != nil {
			return err
		}
		_, err = tx.Exec(ctx, "UPDATE accounts SET password_hash=$2,totp_secret=NULL,last_counter=-1 WHERE id=$1", id, hash)
	default:
		return errors.New("invalid operation")
	}
	if err != nil {
		return err
	}
	if strings.TrimSpace(input.Password) == "" {
		return config.ErrConfig
	}
	return tx.Commit(ctx)
}
