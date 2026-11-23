package auth

import (
	"bytes"
	"context"
	"strings"
	"testing"
)

func TestApplicantEmailBoundaries(t *testing.T) {
	for _, v := range []string{"a@example.invalid", " A.B+tag@Example.Invalid ", "a_b@example.invalid"} {
		if _, ok := ApplicantEmail(v); !ok {
			t.Errorf("valid synthetic identity rejected: %q", v)
		}
	}
	for _, v := range []string{"", "Display <a@example.invalid>", "a@example.invalid,b@example.invalid", "a\x00@example.invalid", "a\n@example.invalid", "é@example.invalid", "a@é.invalid", ".a@example.invalid", "a..b@example.invalid", "a.@example.invalid", "a@-example.invalid", "a@example..invalid", "a@localhost", strings.Repeat("a", 65) + "@example.invalid"} {
		if _, ok := ApplicantEmail(v); ok {
			t.Errorf("invalid identity accepted: %q", v)
		}
	}
	got, ok := ApplicantEmail(" A.B+tag@Example.Invalid ")
	if !ok || got != "a.b+tag@example.invalid" {
		t.Fatal("normalization changed mailbox semantics")
	}
}
func TestApplicantCodeIsPurposeIdentitySessionAndChallengeBound(t *testing.T) {
	key := bytes.Repeat([]byte{1}, 32)
	values := []string{"challenge", "sign_in", "a@example.invalid", "session", "123456"}
	hash := ApplicantCodeDigest(key, values[0], values[1], values[2], values[3], values[4])
	for i := range values {
		changed := append([]string(nil), values...)
		changed[i] += "x"
		if bytes.Equal(hash, ApplicantCodeDigest(key, changed[0], changed[1], changed[2], changed[3], changed[4])) {
			t.Fatalf("component %d not bound", i)
		}
	}
	if bytes.Equal(hash, ApplicantCodeDigest(bytes.Repeat([]byte{2}, 32), values[0], values[1], values[2], values[3], values[4])) {
		t.Fatal("key not bound")
	}
	for i := 0; i < 100; i++ {
		if !ValidApplicantCode(NewApplicantCode()) {
			t.Fatal("invalid generated code")
		}
	}
	for _, v := range []string{"12345", "1234567", "12 456", "１２３４５６", "12345\n"} {
		if ValidApplicantCode(v) {
			t.Fatal("invalid code shape")
		}
	}
}
func TestDevelopmentApplicantSenderFailsClosed(t *testing.T) {
	var output bytes.Buffer
	s := DevelopmentApplicantSender{Output: &output}
	msg := ApplicantMessage{"a@example.invalid", "123456", strings.Repeat("a", 32), "sign_in"}
	if s.Send(context.Background(), msg) != nil || !strings.Contains(output.String(), "123456") {
		t.Fatal("explicit synthetic terminal sender failed")
	}
	output.Reset()
	msg.Email = "a@example.com"
	if s.Send(context.Background(), msg) == nil || output.Len() != 0 {
		t.Fatal("real identity must never reach terminal")
	}
	msg.Email = "a@example.invalid"
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if s.Send(ctx, msg) == nil || output.Len() != 0 {
		t.Fatal("cancelled delivery accepted")
	}
}
