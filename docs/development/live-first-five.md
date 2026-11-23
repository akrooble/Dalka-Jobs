# Run the first-five local implementation

Returning to the project? Start with the [8 November restart audit](project-restart.md) for current frontend/design gaps and the sample-only startup command. The key/origin/API-port settings below are only needed for the separate live backend mode.

Use the [local QA checklist](../qa/manual-acceptance.md) to record live acceptance, distinguish frontend samples from real services and track outstanding browser/database evidence. Setup and database operations below remain owner-run.

The source for live public discovery, team MFA sign-in, super-admin company/job management and category/location administration is implemented. Database integration/migration recovery and browser acceptance are not yet verified. Existing fictional screens are still available at `/prototype` and the component gallery at `/ui-preview`.

The agent has not run setup, migrations, bootstrap, key creation, database checks or any command connecting to your PostgreSQL service. These steps require your local execution under the existing task restrictions. Never paste passwords, keys, enrollment secrets, recovery codes, cookies or `.env` contents into chat.

## 1. Finish the existing database setup

Use [Windows development notes](windows.md) and TASK-001-03. From the repository root, run the existing user-only commands if setup has not completed:

```powershell
.\scripts\setup-local.ps1
.\scripts\check-db.ps1
```

Setup refuses existing resources rather than overwriting them. If it refuses, stop and use its static code to diagnose the condition; do not delete databases/credentials or change HBA rules to force progress. A missing `.env` means the product API cannot start yet. Service configuration and production data are outside this task.

