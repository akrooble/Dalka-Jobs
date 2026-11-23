# Windows local development

03-A toolchains are recorded in tool-versions.json: Node26.13.0/npm11.20.0/Go1.26.5. Owner reported version check passed. Node release-age and four named upstream dependency exceptions remain approved; direct package pins unchanged.

## Revised03-B: owner-installed Windows service
Owner reports PostgreSQL18.6 installed as postgresql-x64-18 at C:/Program Files/PostgreSQL/18, listening only on localhost5433 with SCRAM authentication. This supersedes all ZIP/separate-cluster instructions. Do not download/install binaries, create a cluster, start/stop/register a service, or edit postgresql.conf/pg_hba.conf. PostgreSQL14 and every unrelated database remain untouched.

The prepared scripts have NOT been run by the agent. User steps from repository root:
```powershell
.\scripts\setup-local.ps1
.\scripts\check-db.ps1
```
Setup checks service status and every Windows listener on5433 before prompting. SQL then verifies18.6, port/listen addresses and SCRAM configuration before changes. It refuses existing.env/project role/databases, so it is intentionally not an overwrite/rotation tool.

Enter postgres superuser password only at the hidden prompt. The helper is built first, before prompting; the password then travels to the directly launched executable through anonymous stdin, never environment/command line/file/output; do not log or paste it. It exists in process memory for this run. No transcript of plaintext data is produced. The app password is randomly generated and stored only in the new private ignored.env; PostgreSQL stores its SCRAM verifier. Current-user-only file ACLs are applied before secret bytes are written.

PG_BIN=C:/Program Files/PostgreSQL/18/bin, PGHOST=127.0.0.1, PGPORT=5433, PGUSER=dalka_dev. See root.env.example for every exact key. No bootstrap password/user fields. Scripts use existing pgx and Go directly, not the installed client binaries.

Role dalka_dev: LOGIN, no superuser/createDB/createRole/replication/bypassRLS or memberships. Owns dalka_jobs_dev and dalka_jobs_check; new databases stay closed to connections until PUBLIC CONNECT is revoked and explicit app grants applied, then connections enabled. Other databases may still grant PUBLIC access; setup does not change them. check-db verifies both project databases using only dalka_dev and prints sanitized results, not secrets/errors.

## Failures and reruns
No destructive recovery supplied. If setup fails after creating.env, preserve it privately: it may contain the only app credential even if provisioning is partial. Inspect database/resource state locally with your trusted administration tools; do not paste credentials. Do not delete.env or reset roles blindly. Existing resources cause refusal instead of takeover/password rotation. No.env.setup-pending file is created. PostgreSQL settings/service are never automatically repaired. Setup conservatively rejects any invalid HBA rule or host rule not using SCRAM; investigate without weakening authentication.

## Offline checks (no setup/service execution)
```powershell
Push-Location api
$env:GOTOOLCHAIN = 'local'
go test ./...
go vet ./...
Pop-Location
```
Compilation/unit tests do not establish runtime provisioning or Windows ACL behavior. User-run integration remains pending. Build/lint/typecheck web/app and aggregate runtime checks are03-C, still unapproved. Dependency lockfiles/release timestamps remain in tool-versions.json; this service revision does not update them.

## Sanitized setup diagnostics
The old helper returned1 for every refusal and go run also collapsed nonzero helper codes to1. The wrapper now builds before prompting and runs the helper executable directly, preserving numeric statuses. It displays only messages from a fixed allowlist; it never echoes child stdout/stderr, raw SQL/network errors, connection strings or credential-file contents. The helper also emits only its code and static reason. Native abnormal termination may have an unknown OS code, which is displayed with a generic allowlisted message.

Wrapper failures before/helper launch use labels SERVICE_CHECK, SERVICE_STOPPED, LISTENER_CHECK, PORT_UNREACHABLE, NONLOCAL_LISTENER, LOCAL_FILE_EXISTS, GO_BUILD, PASSWORD_PROMPT or HELPER_PIPE. GO_BUILD is not a localsetup exit code: the helper never ran and no password was collected. Other helpers are not run automatically after refusal. Do not delete local credentials/resources or change authentication rules to bypass a refusal.

