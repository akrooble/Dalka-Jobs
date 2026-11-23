# TASK-001-FE-06 — live super-admin job management

## Task ID / Title / Type / Priority
TASK-001-FE-06 / Persistent draft, preview, publish and archive workflows / Feature / Next owner-selected build.

## Problem Statement / Current Behavior / Expected Behavior
Jobs have public reads and a PostgreSQL table, but authoring is sample-only. A full-MFA super admin must be able to create, search/filter, inspect/preview and edit persistent jobs, then publish/archive them into/out of existing public discovery. Live mode must never render fictional job management.

## Root Cause
NOT APPLICABLE: new service integration.

## Repository Evidence
`api/internal/httpapi/{api,companies,jobs}.go`, `api/migrations/000001_first_five.up.sql`, `api/queries/first_five.sql`, `api/sqlc.yaml`, `api/cmd/server/main.go`, `web/components/frontend/jobs.tsx`, `web/components/companies/company-manager.tsx`, `web/lib/api/client.ts`, `web/app/admin/[...section]/page.tsx`, `docs/api/first-five.md`, `docs/development/live-first-five.md`, `TASK-001.md` (001-11a), and the current task board.

## Scope / Out of Scope
Scope: protected job list/detail/create/full-field edit, explicit status controls, immutable server-generated slug, version conflicts, company and canonical list selection, plain-text protected preview, draft/publish/archive and public consistency. Reuse the existing three job types, three arrangements and four application methods. Only the three external methods may publish; on-site recruitment may be configured in drafts but cannot publish in this increment.

Out of scope: applicant intake, employer authority administration, applicant/CV/private data services, FE-07 list writes, deletion, deployment, credentials, service/setup/migration execution. Owner explicitly selected leaving optional salary out for now in the 10 November reply; range/currency rules remain future work. No new dependency.

## Affected Components / Expected Files
New `api/internal/httpapi/admin_jobs.go` and tests; route registration; additive migration 000002 job version/updated_at/first_published_at; SQL queries and regenerated store; startup schema gate; integration test expansion. `web/lib/api/client.ts`, new job manager/editor helper/tests and explicit `/admin/jobs` and `/admin/job-editor` routes, existing live company navigation. Optional live header/footer props and public home/detail callers preserve truthful persisted-job presentation; route metadata avoids inherited fictional-listing claims. Task board, roadmap, API/development/QA docs and this spec/log/review. Exact files are recorded in the execution log.

## Database Impact
Migration 000002 adds positive bigint version (default 1), updated_at (default now) and nullable first_published_at to jobs without removing data. Existing published/archived rows backfill first_published_at from their preserved posted_at, conservatively treating historical archived rows as previously published; drafts leave it null until first publication. This prevents later edits/republication from boosting public order. Existing migration 000001 is unchanged. Server requires clean version 2. Queries regenerate using the installed pinned sqlc, never hand-edit generated files. Owner alone applies `go run ./cmd/migrate up development` / `up check`. Existing owner-run checks remain blocked until actual evidence exists.

Rollback: do not run down or reset. Stop the new app before owner backup/forward-fix work. Prior schema-1 binary refuses schema 2; rollback requires reviewed compatibility work or an owner-restored backup, not automatic downgrade. The supplied down file removes only these new metadata columns, loses version history and is disposable-owner recovery testing only. No runtime recovery pass claimed.

## API Impact
Add `/api/v1/admin/jobs` GET/POST and `/admin/jobs/{id}` GET/PATCH. Existing public responses unchanged. GET list accepts q/status/companyId/page/pageSize, defaults page 1/20, max size 50; statuses draft/published/archived. Detail/create/edit return all authoring fields plus companyId, employer/location/category labels, status, version and timestamps. POST requires fields and creates draft only; PATCH is full replacement of editable fields plus positive version/status. Server controls ID/slug/postedAt/version/updatedAt. Slug `job-<opaque-id>` is unique, stable and matches existing public syntax; title edits do not alter URL. First publication sets postedAt to request time; subsequent updates do not boost ordering. Drafts also have creation-time postedAt from the existing non-null column. Conflicts 409, missing job 404, bad fields/references 422; existing bounded JSON/origin/CSRF errors remain.

## Security Impact / Tenant Impact
Every job handler calls the existing full-MFA active-account super-admin guard before data access. No recruiter/company-admin writes or private previews; company IDs are validated references, never authority claims. Same-origin transport, CSRF, no-store, body/query bounds and parameterized SQL apply. Company association is immutable after creation (prevents later dependent-data reassignment). Foreign list kind/reference validation applies to both drafts and publications. Public reads continue to hide draft/archived/expired jobs. No applicant information is exposed.