If `check-db.ps1` fails, rerun the updated script and use its `[dbcheck:N]` diagnostic; it now distinguishes configuration, connection and each role/ownership/permission guard. See [checker codes](windows.md#app-role-checker-diagnostics). Keep `API_PORT=8080` in the strict provisioning `.env`; the product port override belongs in `$env:DALKA_API_PORT`, not that file. Share only the diagnostic line, never credentials or file contents.

## 2. Tools, key and additive migrations

Port 8080 is already occupied on this machine, so the commands below use 8081. The API hostname stays fixed at 127.0.0.1; set the same DALKA_API_PORT in both terminals. An unset port defaults to 8080.

From the repository root:

```powershell
.\scripts\install-first-five-tools.ps1
.\scripts\create-api-key.ps1
$env:DALKA_KEY_FILE = Join-Path (Get-Location) '.local\secrets\api.key'
$env:DALKA_WEB_ORIGIN = 'http://127.0.0.1:3000'
$env:DALKA_API_PORT = '8081'
Set-Location api
go run ./cmd/migrate up development
go run ./cmd/migrate version development
```

Tools are workspace-local, publisher-SHA256 verified and pinned: sqlc 1.31.1 (22 April 2026), migrate 4.20.1 (9 September 2026). `tool-versions.json` records sources/checksums; no frontend dependency pins changed. To regenerate queries from root: `.\.tools\first-five\sqlc\sqlc.exe generate -f api/sqlc.yaml`. Generated files must match the source SQL/config, not be edited manually.

Key creation is exclusive: an existing file is never overwritten. Only the current Windows user receives access; the 32 raw bytes are written after the ACL succeeds and never printed. Keep a protected backup separately. Missing/unsafe/incorrect-length key files fail closed. Do not copy this key into `.env`; only the absolute path goes into `DALKA_KEY_FILE`. The server is local-only and refuses nonloopback origins.

The migration helper supplies the app password only in its child environment, not argv/DSN/output, and discards inherited PostgreSQL settings. It verifies the fixed local server before running the pinned migrate executable. Only `up` and `version` against `development` or `check` are exposed. There is no server-start migration, drop, force, automatic rollback or resource adoption. A failure leaves state for local inspection.

The first migration is additive and seeds only canonical category/location labels. It creates no sample users, employers or vacancies. FE-06 adds migration000002 for job metadata; FE-07 adds000003 for managed-list active/version/update metadata and uniqueness/reference indexes. The current server requires clean schema **3**. Existing `up` commands apply pending migrations and remain owner-run. See [job authoring](../api/job-authoring.md) and [managed lists](../api/managed-lists.md) for compatibility/backfill/recovery details. Original seed labels and job references are preserved. Existing case-insensitive duplicate list labels cause migration refusal, not automatic merging. Never down/drop/force/reset real data; down files lose metadata/state and remain untested. Prefer reviewed forward fixes/compatibility work or owner backup recovery; earlier schema1/2 servers refuse3.

## 3. Bootstrap and start the API

In a terminal at repository root, keeping the three environment variables from step 2:

```powershell
.\scripts\admin-local.ps1 -Action bootstrap -Email 'your-admin-email'
Set-Location api
go run ./cmd/server
```

The wrapper compiles before the hidden password prompt. Use a new 15–128-character password locally. It travels only over redirected helper stdin; no default password, secret argument or plaintext prompt output is used. The first account is enrollment-required; bootstrap refuses if a super admin exists. The API binds `127.0.0.1:8081` with these settings and refuses missing/dirty/wrong migration state. Keep it running in this terminal.

## 4. Start the live website

In a second terminal from repository root:

```powershell
$env:DALKA_WEBSITE_MODE = 'live'
$env:DALKA_WEB_ORIGIN = 'http://127.0.0.1:3000'
$env:DALKA_API_PORT = '8081'
Set-Location web
npm.cmd run dev
```

Use the same configured origin and port on both processes. If port 3000 is unavailable, choose a fixed free loopback port, set `DALKA_WEB_ORIGIN` to that origin in both terminals and pass the matching `--port` to Next. Do not rely on an automatic port change for credential writes; mismatched Origin is refused.

Open `http://127.0.0.1:3000/admin/sign-in`. Enter the password, choose Set up authenticator, add the private setup key to your authenticator and verify its six-digit code. Save the ten recovery codes in private storage when shown once. Then open `/admin/companies` to create/search/edit companies and inspect job associations. FE-06 source now adds `/admin/jobs` and `/admin/job-editor`: create a company first, save a draft job, inspect its saved preview, then publish a valid future external-apply job or archive it. The editor labels deadline entry UTC+3 and keeps URLs stable. On-site recruitment publication is blocked; salary fields are deferred by owner decision. An empty vacancy list is valid before authoring. This workflow still requires actual database/browser acceptance; source availability is not an operational pass.

FE-07 adds `/admin/lists`: create/search/rename categories and locations, inspect linked-job counts and deactivate/reactivate unused values. A value linked to any draft/published/archived/expired job cannot deactivate. No delete or kind change exists; renames keep IDs and appear through public filter/job joins. Duplicate/stale writes are refused with recovery feedback. These source workflows also need real database and browser acceptance.

To keep reviewing the fictional website instead, leave `DALKA_WEBSITE_MODE` unset. A live request never falls back to fictional data. Mode is evaluated dynamically on the homepage and job detail routes; a preview build started in live mode cannot serve cached sample details. The local site stays noindex with no JobPosting markup pending a separate public launch/eligibility task.

For production-mode local checks, run `npm.cmd run build` then `npm.cmd run start` with the same environment. No production deployment is configured.

## 5. Recovery and other privileged roles

Recovery-code sign-in requires a successful password step, consumes one code, revokes prior sessions/codes and requires a new authenticator before protected access. It is not an MFA bypass. If every factor is lost, only an authorised local operator who has independently verified the account owner may run:

```powershell
.\scripts\admin-local.ps1 -Action reset -Email 'verified-account-email'
```

This requires typing the exact reset confirmation and entering a new password privately. It revokes sessions/recovery codes and removes the previous authenticator. The confirmation prevents accidental targeting; it is not identity verification. Do not invoke it merely on an unverified reset request. The agent never executes it.

After first-owner enrollment, an authorised operator can provision a recruiter or a company admin for an existing company:

```powershell
.\scripts\admin-local.ps1 -Action provision -Email 'staff-email' -Role recruiter
.\scripts\admin-local.ps1 -Action provision -Email 'company-email' -Role company_admin -CompanyId 'existing-company-id'
```

Each account must enroll TOTP. These roles can authenticate, but their later workspaces remain prototypes and company management is forbidden. Invitations, public signup, multiple roles/memberships and applicant email sign-in are outside Tasks 1–5.

## Verification

From `api/`:

```powershell
$env:GOCACHE = Join-Path (Split-Path (Get-Location) -Parent) '.local\go-cache'
go test ./...
go vet ./...
go test -tags=integration -run '^$' ./internal/httpapi
```

The third command compiles integration tests without executing them. Offline tests cover password bounds/random salt, RFC6238 public vectors/replay/drift, authenticated encryption context/tampering, synthetic Windows ACL paths with spaces/apostrophes, safe transport errors/origin, body/query/destination limits and existing provisioning guards. A sandbox that cannot resolve the current user SID cannot pass the Windows ACL test; run this offline test locally without weakening ACL checks.

To execute the owner-only integration suite, use the empty disposable `dalka_jobs_check` database. It refuses development/nonloopback targets, unconfigured/mismatched servers, concurrent runs and pre-existing account/company/job/session/limiter data. It inserts synthetic fixtures and deletes them during cleanup; run only after reviewing that disposable scope:

```powershell
go run ./cmd/migrate up check
$env:DALKA_INTEGRATION = 'dalka_jobs_check'
go test -tags=integration -count=1 ./internal/httpapi
Remove-Item Env:DALKA_INTEGRATION
```

This checks MFA gating, cookie/CSRF, role denial, company CRUD/conflicts, job authoring/publication/expiry, managed-list create/rename/state/duplicates/version/reference protection, concurrent authoring/deactivation, recovery/MFA and expired logout. Synthetic managed-list cleanup is restricted to IDs created by the test; canonical seeds are retained. It does not certify down-migration recovery. Never target development or automatically drop/reset leftover fixtures; preserve interrupted state for inspection.

From `web/`, run unit/lint/build/typecheck using package scripts. The HTTP checks are separate:

- Preview: start the production website without live mode on 3100, then run `npm.cmd run test:prototype-http`.
- Live contract smoke: start the production website with live mode and `DALKA_WEB_ORIGIN=http://127.0.0.1:3101` on 3101, set `DALKA_API_PORT=8081` in the server and test terminals, leave the Go API stopped, then run `npm.cmd run test:live-http`. The test refuses to bind if the configured API port is occupied and owns a synthetic upstream there temporarily. It tests no fallback, dynamic job details, intended-cookie/identity forwarding, origin/body bounds and page shells. It never connects to PostgreSQL and is not database integration evidence.

Browser acceptance still needs 375/768/1440 widths, keyboard/focus/dialog/search, live sign-in/enrollment/recovery/logout and company create/edit/conflict/reload journeys. Browser tooling stopped because it could not verify Chrome's URL; no bypass or visual pass was claimed. Current results and limitations are in TASK-001-FE-01-05-LIVE-log.md. Tasks remain unaccepted until their required database/browser evidence and independent review are complete.
