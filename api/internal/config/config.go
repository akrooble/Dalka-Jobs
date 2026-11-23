package config

import (
	"encoding/base64"
	"errors"
	"net/url"
	"os"
	"os/exec"
	"os/user"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"

	"github.com/akrooble/Dalka-Jobs/api/internal/localdb"
)

var ErrConfig = errors.New("invalid or unsafe local API configuration")

type Config struct {
	Origin   string
	Key      []byte
	Password string
	Database string
	Port     string
}

func Load() (Config, error) {
	origin := os.Getenv("DALKA_WEB_ORIGIN")
	if origin == "" {
		origin = "http://127.0.0.1:3000"
	}
	u, err := url.Parse(origin)
	if err != nil || u.Scheme != "http" || u.Hostname() != "127.0.0.1" || u.Port() == "" || u.User != nil || u.Path != "" || u.RawQuery != "" || u.Fragment != "" {
		return Config{}, ErrConfig
	}
	password, err := localdb.ReadAppEnv(filepath.Join("..", ".env"))
	if err != nil {
		return Config{}, ErrConfig
	}
	key, err := ReadKey(os.Getenv("DALKA_KEY_FILE"))
	if err != nil {
		return Config{}, ErrConfig
	}
	port := os.Getenv("DALKA_API_PORT")
	if port == "" {
		port = "8080"
	}
	number, e := strconv.Atoi(port)
	if e != nil || number < 1 || number > 65535 || strconv.Itoa(number) != port {
		return Config{}, ErrConfig
	}
	return Config{Origin: origin, Key: key, Password: password, Database: "dalka_jobs_dev", Port: port}, nil
}
func ReadKey(path string) ([]byte, error) {
	if !filepath.IsAbs(path) {
		return nil, ErrConfig
	}
	info, err := os.Lstat(path)
	if err != nil || !info.Mode().IsRegular() || info.Size() != 32 {
		return nil, ErrConfig
	}
	if runtime.GOOS == "windows" {
		current, err := user.Current()
		if err != nil {
			return nil, ErrConfig
		}
		// Base64 carries paths/SIDs as data, avoiding PowerShell's native -Command argument reparsing.
		encode := func(value string) string { return base64.StdEncoding.EncodeToString([]byte(value)) }
		script := `$ErrorActionPreference='Stop';try{$p=[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('` + encode(path) + `'));$s=[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('` + encode(current.Uid) + `'));$a=Get-Acl -LiteralPath $p;if(-not $a.AreAccessRulesProtected){exit 1};$owner=$a.GetOwner([System.Security.Principal.SecurityIdentifier]).Value;if($owner -ne $s){exit 1};foreach($r in $a.Access){if($r.AccessControlType -eq 'Allow' -and $r.IdentityReference.Translate([System.Security.Principal.SecurityIdentifier]).Value -ne $s){exit 1}};exit 0}catch{exit 1}`
		cmd := exec.Command("powershell.exe", "-NoProfile", "-NonInteractive", "-Command", "-")
		cmd.Stdin = strings.NewReader(script + "\n")
		if cmd.Run() != nil {
			return nil, ErrConfig
		}
	} else if info.Mode().Perm()&0077 != 0 {
		return nil, ErrConfig
	}
	b, err := os.ReadFile(path)
	if err != nil || len(b) != 32 {
		return nil, ErrConfig
	}
	return b, nil
}
func Email(value string) (string, bool) {
	value = strings.ToLower(strings.TrimSpace(value))
	if len(value) > 254 || strings.ContainsAny(value, "\r\n\t ") || strings.Count(value, "@") != 1 {
		return "", false
	}
	parts := strings.Split(value, "@")
	return value, parts[0] != "" && strings.Contains(parts[1], ".") && !strings.HasPrefix(parts[1], ".") && !strings.HasSuffix(parts[1], ".")
}
