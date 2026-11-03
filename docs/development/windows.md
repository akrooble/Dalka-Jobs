<!-- Current decision: Node26.13.0/npm11.20.0, option A approved; earlier runtime-mismatch statements are historical. -->
# Windows tooling — 03-A release audit and PostgreSQL handoff

03-A only is authorized on task/001-03-tooling. No 03-B scripts, secrets, clusters or Windows services may be created. Installed Go 1.26.5 is selected; no host upgrade. Owner chose older eligible pins; frontend manifests and lockfile are now resolved. No dependency compatibility override flags are permitted.

## Selected direct pins — release-age audit

As of 2026-11-03 Africa/Nairobi; conservative cutoff 2026-10-19T21:00:00Z. All selected direct pins are stable non-prerelease versions; Node26.13.0 has an explicit owner-approved release-age exception, all other direct pins meet14 days. Complete lockfile and Go-graph timestamps are recorded in tool-versions.json.

| Tool/package | Version | Release date (UTC) | Stable / at least 14 days |
| --- | --- | --- | --- |
| node | 26.13.0 | 2026-10-28 | Stable / six-day age exception explicitly approved 2026-11-03 |
| npm | 11.20.0 | 2026-09-22 | Yes / Yes |
| go | 1.26.5 | 2026-07-07 | Yes / Yes |
| next | 16.4.2 | 2026-10-15 | Yes / Yes |
| react | 19.3.1 | 2026-10-14 | Yes / Yes |
| react-dom | 19.3.1 | 2026-10-14 | Yes / Yes |
| typescript | 6.0.3 | 2026-04-16 | Yes / Yes |
| tailwindcss | 4.3.3 | 2026-07-16 | Yes / Yes |
| @tailwindcss/postcss | 4.3.3 | 2026-07-16 | Yes / Yes |
| postcss | 8.5.31 | 2026-10-18 | Yes / Yes |
| eslint | 9.39.5 | 2026-07-10 | Yes / Yes |
| eslint-config-next | 16.4.2 | 2026-10-15 | Yes / Yes |
| @types/node | 26.6.5 | 2026-10-09 | Yes / Yes |
| @types/react | 19.3.0 | 2026-09-09 | Yes / Yes |
| @types/react-dom | 19.3.0 | 2026-09-09 | Yes / Yes |
| github.com/jackc/pgx/v5 | v5.11.0 | 2026-09-07 | Yes / Yes |
| github.com/go-chi/chi/v5 | v5.5.0 | 2026-10-14 | Yes / Yes |
| postgresql | 18.6 | 2026-08-13 | Yes / Yes |
| sqlc | v1.31.1 | 2026-04-22 | Yes / Yes |
| migrate | v4.20.1 | 2026-09-09 | Yes / Yes |

