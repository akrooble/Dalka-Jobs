package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/akrooble/Dalka-Jobs/api/internal/auth"
	"github.com/akrooble/Dalka-Jobs/api/internal/config"
	"github.com/akrooble/Dalka-Jobs/api/internal/httpapi"
	"github.com/akrooble/Dalka-Jobs/api/internal/localdb"
	"github.com/jackc/pgx/v5"
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, "API startup or service failed; review local configuration and migration prerequisites.")
		os.Exit(1)
	}
}
func run() error {
	applicantMode := os.Getenv("DALKA_APPLICANT_MODE")
	if applicantMode != "" && applicantMode != "disabled" && applicantMode != "development" {
		return config.ErrConfig
	}
	cfg, err := config.Load()
	if err != nil {
		return err
	}
	connect := func(ctx context.Context) (*pgx.Conn, error) {
		return localdb.Connect(ctx, "dalka_dev", cfg.Database, cfg.Password)
	}
	// No automatic provisioning or migrations. This command is user-run only.
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	db, err := connect(ctx)
	if err != nil {
		return err
	}
	defer db.Close(context.Background())
	if err = localdb.CheckServer(ctx, db); err != nil {
		return err
	}
	var version int
	if err = db.QueryRow(ctx, "SELECT version FROM schema_migrations WHERE dirty=false").Scan(&version); err != nil || version != 6 {
		return config.ErrConfig
	}
	app := httpapi.New(connect, cfg.Origin, cfg.Key)
	if applicantMode == "development" {
		app.ApplicantSender = auth.DevelopmentApplicantSender{Output: os.Stdout}
	}
	server := &http.Server{Addr: "127.0.0.1:" + cfg.Port, Handler: app.Handler(), ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 15 * time.Second, WriteTimeout: 15 * time.Second, IdleTimeout: 60 * time.Second, MaxHeaderBytes: 16384}
	fmt.Println("Dalka API listening on http://127.0.0.1:" + cfg.Port + " (local development only)")
	return server.ListenAndServe()
}
