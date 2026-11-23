// localsetup is invoked only by the user-run PowerShell hidden-prompt wrapper.
package main

import (
	"context"
	"crypto/hmac"
	"crypto/pbkdf2"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"os/user"
	"path/filepath"
	"runtime"
	"time"

	"github.com/akrooble/Dalka-Jobs/api/internal/localdb"
)

func verifier(password string) (string, error) {
	salt := make([]byte, 16)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}
	return verifierWithSalt(password, salt)
}

func verifierWithSalt(password string, salt []byte) (string, error) {
	salted, err := pbkdf2.Key(sha256.New, password, salt, 4096, 32)
	if err != nil {
		return "", err
	}
	mac := hmac.New(sha256.New, salted)
	mac.Write([]byte("Client Key"))
	stored := sha256.Sum256(mac.Sum(nil))
	mac = hmac.New(sha256.New, salted)
	mac.Write([]byte("Server Key"))
	server := mac.Sum(nil)
	b64 := base64.StdEncoding.EncodeToString
	return "SCRAM-SHA-256$4096:" + b64(salt) + "$" + b64(stored[:]) + ":" + b64(server), nil
}

func setup() error {
	if runtime.GOOS != "windows" {
		return fail(10)
	}
	var request struct {
		Password string `json:"password"`
		EnvPath  string `json:"envPath"`
	}
	decoder := json.NewDecoder(io.LimitReader(os.Stdin, 16384))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&request); err != nil || request.Password == "" {
		return fail(11)
	}
	wanted, err := filepath.Abs(filepath.Join("..", ".env"))
	if err != nil {
		return fail(12)
	}
	actual, err := filepath.Abs(request.EnvPath)
	if err != nil || actual != wanted {
		return fail(12)
	}
	if _, err = os.Lstat(wanted); !os.IsNotExist(err) {
		return fail(13)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 45*time.Second)
	defer cancel()
	conn, err := localdb.Connect(ctx, "postgres", "postgres", request.Password)
	request.Password = ""
	if err != nil {
		return connectionFailure(err)
	}
	defer conn.Close(context.Background())
	if err = localdb.CheckServer(ctx, conn); err != nil {
		var why localdb.ServerRefusal
		if errors.As(err, &why) {
			switch why {
			case "version":
				return fail(30)
			case "port":
				return fail(31)
			case "listener":
				return fail(32)
			}
		}
		return fail(33)
	}
	var safe bool
	// Preserve all original safety guards, but diagnose each independently.
	err = conn.QueryRow(ctx, `SELECT current_user='postgres' AND (SELECT rolsuper FROM pg_roles WHERE rolname=current_user)`).Scan(&safe)
	if err != nil {
		return fail(36)
	}
	if !safe {
		return fail(34)
	}
	err = conn.QueryRow(ctx, `SELECT current_setting('password_encryption')='scram-sha-256'`).Scan(&safe)
	if err != nil {
		return fail(36)
	}
	if !safe {
		return fail(35)
	}
	err = conn.QueryRow(ctx, `SELECT NOT EXISTS(SELECT 1 FROM pg_hba_file_rules WHERE error IS NOT NULL)`).Scan(&safe)
	if err != nil {
		return fail(36)
	}
	if !safe {
		return fail(37)
	}
	err = conn.QueryRow(ctx, `SELECT NOT EXISTS(SELECT 1 FROM pg_hba_file_rules WHERE type LIKE 'host%' AND auth_method <> 'scram-sha-256')`).Scan(&safe)
	if err != nil {
		return fail(36)
	}
	if !safe {
		return fail(38)
	}
	err = conn.QueryRow(ctx, "SELECT pg_try_advisory_lock(120030,5433)").Scan(&safe)
	if err != nil || !safe {
		return fail(40)
	}
	var exists bool
	err = conn.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='dalka_dev') OR EXISTS(SELECT 1 FROM pg_database WHERE datname IN ('dalka_jobs_dev','dalka_jobs_check'))`).Scan(&exists)
	if err != nil {
		return fail(41)
	}
	if exists {
		return fail(42)
	}
	bytes := make([]byte, 32)
	if _, err = rand.Read(bytes); err != nil {
		return fail(50)
	}
	password := hex.EncodeToString(bytes)
	hashed, err := verifier(password)
	if err != nil {
		return fail(50)
	}
	file, err := os.OpenFile(wanted, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0600)
	if err != nil {
		return fail(51)
	}
	// Protect empty file before writing the app secret. Never write admin password.
	account, err := user.Current()
	if err != nil {
		file.Close()
		return fail(52)
	}
	command := exec.Command("icacls.exe", wanted, "/inheritance:r", "/grant:r", "*"+account.Uid+":(F)")
	if command.Run() != nil {
		file.Close()
		return fail(52)
	}
	content := "APP_ENV=development\nAPI_HOST=127.0.0.1\nAPI_PORT=8080\nPG_BIN=C:/Program Files/PostgreSQL/18/bin\nPGHOST=127.0.0.1\nPGPORT=5433\nPGUSER=dalka_dev\nPGDATABASE=dalka_jobs_dev\nPGCHECKDATABASE=dalka_jobs_check\nPGPASSWORD=" + password + "\nPGSSLMODE=disable\n"
	_, err = file.WriteString(content)
	if err == nil {
		err = file.Sync()
	}
	closeErr := file.Close()
	if err != nil {
		return fail(53)
	}
	if closeErr != nil {
		return fail(53)
	}
	// The SQL contains only a SCRAM verifier, never the cleartext app password.
	_, err = conn.Exec(ctx, "CREATE ROLE dalka_dev LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD '"+hashed+"'")
	if err != nil {
		return fail(60)
	}
	for _, db := range []string{"dalka_jobs_dev", "dalka_jobs_check"} {
		if _, err = conn.Exec(ctx, "CREATE DATABASE "+db+" OWNER dalka_dev ALLOW_CONNECTIONS false"); err != nil {
			return fail(61)
		}
		if _, err = conn.Exec(ctx, "REVOKE CONNECT ON DATABASE "+db+" FROM PUBLIC"); err != nil {
			return fail(62)
		}
		if _, err = conn.Exec(ctx, "GRANT CONNECT ON DATABASE "+db+" TO dalka_dev"); err != nil {
			return fail(62)
		}
		if _, err = conn.Exec(ctx, "ALTER DATABASE "+db+" ALLOW_CONNECTIONS true"); err != nil {
			return fail(63)
		}
	}
	return nil
}
func main() {
	defer func() {
		if recover() != nil {
			fmt.Fprintln(os.Stderr, "localsetup refusal [99]: "+reasons[99])
			os.Exit(99)
		}
	}()
	if err := setup(); err != nil {
		code := failureCode(err)
		fmt.Fprintf(os.Stderr, "localsetup refusal [%d]: %s\n", code, reasons[code])
		os.Exit(code)
	}
	fmt.Println("Local setup completed.")
}