| localsetup exit | Meaning |
| --- | --- |
| 0 | Success |
| 10 | Windows is required. |
| 11 | Invalid setup request or empty administrative password. |
| 12 | Setup target path is invalid. |
| 13 | Local credential file already exists or cannot be inspected; nothing is overwritten. |
| 20 | Cannot reach local PostgreSQL on the required port, or connection timed out. |
| 21 | PostgreSQL authentication failed; verify the postgres password and applicable authentication rule. |
| 22 | PostgreSQL connection was refused by another connection policy or protocol check. |
| 30 | Wrong PostgreSQL version; exactly 18.6 is required. |
| 31 | Wrong PostgreSQL port; 5433 is required. |
| 32 | PostgreSQL listen settings or connected endpoint are not strictly loopback. |
| 33 | Cannot read PostgreSQL server safety metadata. |
| 34 | The connection is not the postgres superuser. |
| 35 | Server password_encryption is not scram-sha-256. |
| 36 | Cannot inspect authentication policy. |
| 37 | Authentication configuration contains an invalid rule. |
| 38 | At least one host authentication rule is not scram-sha-256, including possible unrelated or replication rules. |
| 40 | Another setup holds the setup lock, or lock acquisition failed. |
| 41 | Cannot inspect existing project resources. |
| 42 | Project role or database already exists; setup will not adopt, overwrite or rotate it. |
| 50 | Secure password or verifier generation failed. |
| 51 | Cannot exclusively create the local app credential file. |
| 52 | Cannot restrict the new app credential file to the current Windows user. |
| 53 | Cannot write or sync the app credential file; preserve any partial file for local recovery. |
| 60 | Project role creation failed; app credentials may already be saved, so inspect locally before retrying. |
| 61 | Project database creation failed; partial provisioning may exist. |
| 62 | Project database connection-permission update failed; a new database remains closed. |
| 63 | Enabling a configured project database failed; it remains closed. |
| 99 | Unexpected setup failure; raw diagnostics were suppressed to protect credentials. |

Code-only diagnosis: assuming the reported version/endpoint are correct, the leading hypothesis is38: the HBA guard checks every host rule, including unrelated/replication entries, not only the rule matching this connection.35 (password_encryption setting) is a separate possible policy refusal. Neither is proven; typing a password and passing Go vet do not establish successful database authentication. The next user-run fixed code is needed to identify the actual condition. Share only that code/static reason, never passwords or credential-file contents. No setup or database command was executed during this diagnosis.

## App-role checker diagnostics

`check-db.ps1` now builds the verifier before running it directly, preserving its exit code instead of collapsing `go run` failures. Build/launch failures report `DBCHECK_BUILD` / `DBCHECK_LAUNCH`; database/raw child output stays suppressed. The check is read-only and never requests the postgres password. Share only the `[dbcheck:N]` line and its fixed reason.

Codes below refer to `dalka_jobs_dev`. Add 100 for the same failure on `dalka_jobs_check` (e.g.21 authentication on development,121 on check). Codes10/11 concern local configuration before any connection.

| Code | Condition |
| --- | --- |
| 10 / 11 | Strict .env invalid/unreadable / missing |
| 20 / 21 / 22 | Connection unreachable/timeout / app-role authentication / other connection policy |
| 23 / 24 | Target database missing / CONNECT refused |
| 30 / 31 / 32 / 33 | Version / port / loopback metadata / metadata inspection failure |
| 40 / 41 / 42 | Role/database identity / LOGIN flag / elevated privileges |
| 43 / 44 / 45 | Wrong database owner / role membership / PUBLIC CONNECT still granted |
| 46 / 47 | Permission metadata query / SELECT1 probe failure |
| 99 | Unexpected safe fallback |

Keep `.env` exactly in its provisioning format: `API_PORT=8080` remains there. The product's free loopback port is selected separately with `$env:DALKA_API_PORT='8081'`; do not add product variables to the strict provisioning `.env`. This is a possible cause of code10, not a diagnosis from the generic exception alone. Do not share `.env`, substitute the postgres password, change safety guards or recreate existing resources to resolve an unknown code. The owner reruns the checker; the agent does not execute it.
