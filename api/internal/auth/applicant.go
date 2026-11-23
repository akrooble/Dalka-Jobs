package auth

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"fmt"
	"io"
	"math/big"
	"strings"
	"time"
)

const SyntheticPrivacyVersion = "local-synthetic-v1"
const ApplicantOTPExpiry = 10 * time.Minute
const ApplicantSessionExpiry = 7 * 24 * time.Hour
const ApplicantSessionIdle = 24 * time.Hour

// ApplicantEmail deliberately supports ASCII mailbox identities only. It does
// not remove dots or plus tags, parse display names, or link privileged accounts.
func ApplicantEmail(value string) (string, bool) {
	value = strings.ToLower(strings.TrimSpace(value))
	if len(value) > 254 || strings.Count(value, "@") != 1 {
		return "", false
	}
	parts := strings.Split(value, "@")
	if len(parts[0]) == 0 || len(parts[0]) > 64 || strings.HasPrefix(parts[0], ".") || strings.HasSuffix(parts[0], ".") || strings.Contains(parts[0], "..") {
		return "", false
	}
	for _, c := range parts[0] {
		if !(c >= 'a' && c <= 'z' || c >= '0' && c <= '9' || strings.ContainsRune(".!#$%&'*+-/=?^_`{|}~", c)) {
			return "", false
		}
	}
	labels := strings.Split(parts[1], ".")
	if len(labels) < 2 {
		return "", false
	}
	for _, label := range labels {
		if len(label) == 0 || len(label) > 63 || label[0] == '-' || label[len(label)-1] == '-' {
			return "", false
		}
		for _, c := range label {
			if !(c >= 'a' && c <= 'z' || c >= '0' && c <= '9' || c == '-') {
				return "", false
			}
		}
	}
	return value, true
}

func NewApplicantCode() string {
	n, err := rand.Int(rand.Reader, big.NewInt(1000000))
	if err != nil {
		panic("secure randomness unavailable")
	}
	return fmt.Sprintf("%06d", n.Int64())
}

func ApplicantCodeDigest(key []byte, challenge, purpose, identity, session, code string) []byte {
	h := hmac.New(sha256.New, key)
	// Every component is length delimited, including untrusted identity input.
	for _, value := range []string{"applicant-code-v1", challenge, purpose, identity, session, code} {
		fmt.Fprintf(h, "%d:%s", len(value), value)
	}
	return h.Sum(nil)
}

func ValidApplicantCode(code string) bool {
	return len(code) == 6 && strings.Trim(code, "0123456789") == ""
}

type ApplicantMessage struct{ Email, Code, Challenge, Purpose string }
type ApplicantSender interface {
	Send(context.Context, ApplicantMessage) error
}

// DevelopmentApplicantSender cannot deliver to a real address. This explicit
// terminal adapter is never selected by default or used for external delivery.
type DevelopmentApplicantSender struct{ Output io.Writer }

func (s DevelopmentApplicantSender) Send(ctx context.Context, m ApplicantMessage) error {
	email, ok := ApplicantEmail(m.Email)
	if !ok || !strings.HasSuffix(email, ".invalid") || !ValidApplicantCode(m.Code) || len(m.Challenge) != 32 || (m.Purpose != "sign_in" && m.Purpose != "delete_account") || s.Output == nil {
		return ErrCredential
	}
	if err := ctx.Err(); err != nil {
		return err
	}
	_, err := fmt.Fprintf(s.Output, "LOCAL SYNTHETIC APPLICANT %s | %s | challenge %s | code %s\n", m.Purpose, email, m.Challenge, m.Code)
	return err
}
