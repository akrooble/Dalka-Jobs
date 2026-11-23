package main

import (
	"context"
	"errors"
	"fmt"
	"net"
	"os"
	"regexp"
	"strconv"
	"strings"
	"testing"

	"github.com/jackc/pgx/v5/pgconn"
)

func TestConnectionFailureDoesNotExposeRawError(t *testing.T) {
	secret := "synthetic-sensitive-marker"
	tests := []struct {
		err  error
		code int
	}{
		{&pgconn.PgError{Code: "28P01", Message: secret}, 21},
		{fmt.Errorf("wrapped: %w", &pgconn.PgError{Code: "28000", Detail: secret}), 21},
		{&net.OpError{Op: "dial", Net: "tcp", Err: errors.New(secret)}, 20},
		{context.DeadlineExceeded, 20},
		{&pgconn.PgError{Code: "53300", Message: secret}, 22},
		{errors.New(secret), 22},
	}
	for _, tc := range tests {
		err := connectionFailure(tc.err)
		if failureCode(err) != tc.code || strings.Contains(err.Error(), secret) {
			t.Fatal("classification or redaction failure")
		}
	}
	if failureCode(errors.New(secret)) != 99 {
		t.Fatal("unknown failure must be sanitized")
	}
}

func TestPowerShellReasonsMatchGoAllowlist(t *testing.T) {
	data, err := os.ReadFile("../../../scripts/setup-local.ps1")
	if err != nil {
		t.Fatal(err)
	}
	matches := regexp.MustCompile(`(?m)^\s+(\d+) = '([^']*)'`).FindAllStringSubmatch(string(data), -1)
	if len(matches) != len(reasons) {
		t.Fatal("wrapper reason count mismatch")
	}
	for _, m := range matches {
		code, _ := strconv.Atoi(m[1])
		if reasons[code] != m[2] {
			t.Fatalf("reason mismatch for exit %d", code)
		}
	}
}
