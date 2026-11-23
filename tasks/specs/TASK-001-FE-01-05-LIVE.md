# Tasks 1–5: functional local website and company management

## Task ID
TASK-001-FE-01-05-LIVE, implementing the first five numbered tasks in TASK-001-FRONTEND-PLAN.md and the minimum backend prerequisites they need.

## Title / Type / Priority
Live public discovery, shared UI verification, API/session integration, privileged MFA sign-in and super-admin company management. Feature implementation. Current owner priority: complete through frontend Task 5.

## Problem Statement
The owner explicitly selected “Make Tasks 1–5 fully functional with backend services” on 4 November 2026. Existing fictional screens cannot satisfy that request. Database/schema, transport contracts, auth/session policies and company services must precede live frontend acceptance.

## Behavior at Approval
Public fixture website, shared UI gallery and 37 fictional screen prototypes exist. Previous source/unit/type/lint/build/HTTP checks passed; required browser QA remains incomplete. api/ contains local PostgreSQL setup/check helpers, not a product API or migrations/auth/company services. No .env exists (existence check only; no credentials read). The owner-managed PostgreSQL service and setup remain user-run under TASK-001-03.md. Current branch is task/001-03b-local-database with extensive preserved uncommitted work.

## Expected Behavior
Tasks 1–2 have responsive/keyboard/browser evidence. Task 3 reads actual public job/list data from the Go API through the website origin and safely handles sessions/errors. Task 4 provides working password plus TOTP sign-in for the three privileged roles, with bootstrap, enrollment, challenge, recovery, sign-out and expiry. Task 5 allows only a fully authenticated super admin to list/search/create/edit companies and inspect associated jobs. Changes persist in PostgreSQL. Company admins and recruiters cannot change companies. Empty live data remains genuinely empty. Fictional previews stay separately labelled.

“Complete through 5” does not include job authoring (Task 6), list editing (7), applicant email sign-in (8), applicant intake, private CVs or later recruitment/finance features. Existing prototype source remains for later tasks.

## Root Cause
NOT APPLICABLE: planned live implementation. Missing services are verified dependencies, not a diagnosed application defect. Database setup status and browser control are external acceptance blocks.

## Repository Evidence
- AGENTS.md, TASK_SPEC.md, TASK_EXECUTOR.md, SMALL_TASKS.md, PR_REVIEW.md and PR_MERGE.md: specification, approval, preservation, independent review and release gates.
- TASK-001.md: approved Next.js/Go/PostgreSQL architecture, five roles, password/TOTP privileged auth, Go-owned sessions, company authoring, open identity/job-policy decisions.
- TASK-001-FRONTEND-PLAN.md: first-five-task scope and B1/B2 dependencies; later tasks retain their IDs.
- TASK-001-03.md and its log: existing user-only PostgreSQL setup restrictions; exact host/role/database names; schema/tooling 03-C not previously approved.
- api/go.mod: Go 1.26.5, chi v5.5.0, pgx v5.11.0. api/internal/localdb/ and api/cmd/{localsetup,dbcheck}/ are provisioning/checking only.
- web/package.json, next.config.ts, app/, components/ui/ and lib/: existing framework/toolchain, preview and checks; no live proxy/client or auth implementation.
- tool-versions.json: pinned runtime/frontend modules and dependency-age rule. Existing approved exceptions do not automatically cover new modules/tools.

## Scope
1. Finish Tasks 1–2 checks and fix proven defects in existing public/shared UI.
2. Establish the bounded /api/v1 contract in docs/api/first-five.md, Go transport/configuration and a same-origin Next.js forwarding boundary. The Go service owns data, sessions, credentials, permissions and validation. Next.js does not read PostgreSQL or create another auth system.
3. Add minimal migration/schema/query support for privileged accounts/roles, password hashes, encrypted TOTP, one-use recovery credentials, sessions, auth attempts, companies, managed lists and read-only public jobs. Use the already approved pgx/sqlc/golang-migrate architecture; verify and record stable eligible exact sqlc/migrate versions before installation or dependency edits. No framework/auth-as-a-service replacement.
4. Implement privileged bootstrap/provisioning as owner-run local commands. No public signup, invitation service or role-management UI. Add working auth, enrollment/challenge/recovery and server-side super-admin-only company management.
5. Integrate public live jobs/lists/details and the privileged/company frontend. Keep /prototype and /ui-preview explicitly fictional. Live mode never silently falls back to sample data. No real applicant collection.
6. Add meaningful backend, disposable-database, frontend contract and browser tests; documentation, independent review and resolution of findings.