Sources: [Node index](https://nodejs.org/dist/index.json), [Go stable history](https://go.dev/doc/devel/release), [PostgreSQL18.6](https://www.postgresql.org/docs/release/18.6/), npm publisher registry time maps and official GitHub release metadata. PostgreSQL/sqlc/migrate are future tools, not installed; EDB packaging build age remains unverified.

Changes from original proposal: Node26.13.0 to26.12.0; Next/config16.4.4 to16.4.2; Tailwind/adapter4.3.4 to4.3.3; PostCSS8.5.32 to8.5.31; types/node26.6.6 to26.6.5 to meet age policy. Go1.27.3 to installed1.26.5 avoids host upgrade. ESLint10.14.0 to9.39.5 and TypeScript7.0.2 to6.0.3 meet the mature Next lint dependency peer ranges (React/import/a11y plugins exclude ESLint10; TypeScript parser requires <6.1). No force/legacy-peer-deps used. Initial warning-filled exploratory lockfile was replaced, not accepted.

Upstream exceptions: npm graph includes gensync@1.0.0-beta.2 (2020-10-27) and resolve@2.0.0-next.7 (2026-05-15); pgx graph includes github.com/jackc/pgservicefile v0.0.0-20240606120523-5a60cdf6a761 (2024-06-06) and gopkg.in/check.v1 v1.0.0-20201130134442-10cb98267c6c (2020-11-30). These are old upstream prereleases/pseudo-versions, not tagged stable releases; check.v1 is an upstream test dependency. All 438 unique npm lockfile packages and 13 Go graph modules passed the age audit, but these four fail a strict stable-release-only rule. RESOLVED on 2026-11-03: owner approved exactly these four transitive exceptions. No other or future non-stable version is implicitly approved; direct pins remain subject to the stable/14-day rule. Matching Node/script prerequisites still gate runtime acceptance; 03-B remains unapproved. Do not substitute arbitrary dependencies or bypass verification. Complete per-package dates/status are in tool-versions.json.

03-A writes manifests/version checks/docs only. No web app, Next/lint/TS configs, API packages, health/config tests or database code until later approved tasks.

## PostgreSQL 18 ZIP handoff — user performs later, not executed
Official community Windows download page: https://www.postgresql.org/download/windows/ — its ZIP archive link leads to https://www.enterprisedb.com/download-postgresql-binaries . Choose Windows x86-64 under Version18.6, not the installer.

Verified page link: https://sbp.enterprisedb.com/getfile.jsp?fileid=1260609 . HEAD redirects to exact file:
https://get.enterprisedb.com/postgresql/postgresql-18.6-5-windows-x64-binaries.zip

Exact filename: postgresql-18.6-5-windows-x64-binaries.zip (384620317 bytes in current HEAD response).
Publisher SHA-256 sidecar: https://get.enterprisedb.com/postgresql/postgresql-18.6-5-windows-x64-binaries.zip.sha256
Verified published SHA-256: e2246ba91d22345bc3d017586c09ede52d9df180b1eeb480f050445f1cad84e2
No binary ZIP downloaded or executed by the agent. Version18.6 release date is known; the EDB -5 repack date is not proven, so its own 14-day artifact-age gate remains unverified until publisher evidence is obtained or owner clarifies version-versus-repack policy.

After approving 03-B and satisfying that gate, user steps (do not run now):
1. Download ZIP from the official page above using HTTPS and save in Downloads; fetch/check publisher sidecar again if the file changes. Never substitute a similarly named EXE installer.
2. In PowerShell, compute and compare the hash before extraction:

```powershell
$zipPath = Join-Path $env:USERPROFILE 'Downloads/postgresql-18.6-5-windows-x64-binaries.zip'
$expectedHash = 'e2246ba91d22345bc3d017586c09ede52d9df180b1eeb480f050445f1cad84e2'
if ((Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expectedHash) { throw 'PostgreSQL ZIP checksum mismatch: do not extract or execute' }
$targetPath = Join-Path $env:LOCALAPPDATA 'DalkaJobs/PostgreSQL/18.6-5'
if (Test-Path -LiteralPath $targetPath) { throw 'Choose a fresh directory; do not overwrite existing binaries or data' }
Expand-Archive -LiteralPath $zipPath -DestinationPath $targetPath
```

3. Inspect the extracted directory. EDB normally wraps binaries in pgsql; verify pgsql/bin/postgres.exe, initdb.exe, pg_ctl.exe and psql.exe exist. If layout differs, stop and inspect rather than moving or overwriting an existing PostgreSQL installation. Keep all sibling lib/share directories together; do not copy bin alone.
4. Once verification is complete, user can run the explicitly resolved postgres.exe --version and psql.exe --version; expect18.6. A missing runtime DLL requires separate trusted Microsoft prerequisite installation by the user, never downloading individual DLLs. A self-computed hash alone is not publisher authentication; comparison above uses the separately published HTTPS sidecar.
5. Future PG_BIN is the resolved pgsql/bin directory under this fresh user-local extraction, replacing the earlier proposed Program Files path. No PATH change, installer, initdb, pg_ctl start/register, Windows service or database migration in this handoff. Existing PostgreSQL14 stays untouched. Later 03-B sets isolated data/port/password configuration only after its own approval.

## Windows checks available after 03-A
Owner reports script execution enabled and check-tools.ps1 passed on their computer on 2026-11-03 (owner-reported result). Prior policy-blocked results below are historical. Use npm.cmd and installed Go1.26.5. Owner selected option A: installed Node26.13.0/npm11.20.0 are pinned; no host installation needed. Do not disable execution policy to run these scripts. User must permit the reviewed script through their normal trusted policy if needed.

```powershell
Set-Location -LiteralPath 'D:/Dalka jobs Project/Dalka-Jobs'
.\scripts\check-tools.ps1
npm.cmd --prefix web ci --strict-peer-deps --ignore-scripts --no-audit --no-fund
npm.cmd --prefix web run check:dependencies
Push-Location api
$env:GOTOOLCHAIN = 'local'
go mod download all
go mod verify
Pop-Location
```

ci in the repository creates node_modules; until the 03-B .gitignore is approved, never stage that directory. For agent validation, package.json and lockfile were copied to a fresh temporary directory outside the repository, ci ran there with scripts disabled, and npm ls --all validated the installed graph. No host tools installed. Cache/dependency files exist in temp, not source; no cleanup deletion of user data performed.

There is no build/lint/typecheck command yet: implementing their configs and shells belongs to03-C. Do not run go mod tidy before imports exist: it would remove the intentional declarations. Current script was syntax-checked; earlier execution was policy-blocked. Owner now permits scripts and reports the version check passed. Option A is now approved: exact runtime validation expects installed Node26.13.0/npm11.20.0. Owner-reported check confirms matching runtime pins; the earlier Node mismatch is resolved. No database checks before03-B approval.
