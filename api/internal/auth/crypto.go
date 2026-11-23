// Package auth contains credential primitives, not HTTP/session authorisation.
package auth

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/hmac"
	"crypto/pbkdf2"
	"crypto/rand"
	"crypto/sha1"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base32"
	"encoding/binary"
	"encoding/hex"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"
)

var ErrCredential = errors.New("invalid credential")

const Iterations = 600000

func RandomHex(bytes int) string {
	b := make([]byte, bytes)
	if _, err := rand.Read(b); err != nil {
		panic("secure randomness unavailable")
	}
	return hex.EncodeToString(b)
}
func Digest(value string) []byte { v := sha256.Sum256([]byte(value)); return v[:] }
func PasswordHash(password string) (string, error) {
	if !utf8.ValidString(password) || utf8.RuneCountInString(password) < 15 || utf8.RuneCountInString(password) > 128 {
		return "", ErrCredential
	}
	salt := RandomHex(32)
	key, err := pbkdf2.Key(sha256.New, password, []byte(salt), Iterations, 32)
	if err != nil {
		return "", ErrCredential
	}
	return fmt.Sprintf("pbkdf2-sha256$%d$%s$%s", Iterations, salt, hex.EncodeToString(key)), nil
}
func VerifyPassword(encoded, password string) bool {
	parts := strings.Split(encoded, "$")
	if len(parts) != 4 || parts[0] != "pbkdf2-sha256" || !utf8.ValidString(password) || utf8.RuneCountInString(password) > 128 {
		return false
	}
	n, err := strconv.Atoi(parts[1])
	if err != nil || n < Iterations || n > Iterations*2 || len(parts[2]) != 64 {
		return false
	}
	salt, err := hex.DecodeString(parts[2])
	if err != nil || len(salt) != 32 {
		return false
	}
	wanted, err := hex.DecodeString(parts[3])
	if err != nil || len(wanted) != 32 {
		return false
	}
	key, err := pbkdf2.Key(sha256.New, password, []byte(parts[2]), n, 32)
	return err == nil && subtle.ConstantTimeCompare(key, wanted) == 1
}
func Seal(key []byte, context string, plain []byte) ([]byte, error) {
	if len(key) != 32 {
		return nil, ErrCredential
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, ErrCredential
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, ErrCredential
	}
	nonce := make([]byte, gcm.NonceSize())
	if _, err = rand.Read(nonce); err != nil {
		return nil, ErrCredential
	}
	return gcm.Seal(nonce, nonce, plain, []byte(context)), nil
}
func Open(key []byte, context string, encrypted []byte) ([]byte, error) {
	if len(key) != 32 {
		return nil, ErrCredential
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, ErrCredential
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil || len(encrypted) < gcm.NonceSize() {
		return nil, ErrCredential
	}
	value, err := gcm.Open(nil, encrypted[:gcm.NonceSize()], encrypted[gcm.NonceSize():], []byte(context))
	if err != nil {
		return nil, ErrCredential
	}
	return value, nil
}
func NewTOTPSecret() string {
	b := make([]byte, 20)
	if _, err := rand.Read(b); err != nil {
		panic("secure randomness unavailable")
	}
	return base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(b)
}
func Code(secret string, counter int64, digits int) (string, error) {
	if counter < 0 || (digits != 6 && digits != 8) {
		return "", ErrCredential
	}
	key, err := base32.StdEncoding.WithPadding(base32.NoPadding).DecodeString(secret)
	if err != nil || len(key) < 20 {
		return "", ErrCredential
	}
	var b [8]byte
	binary.BigEndian.PutUint64(b[:], uint64(counter))
	m := hmac.New(sha1.New, key)
	m.Write(b[:])
	sum := m.Sum(nil)
	offset := sum[len(sum)-1] & 15
	v := binary.BigEndian.Uint32(sum[offset:offset+4]) & 0x7fffffff
	mod := uint32(1000000)
	if digits == 8 {
		mod = 100000000
	}
	return fmt.Sprintf("%0*d", digits, v%mod), nil
}
func MatchCode(secret, code string, now time.Time, last int64) (int64, bool) {
	if len(code) != 6 || strings.Trim(code, "0123456789") != "" {
		return 0, false
	}
	counter := now.Unix() / 30
	for _, c := range []int64{counter, counter - 1, counter + 1} {
		if c <= last {
			continue
		}
		v, err := Code(secret, c, 6)
		if err == nil && subtle.ConstantTimeCompare([]byte(v), []byte(code)) == 1 {
			return c, true
		}
	}
	return 0, false
}
func LimitKey(key []byte, value string) []byte {
	m := hmac.New(sha256.New, key)
	m.Write([]byte("limit-v1:" + value))
	return m.Sum(nil)
}