## Out of Scope
Job creation/publication/archive UI/API, managed-list editing, applicant OTP/profile/applications/CV services, reports/recruitment/finance, hosting/provider research, production configuration/data, service control/HBA edits, running existing user-only setup, commits/pushes/merges/deployments or destructive recovery. No real job/employer/sample seeds inserted into the development database automatically. Disposable test fixtures require an explicitly selected test database and owner-run integration check.

## Affected Components / Expected Files
- New docs/api/first-five.md and docs/development/live-first-five.md; this spec and execution log.
- api/cmd/server/, api/cmd/admin/, api/internal/{config,httpapi,auth,authorization,companies,jobs,store}/ and corresponding tests.
- api/migrations/000001_first_five.up.sql and .down.sql; api/queries/, api/sqlc.yaml and generated api/internal/store/ queries. Exact generated file list follows the approved schema/tool resolution, never hand-edited outputs.
- web/lib/{api,session}/, web/app/admin/{sign-in,companies}/, web/components/{privileged-auth,companies}/ and contract tests; existing public routes/components reuse established design. web/next.config.ts only for the explicit Go origin boundary.
- .env.example only if needed to document nonsecret web/API flags. Existing strict localdb dotenv schema must remain compatible: prefer a separate ignored .env.api.example/.env.api for product secrets/configuration rather than adding keys to the provisioning file. .gitignore, tool-versions.json, api/go.mod/go.sum and web/package.json only for justified configuration/tool/test changes; no frontend dependency version updates.
- README.md, docs/development/website.md, frontend roadmap/spec/log statuses for verified behavior only. Preserve unrelated user files and prior evidence.

## Approved API Impact / Contract
The owner approved these endpoints and policies with “aproved” on 4 November 2026. No prior product API existed to preserve. JSON timestamps are RFC3339; IDs are opaque server-generated identifiers; integer versions support optimistic concurrency. Errors expose stable codes and approved field messages, never SQL/internal/auth/account-existence details. Malformed/oversized/unknown-field input fails before mutation. JSON request limit: 64 KiB. Implemented payloads and local configuration are documented in docs/api/first-five.md.

| Endpoint | Request / response and boundary |
| --- | --- |
| GET /api/v1/health | Minimal liveness; no configuration/secrets or database credentials |
| GET /api/v1/public/lists | Exact canonical category/location IDs and labels; read only |
| GET /api/v1/public/jobs | q, locationId, categoryId, employerType, jobType, closingSoon, sort, page, pageSize; published/nonexpired jobs only; deterministic page result with total; maximum pageSize 50 |
| GET /api/v1/public/jobs/{slug} | Public job fields, company projection, exact deadline and application method; draft/archived/expired/unknown returns 404; no intake endpoint |
| GET /api/v1/session | Issue/reuse a short-lived anonymous session cookie and its synchronizer CSRF token before first login; otherwise return current MFA-pending/authenticated state and token; no-store. No private data or authenticated role before completed MFA |
| POST /api/v1/auth/password | email/password plus anonymous-session cookie/CSRF token and exact Origin; generic failure or rotate anonymous state into limited MFA/enrollment state. Never exempt initial login from CSRF or grant full access on password alone |
| POST /api/v1/auth/totp/enrollment | Recent password-verified state only; protected enrollment secret/URI over approved origin; never logged/cached; existing verified TOTP cannot be overwritten |
| POST /api/v1/auth/totp/confirm | Confirm enrollment/challenge code, atomically consume time step and rotate to full session; issue one-use recovery codes only at enrollment |
| POST /api/v1/auth/recovery | Recent password verification plus one unused recovery code; consume/rotate atomically, revoke prior full sessions and require new authenticator enrollment before privileged access |
| POST /api/v1/auth/logout | CSRF-protected session revocation and cookie expiry; safe even when session already expired |
| GET /api/v1/admin/companies | Fully MFA-authenticated super admin only; bounded query/page/pageSize; no personal applicant data |
| POST /api/v1/admin/companies | name and employerType only; trimmed name 2–160 characters, approved employer-type enum; stable ID/version/timestamps returned after committed write |
| GET /api/v1/admin/companies/{id} | Super admin only; company plus paginated associated public/draft job summaries as appropriate to super-admin role; no applicant projection |
| PATCH /api/v1/admin/companies/{id} | name/employerType plus expected version; atomic update; stale version 409; missing record 404. No delete/merge or membership changes |

