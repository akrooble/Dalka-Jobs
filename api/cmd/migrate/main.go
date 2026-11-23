// migrate is owner-run only and supplies the app password via a child-only environment.
package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/akrooble/Dalka-Jobs/api/internal/localdb"
)

func main() {
	if run() != nil {
		fmt.Fprintln(os.Stderr, "Migration refused or failed. Preserve the database and review migration state locally; no raw database errors are printed.")
		os.Exit(1)
	}
	fmt.Println("Requested migration operation completed.")
}
func run() error {
	if len(os.Args) != 3 || (os.Args[1] != "up" && os.Args[1] != "version") || (os.Args[2] != "development" && os.Args[2] != "check") {
		return localdb.ErrUnsafe
	}
	password, err := localdb.ReadAppEnv(filepath.Join("..", ".env"))
	if err != nil {
		return err
	}
	database := "dalka_jobs_dev"
	if os.Args[2] == "check" {
		database = "dalka_jobs_check"
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	conn, err := localdb.Connect(ctx, "dalka_dev", database, password)
	if err != nil {
		return err
	}
	defer conn.Close(context.Background())
	if err = localdb.CheckServer(ctx, conn); err != nil {
		return err
	}
	binary, err := filepath.Abs(filepath.Join("..", ".tools", "first-five", "migrate", "migrate.exe"))
	if err != nil {
		return err
	}
	source, err := filepath.Abs("migrations")
	if err != nil {
		return err
	}
	// Fixed pgx5 DSN contains no password. Inherited PostgreSQL settings are discarded.
	cmd := exec.Command(binary, "-path", source, "-database", "pgx5://dalka_dev@127.0.0.1:5433/"+database+"?sslmode=disable", os.Args[1])
	for _, v := range os.Environ() {
		key, _, _ := strings.Cut(v, "=")
		if !strings.HasPrefix(strings.ToUpper(key), "PG") {
			cmd.Env = append(cmd.Env, v)
		}
	}
	cmd.Env = append(cmd.Env, "PGPASSWORD="+password)
	// Captured output is never forwarded: publisher errors may include a DSN.
	return cmd.Run()
}
