package auth

import (
	"encoding/base32"
	"strings"
	"testing"
	"time"
)

func TestPasswordRoundTripAndBounds(t *testing.T) {
	password := "  a sufficiently long password  "
	encoded, err := PasswordHash(password)
	if err != nil || !VerifyPassword(encoded, password) {
		t.Fatal("password round trip")
	}
	if VerifyPassword(encoded, strings.TrimSpace(password)) || VerifyPassword(encoded, "incorrect password") {
		t.Fatal("trimmed or wrong password accepted")
	}
	another, _ := PasswordHash(password)
	if encoded == another {
		t.Fatal("salt reused")
	}
	for _, bad := range []string{"short", strings.Repeat("a", 129), string([]byte{0xff})} {
		if _, err := PasswordHash(bad); err == nil {
			t.Fatal("invalid password accepted")
		}
	}
	for _, bad := range []string{"", strings.Replace(encoded, "600000", "1", 1), strings.Replace(encoded, "600000", "999999999", 1), "pbkdf2-sha256$600000$bad$bad"} {
		if VerifyPassword(bad, password) {
			t.Fatal("malformed hash accepted")
		}
	}
}
func TestRFC6238SHA1VectorsAndReplay(t *testing.T) {
	// RFC 6238 Appendix B public test seed, not a credential.
	secret := base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString([]byte("12345678901234567890"))
	for _, v := range []struct {
		seconds int64
		code    string
	}{{59, "94287082"}, {1111111109, "07081804"}, {1111111111, "14050471"}, {1234567890, "89005924"}, {2000000000, "69279037"}, {20000000000, "65353130"}} {
		got, err := Code(secret, v.seconds/30, 8)
		if err != nil || got != v.code {
			t.Fatalf("RFC vector %d", v.seconds)
		}
	}
	now := time.Unix(1234567890, 0)
	code, _ := Code(secret, now.Unix()/30, 6)
	counter, ok := MatchCode(secret, code, now, -1)
	if !ok {
		t.Fatal("code rejected")
	}
	if _, ok = MatchCode(secret, code, now, counter); ok {
		t.Fatal("replay accepted")
	}
	previous, _ := Code(secret, counter-1, 6)
	if _, ok = MatchCode(secret, previous, now, -1); !ok {
		t.Fatal("permitted clock drift rejected")
	}
	if _, ok = MatchCode(secret, previous, now.Add(90*time.Second), -1); ok {
		t.Fatal("expired code accepted")
	}
	for _, bad := range []string{"12345", "abcdef", " 123456"} {
		if _, ok = MatchCode(secret, bad, now, -1); ok {
			t.Fatal("invalid code accepted")
		}
	}
}
func TestEncryptionContextTamperingAndRandomNonce(t *testing.T) {
	key := []byte(strings.Repeat("x", 32))
	value := []byte(NewTOTPSecret())
	first, err := Seal(key, "account-a:totp-v1", value)
	if err != nil {
		t.Fatal(err)
	}
	second, _ := Seal(key, "account-a:totp-v1", value)
	if string(first) == string(second) {
		t.Fatal("nonce reused")
	}
	plain, err := Open(key, "account-a:totp-v1", first)
	if err != nil || string(plain) != string(value) {
		t.Fatal("round trip")
	}
	if _, err = Open(key, "account-b:totp-v1", first); err == nil {
		t.Fatal("cross-account secret accepted")
	}
	first[len(first)-1] ^= 1
	if _, err = Open(key, "account-a:totp-v1", first); err == nil {
		t.Fatal("tampering accepted")
	}
	if string(LimitKey(key, "a")) == string(LimitKey(key, "b")) || len(Digest("sample")) != 32 {
		t.Fatal("digest separation")
	}
}
