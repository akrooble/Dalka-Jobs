package main

import (
	"strings"
	"testing"
)

func TestSCRAMVerifierIndependentVector(t *testing.T) {
	// Fixture independently derived with Node crypto.pbkdf2Sync/createHmac/createHash.
	// This is public synthetic test data, not any database credential.
	const want = "SCRAM-SHA-256$4096:MDEyMzQ1Njc4OWFiY2RlZg==$F2sU6mAsqD6F6SPgFLqf6yNzgUNsYAfGPDU8EAX/2jI=:3NeYBe6MvXdvRSVi2qb+AsO7OgUC6LLjwddlueFK6XU="
	got, err := verifierWithSalt("offline-test-password", []byte("0123456789abcdef"))
	if err != nil || got != want {
		t.Fatal("SCRAM salt/iterations/stored-key/server-key fixture mismatch")
	}
}

func TestSCRAMSaltRandomized(t *testing.T) {
	a, err := verifier("offline-test-password")
	if err != nil {
		t.Fatal(err)
	}
	b, err := verifier("offline-test-password")
	if err != nil {
		t.Fatal(err)
	}
	if a == b || !strings.HasPrefix(a, "SCRAM-SHA-256$4096:") {
		t.Fatal("verifier must use fresh random salt and supported format")
	}
}
