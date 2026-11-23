package main

import (
	"context"
	"errors"
	"net"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"testing"

	"github.com/akrooble/Dalka-Jobs/api/internal/localdb"
	"github.com/jackc/pgx/v5/pgconn"
)

func TestConnectionCodesNeverExposeRawErrors(t *testing.T) {
	marker := "synthetic-secret-marker-never-display"
	for _, tc := range []struct {
		err  error
		kind int
	}{{&pgconn.PgError{Code: "28P01", Message: marker}, 21}, {&pgconn.PgError{Code: "28000", Message: marker}, 21}, {&pgconn.PgError{Code: "3D000", Message: marker}, 23}, {&pgconn.PgError{Code: "42501", Message: marker}, 24}, {&pgconn.PgError{Code: "other", Message: marker}, 22}, {&net.OpError{Op: "dial", Err: errors.New(marker)}, 20}, {context.DeadlineExceeded, 20}, {errors.New(marker), 22}} {
		if connectionKind(tc.err) != tc.kind {
			t.Fatal("wrong connection classification")
		}
		for _, database := range []string{"dalka_jobs_dev", "dalka_jobs_check"} {
			err := phaseFailure(tc.kind, database)
			code := failureCode(err)
			expected := tc.kind
			if database == "dalka_jobs_check" {
				expected += 100
			}
			if code != expected || strings.Contains(err.Error(), marker) {
				t.Fatal("unsafe phase diagnostic")
			}
		}
	}
	if failureCode(errors.New(marker)) != 99 || strings.Contains(refusal(999).Error(), marker) {
		t.Fatal("unsafe fallback")
	}
}
func TestEveryOriginalRoleGuardStillRejects(t *testing.T) {
	safe := roleState{identity: true, login: true, owner: true}
	if roleKind(safe) != 0 {
		t.Fatal("safe role rejected")
	}
	for _, tc := range []struct {
		mutate func(*roleState)
		kind   int
	}{
		{func(s *roleState) { s.identity = false }, 40}, {func(s *roleState) { s.login = false }, 41},
		{func(s *roleState) { s.super = true }, 42}, {func(s *roleState) { s.createDB = true }, 42}, {func(s *roleState) { s.createRole = true }, 42}, {func(s *roleState) { s.replicate = true }, 42}, {func(s *roleState) { s.bypass = true }, 42},
		{func(s *roleState) { s.owner = false }, 43}, {func(s *roleState) { s.membership = true }, 44}, {func(s *roleState) { s.publicConnect = true }, 45},
	} {
		state := safe
		tc.mutate(&state)
		if roleKind(state) != tc.kind {
			t.Fatal("a safety guard was lost")
		}
	}
}
func TestMetadataAndWrapperMessageParity(t *testing.T) {
	for _, tc := range []struct {
		kind string
		want int
	}{{"version", 30}, {"port", 31}, {"listener", 32}, {"metadata", 33}, {"unknown", 33}} {
		if metadataKind(localdb.ServerRefusal(tc.kind)) != tc.want {
			t.Fatal("metadata diagnostic")
		}
	}
	content, err := os.ReadFile(filepath.Join("..", "..", "..", "scripts", "check-db.ps1"))
	if err != nil {
		t.Fatal("cannot inspect public wrapper source")
	}
	wrapper := string(content)
	for code, reason := range reasons {
		if !strings.Contains(wrapper, strconv.Itoa(code)+" = '"+reason+"'") {
			t.Fatal("Go and PowerShell reasons differ")
		}
	}
	if strings.Contains(wrapper, "go.exe run") || !strings.Contains(wrapper, "$taskProcess.ExitCode") || !strings.Contains(wrapper, "ReadToEndAsync") {
		t.Fatal("wrapper lost direct exit/output isolation")
	}
}