## Implementation Approach / Edge Cases
Use existing request transactions/guard and store patterns. Validate title 3–160 Unicode characters, description 1–20,000, IDs/list types/enums, destination max 2,048 and existing method-specific destination rules. Reject control characters except description line breaks/tabs. Trim text. closesAt must be a canonical RFC3339 instant with explicit offset, minute precision and year 2000–9999; editor labels UTC+3 explicitly and converts deterministically without browser-local timezone. Draft/archived may have past deadlines; published must be strictly future and an external method. Deadline equality is expired. No unpaid-invoice gate. Publishing an expired draft fails; reopening is allowed only with future deadline and valid external method. Reuse integer version conflicts and atomic UPDATE conditions. Protected GET detail is preview data; UI renders plain text, no active application action. Handle missing references, pagination, expired sessions and stale-load/save responses honestly.

## Test Plan
Offline from `api/` with workspace GOCACHE: `go test ./...`, `go vet ./...`; `go test -tags=integration -run '^$' ./internal/httpapi` compiles only. Add validation/transport regressions and extend the existing explicit-opt-in empty-check-database integration for role/MFA/CSRF denials, authoring persistence/conflicts/reference rejection/publication/expiry. Never execute integration/setup/DB operations here. From `web/`: `npm.cmd run test:unit`, `lint`, `build`, then `typecheck`; preview and synthetic live HTTP suites on task-owned loopback servers only. Browser acceptance at 375/768/1440 with keyboard, draft/create/edit/reload/preview/publish/archive and conflict/session checks remains required. Inspect final actual/new files and `git diff --check`; independent reviewer required.

## Acceptance Criteria
1. Live job routes display service-backed job management; samples remain functional in sample mode.
2. Super-admin can create a draft, inspect saved preview, edit with version, publish valid external job and archive it; published-only unexpired public results reflect changes.
3. Non-super/anonymous/pending/revoked requests cannot read/write protected jobs; wrong Origin/CSRF rejected. No live on-site publishing/intake.
4. Invalid fields/destinations/references and stale updates fail; no company reassignment; stable slug and first publication time retained.
5. Meaningful offline checks and independent source review complete; unexecuted real DB/browser acceptance stays BLOCKED. No release or DB operation.

## Risks / Dependencies / Estimated Complexity
Dependencies: current auth/public/company source and local pinned tools. Prior FE-03–05 runtime acceptance remains BLOCKED; owner now authorizes advancing the source slice, not accepting prerequisites. DB/integration/recovery/browser acceptance of this feature remains blocked until owner-run prerequisites/evidence exist. Risk of public posting mistakes is bounded by explicit draft-first creation, protected preview and publication validation. Complexity: medium, coordinated API/UI integration.

## Approval / Breakdown / Lifecycle
Owner's 10 November “ok lets start the next tasks” follows the concrete task-board FE-06 proposal and authorizes this implementation scope. No further release authorization inferred. Owner then explicitly selected “Leave salary out for now (recommended)”.

| Small task | Objective / scope | Dependencies | Files | Steps / verification | Acceptance | Status |
| --- | --- | --- | --- | --- | --- | --- |
| JOB-1 | Contract, additive schema and persistent job endpoints | Investigation | API/migration/query/store | Validate, guard, atomic writes; Go unit/vet/integration compile | API criteria 2–4 | Source COMPLETE; real DB acceptance BLOCKED |
| JOB-2 | Live job manager/editor/protected preview | JOB-1 contract | web client/components/routes/tests | Reuse controls; deterministic deadline helper; frontend unit/lint/build/types | Criteria 1–4 | Source COMPLETE; browser acceptance BLOCKED |
| JOB-3 | Regression, documentation and independent review | JOB-1–2 | Tests/docs/review/log | Offline/HTTP checks, diff/new-file inspection, fix findings | Criterion 5 | Offline/HTTP checks/docs/source finding resolution COMPLETE; overall review BLOCKED by runtime evidence |

Request/investigation/specification/task approval/breakdown/source implementation/offline and HTTP testing/source issue resolution COMPLETE. Independent source review found no unresolved actionable findings; overall acceptance BLOCKED by required real DB/migration/recovery/browser evidence. Final owner approval/authorized merge/post-merge PENDING.