Company fields initially: id, name, employerType, version, createdAt, updatedAt. Company names are labels, not authority/verified status. Case-insensitive duplicate names return 409 rather than silently merging. Approved employer types stay Private company, NGO, Government. Future fields are separately specified; no fabricated addresses/contact information.

Public job data includes existing required job fields and validated method-specific destinations. Approved live closing-soon filter is the next 168 hours, newest order is postedAt descending then id descending, and expiry is the exact stored timestamp (<=now expired). The owner approved these defaults with this specification; they are not inferred from the sample snapshot. Currency/salary precision and slug redirects remain gated; unapproved optional salary data/redirect mutation is not invented. Job authoring is deferred to Task 6, so initial live datasets may be empty. Canonical list labels are seeded by migration, but no real/fake job inserts are performed automatically.

## Approved Security Impact / Decisions
The owner approved these defaults with the concrete specification on 4 November 2026:
- Privileged identities: one privileged role per account initially; company-admin account linked to exactly one company; recruiters see no company-admin mutation API. All three roles use password plus TOTP. Multi-role/multi-company changes are deferred, not silently inferred.
- Passwords: 15–128 Unicode characters, no trimming/composition rules; standard-library PBKDF2-HMAC-SHA256 with per-password 32-byte random salt and at least 600,000 iterations, constant-time verification and encoded algorithm/work-factor version. This avoids a new password-library dependency; benchmark and rate-limit the expensive path. It is not a claim of FIPS certification. Argon2id is an alternative if the owner prefers a new audited dependency.
- Bootstrap: owner-run CLI creates the first super admin only when none exists. Hidden terminal input, no secret argv/env/logging, no default password. Account stays enrollment-required until successful TOTP confirmation. Provisioning other privileged accounts is a local operator action, not a public endpoint. Agent prepares commands and never enters/collects the owner's password.
- TOTP: RFC 6238 six digits, 30-second steps, maximum one-step clock tolerance; consume matched counter transactionally to prevent replay across sessions. AES-256-GCM encrypted per-account secret with authenticated account/version context and a unique random nonce. Owner supplies the separate 32-byte protected key file; key path is configuration, key bytes never appear in dotenv/logs or repository. Startup fails closed if missing/unsafe. Key loss requires documented operator recovery; no automatic key rotation or reset.
- Recovery: generate ten cryptographically random one-use codes with at least 128 bits of entropy each at enrollment, display once after verification and store hashes only. Password plus an unused recovery code initiates re-enrollment, revokes sessions and does not bypass MFA. Lost password/all factors requires an explicitly authorised owner-run reset command; no email reset or security-question fallback. Exact operator identity-verification policy must be approved before presenting it as an operational recovery service.
- Cookies: opaque 32-byte random tokens with only SHA-256 token digests stored; host-only, HttpOnly, SameSite=Lax, Path=/; Secure required outside explicitly configured 127.0.0.1 HTTP development. Separate short-lived pending-MFA cookie/state. Rotate on password/MFA/recovery; delete/revoke on logout. Proposed full-session idle limit 30 minutes, absolute limit 8 hours; pending-MFA 5 minutes. Server rechecks current active role/company/session state on each protected request.
- CSRF/origin: GET /session creates an anonymous state with an opaque cookie and independent 32-byte server-stored random synchronizer token when no valid session exists. Anonymous state has no identity/role, expires absolutely after 5 minutes and is bounded by IP/global issuance limits. It uses the same host-only/HttpOnly/SameSite and environment-specific Secure cookie policy. The browser obtains the token through this no-store same-origin response before its first password submission. Every write, including initial login, requires the matching unexpired anonymous/pending/full cookie, constant-time CSRF-token match and exact configured Origin; missing/expired state fails 403 and the client obtains a new anonymous state. Successful password verification atomically consumes anonymous state and issues fresh pending-MFA session/cookie/CSRF token; successful MFA/recovery transitions rotate again and invalidate preceding tokens. Logout and expiry revoke the corresponding state. No login-CSRF exception. Same-origin forwarding only to fixed Go loopback origin; no permissive CORS, arbitrary target URL, trust of client role headers or private shared caching. Browser credentials forwarded only to that API; allowlist cookie/header handling and strip spoofable identity headers.
- Abuse: proposed password/recovery account-keyed maximum five failed attempts per 15 minutes, TOTP five attempts per pending challenge, plus IP and global concurrency limits. Atomic persistent counters prevent process restart bypass. Generic failures do not disclose existing accounts; bounded locks expire rather than permanently disabling an account. Account identifiers in limiter records use keyed digests rather than raw email.
- Private responses/session/enrollment/errors use no-store; TLS and trusted origin mandatory for nonloopback deployments. Public data may be cached only within bounded expiry behavior, with expired/draft records synchronously excluded. Protected server errors sanitized; never log credentials, OTP, TOTP secrets, recovery codes, session/CSRF tokens or candidate data.

