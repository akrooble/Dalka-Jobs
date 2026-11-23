package config

import (
	"os"
	"os/exec"
	"os/user"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
)

func TestSyntheticKeyWithSpacesAndPunctuation(t *testing.T) {
	dir := filepath.Join(t.TempDir(), "key path with spaces and ' punctuation")
	if err := os.Mkdir(dir, 0700); err != nil {
		t.Fatal("temporary directory")
	}
	path := filepath.Join(dir, "synthetic.key")
	if err := os.WriteFile(path, []byte(strings.Repeat("x", 32)), 0600); err != nil {
		t.Fatal("synthetic file")
	}
	if runtime.GOOS == "windows" {
		u, err := user.Current()
		if err != nil {
			t.Fatal("current user")
		}
		if exec.Command("icacls.exe", path, "/inheritance:r", "/grant:r", "*"+u.Uid+":(F)").Run() != nil {
			t.Fatal("synthetic ACL setup")
		}
	}
	key, err := ReadKey(path)
	if err != nil || len(key) != 32 {
		t.Fatal("protected synthetic key path was refused")
	}
	if _, err = ReadKey("relative.key"); err == nil {
		t.Fatal("relative path accepted")
	}
	if err = os.WriteFile(path, []byte("short"), 0600); err != nil {
		t.Fatal("synthetic rewrite")
	}
	if _, err = ReadKey(path); err == nil {
		t.Fatal("short key accepted")
	}
}
func TestEmailBounds(t *testing.T) {
	for _, bad := range []string{"missing", "a@b", "a\nb@example.com", "a b@example.com", "@example.com", "a@.example.com"} {
		if _, ok := Email(bad); ok {
			t.Fatal("invalid email accepted")
		}
	}
	if got, ok := Email(" SAMPLE@Example.COM "); !ok || got != "sample@example.com" {
		t.Fatal("email normalization")
	}
}