Reference facts checked for this proposal: [Go standard-library PBKDF2](https://go.dev/pkg/crypto/pbkdf2/?m=old) and [OWASP password storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html). OWASP recommends Argon2id as the preferred general option and documents PBKDF2-HMAC-SHA256 at 600,000 iterations; the no-new-library tradeoff here is explicit and awaits approval. Other protocol details require current primary-source verification during implementation, not memory-only custom crypto design.

## Database Impact / Migration and Rollback Convention
New project schema only in dalka_jobs_dev; integration fixtures only in explicitly selected dalka_jobs_check. Existing owner data/resources must be inspected by the owner before applying migrations; the absent .env is a current setup gate. Agent does not run setup/dbcheck, connect to service or apply migrations under existing restrictions.

Use fixed-width, zero-padded paired migrations through golang-migrate, with schema/query generation through sqlc and pgx. First additive migration creates required tables/constraints/indexes and canonical list labels, no fake accounts/jobs. Foreign keys prevent orphan company/job/membership data; unique constraints cover auth identity/token/code/counter and concurrency/version invariants. Store UTC instants, render Africa/Mogadishu. Session/challenge/code consumption, auth-attempt updates and company edits have defined atomic transactions. Do not use permissive inherited session state or race-prone check-then-write logic.

No automatic migration on server startup, resource adoption or drop on failure. A down migration is destructive and must never run automatically; it is only a documented disposable-database test under owner authorisation. Development rollback after data exists uses the previous compatible application where possible or a reviewed forward fix with an owner-created backup/recovery plan. Do not claim a first-schema rollback is safe for real data. Migration/recovery acceptance requires owner-run disposable database evidence; compile/unit tests alone do not satisfy it.

## Tenant Impact
APPLICABLE. Enforce super-admin-only company mutations independently of UI. Reject missing/MFA-pending/revoked sessions and recruiter/company-admin requests. Company-admin identity cannot be rebound through a body/header/query parameter. Public queries return only published/unexpired vacancies and approved company/list fields, never credentials/private tables. Direct endpoints and altered IDs receive the same checks; no protected data in public caches. Full applicant/assigned-recruitment projections remain outside Tasks 1–5.

## Implementation Approach / Dependencies
Kept the existing checkout/branch with one implementation agent plus an independent reviewer. Implemented the ordered source steps below after exact-spec approval. Minimum backend prerequisites are included in this live scope rather than postponed to Task 20. Existing user-only database service restrictions persist unless explicitly changed by the owner.

| Small task | Objective / exact scope | Dependencies and expected files | Implementation / verification | Acceptance / status |
| --- | --- | --- | --- | --- |
| LIVE-00 | Approve concrete contracts/policies and validate minimum tool versions | This spec; docs/api/first-five.md, tool-versions.json, api/go.mod/go.sum as justified | Record approval; verify official tool metadata/age/pins before installation; record exact command results | COMPLETE: owner approved; tools version/hash/age verified |
| LIVE-01 | Complete public/shared UI QA | Existing source; relevant web fixes/tests and logs | Browser 375/768/1440 keyboard/search/reset/navigation/modal/focus; targeted regressions | Source/HTTP checks PASS; required browser QA BLOCKED |
| LIVE-02 | Schema/query/transport/config foundations | LIVE-00; migrations, queries/sqlc, internal store/config/httpapi, server command | Generate schema/query code; limits/errors/origin tests; go test/vet/build; owner-run disposable migration checks | SOURCE IMPLEMENTED; offline tests/build/generation PASS; DB acceptance BLOCKED |
| LIVE-03 | Public API and frontend client | LIVE-02; jobs/list transport and web API/session/public components | Published/expiry/filter/pagination/external-destination tests; live empty/error flows; no sample fallback or private cache | SOURCE IMPLEMENTED; client/HTTP contract PASS; real DB/browser acceptance BLOCKED |
| LIVE-04 | Privileged identities, sessions, MFA, recovery and sign-in | LIVE-02 and approved security defaults; auth/authorization/admin CLI and frontend | Replay/race/expiry/origin/CSRF/lockout/recovery/key handling/role-revocation tests, RFC vectors; owner provisions synthetic identities for integration | SOURCE IMPLEMENTED; offline credential/transport tests PASS; real MFA/recovery acceptance BLOCKED |
| LIVE-05 | Super-admin company management | LIVE-03/04; company store/handlers/UI and tests | Persist/reload create/edit/search/association, conflict validation, reject other roles/forged IDs | SOURCE IMPLEMENTED; integration suite compiled; real DB/browser CRUD acceptance BLOCKED |
| LIVE-06 | Combined acceptance, docs, review and findings | LIVE-01–05; docs/roadmap/log and bounded source fixes | Run evidenced checks; inspect full diff/new files; independent security/data/functional review; resolve/review findings | Docs/checks/source fixes complete; full independent acceptance BLOCKED by DB/browser evidence |

## Edge Cases
Empty live database; API offline; expired job during cache lifetime; missing list ID/unknown slug; invalid external destinations; simultaneous company edits; duplicate company names; deleted/revoked role or membership while open; password/OTP/TOTP/code replay and parallel consumption; session fixation; partial MFA; concurrent enrollment/recovery; missing encryption key/unsafe file ACL; generic failure enumeration; restart without limiter reset; clock drift; missing migration/dirty state; existing local resources; no browser control.

## Test Plan
Established available commands: from web/, npm.cmd run test:unit, lint, build then typecheck, and existing test:prototype-http against a separately started loopback preview. From api/, go test ./... and go vet ./...; build relevant commands to ignored/temporary output without running provisioning helpers. From root, git diff --check and direct new-file inspection. Do not rerun existing checks for a documentation-only proposal or claim these checks validate unimplemented live code.

Future live commands must be implemented/documented before execution. Required backend tests cover transport limits, structured validation, private response caching, strict origin/CSRF and session lifecycle, TOTP primary vectors/counter replay, password verification/limits, one-use recovery, concurrent company writes and role/tenant denial. Integration scripts must refuse nonloopback endpoints and any database other than explicitly approved dalka_jobs_check; never reset development data automatically. Database setup, migration/recovery and seeded-integration commands remain owner-run under current restrictions. Record all blocked commands separately from passes.

Browser acceptance requires supported real browser evidence at 375/768/1440 for public pages, shared controls, auth/MFA/recovery and company CRUD, including focus/error/empty/loading/offline/session-expired states. The latest computer-use attempt stopped because it could not confidently determine the current Chrome URL; further UI input ended. No bypass or guessed browser URL is permitted. Owner can restore supported browser access or provide separate manual acceptance evidence; HTTP tests never count as browser interaction.

## Acceptance Criteria
1. Tasks 1–2 meet original responsive/accessibility/interaction criteria with recorded real-browser evidence, source regressions passing and review findings resolved.
2. Task 3 calls the actual Go public API through the defined origin boundary, renders persisted published/unexpired jobs and canonical lists, correctly reports empty/offline/error states, rejects invalid inputs, has no sample fallback and no sample/expired JobPosting metadata. Verify current official Google eligibility before real JobPosting output; unapproved fields are not fabricated.
3. Task 4 works for super admin/recruiter/company admin only after password plus successful TOTP; pending/replayed/expired/revoked/forged sessions fail. Bootstrap/enrollment/recovery/logout have owner-approved policy and verified atomic lifecycle; no credential leaks or real-secret fixtures.
4. Task 5 persists super-admin-only company create/edit/search/reload/associations; validates fields, version conflicts and duplicates; other roles/altered identifiers fail independently of navigation.
5. User-run migrations, setup/ACL checks, disposable database integrity/recovery and browser workflows have actual evidence. Unit/compile/HTTP success alone cannot satisfy these gates.
6. Final diff includes only authorised scope, existing work preserved, no secret/dependency drift/unapproved service or release actions, independent review approved after findings fixed. Mark each first-five task complete only after its applicable acceptance passes.

## Risks
This adds security-sensitive identity/data infrastructure; premature auth/recovery/default-policy assumptions could create privileged access. Unknown database runtime/setup means integration cannot currently be claimed. Exact schema/query tooling versions still need official eligibility checks before changes. Browser control failure prevents complete Task 1/2 and end-to-end acceptance. No production readiness or launch follows local implementation.

## Estimated Complexity
Large multi-component increment across backend security/data and frontend. Execute in the bounded steps above; no unsupported completion-time estimate. Requires approved contracts/policies, configured local PostgreSQL, owner-run bootstrap/key setup/integration and restored browser evidence.

## Task Approval and Lifecycle
REQUEST/REPOSITORY INVESTIGATION/SPECIFICATION/TASK APPROVAL/SMALL TASK BREAKDOWN: COMPLETE. Owner explicitly approved this specification with “aproved” on 4 November 2026 and later instructed resuming completion. IMPLEMENTATION: first-five backend/frontend source, generated queries, scripts and documentation implemented. TESTING: offline Go tests/vet/helper builds, sqlc generation, 36 frontend unit tests, lint/build/typecheck, 50-page preview HTTP and synthetic live-contract HTTP checks PASS. Database integration suite compiled without execution. Real PostgreSQL migration/recovery, authentication/company workflows and browser evidence remain BLOCKED by explicit owner-run/tooling prerequisites. INDEPENDENT REVIEW: source findings resolved; full acceptance BLOCKED by missing runtime evidence. ISSUE RESOLUTION: resolved source findings recorded in log; runtime blocks persist. Tasks 1–5 are not marked fully complete. FINAL OWNER APPROVAL/AUTHORISED MERGE/POST-MERGE VERIFICATION: PENDING; no commit/push/merge/deployment permission.

## Implemented local adjustments and remaining gates
- Stable eligible tools verified from publisher releases and SHA256 assets: sqlc 1.31.1 and migrate 4.20.1. Recorded in tool-versions.json; tools installed only under ignored .tools, generated store code checked from SQL. No new runtime Go module or frontend dependency was needed.
- Added the necessary owner-run cmd/migrate, hidden-input admin wrapper, private-key creation and tool install scripts alongside the originally listed files. No script connecting to PostgreSQL or creating real credentials/keys was executed by the agent.
- Port 8080 is occupied by an existing wildcard listener on this machine. It was left untouched. DALKA_API_PORT now allows a canonical integer 1–65535 in both Go and Next server configuration; default remains 8080 and hostname is fixed at 127.0.0.1. Handoff/tests use 8081. This local configuration adjustment introduces no arbitrary target hostname or API contract change.
- Dynamic job routes and web/proxy.ts prevent cached sample details and decide missing-job status before the root loading boundary starts a 200 stream. Known missing jobs receive a direct static branded 404 response with no user-controlled HTML. Both live and preview HTTP regressions pass after this fix.
- Operational handoff: docs/development/live-first-five.md. Current restrictions still require the owner to run database setup/checks, migrations, private-key creation and account bootstrap, then the real integration/browser journeys. The agent has completed the authorised offline work; passing it does not waive live acceptance.
