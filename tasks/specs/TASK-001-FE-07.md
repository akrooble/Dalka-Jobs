# TASK-001-FE-07 — live managed categories and locations

## Task ID / Title / Type / Priority
TASK-001-FE-07 / Super-admin managed lists / Feature / Next owner-selected roadmap task.

## Problem Statement / Current Behavior / Expected Behavior
Category/location administration is sample-only. Canonical seeded lists already drive live public filters and job authoring. Full-MFA super admins need persisted search/create/rename/deactivate/reactivate with truthful usage/conflict feedback, preserving existing job references.

## Root Cause
NOT APPLICABLE: next integration feature.

## Repository Evidence
`AGENTS.md`, workflow documents, `TASK-001.md` (001-11a), `TASK-001-FRONTEND-PLAN.md` (FE-07), `docs/development/task-board.md`, `api/migrations/000001_first_five.up.sql` (canonical seeds/FKs), `api/queries/first_five.sql`, `api/internal/httpapi/{api,jobs,admin_jobs,companies}.go`, `api/cmd/server/main.go`, `web/lib/api/client.ts`, `web/components/jobs/job-manager.tsx`, `web/app/admin/[...section]/page.tsx`, and FE-06 execution/review evidence.

## Scope / Out of Scope
Scope: full-MFA super-admin list search/filter/pagination/detail/create/rename and reversible active state; version conflicts; usage counts including all job statuses; unchanged immutable IDs/kind; public filters/new job references use active values. Conservative reference rule: deactivate only when no job of any status references the entry. Renaming keeps IDs and joins, so current public labels update without job reassignment. No removal/replacement/cascade of referenced values. Original canonical seed labels remain untouched by migrations. No new dependency.

Out of scope: delete/merge/list kind changes, bulk import, new applicant services, employer authority/privacy/finance, production launch, credentials, DB/setup/migration/integration execution or release. Prior source features' real DB/browser acceptance remains unverified; this continuation authorizes the next source slice, not acceptance of prerequisites.

## Affected Components / Expected Files
New API managed-list handler/tests and migration 000003; existing API routing/error map, job reference checks, public filters/lists, queries/generated store, schema startup gate and owner-run integration source. New live list manager and `/admin/lists` route; API client types/allowlist; navigation; frontend API tests and synthetic HTTP coverage. New contract/spec/log/review plus README, setup/QA/roadmap/task-board updates.

## Database Impact
Add `active boolean NOT NULL DEFAULT true`, positive `version bigint DEFAULT 1`, `updated_at timestamptz DEFAULT now()` to managed_lists; add unique index on kind/lower(label), preserve existing exact-label uniqueness, IDs/kind/FKs and canonical seed contents. Index both job reference columns for usage checks. Existing duplicate case-insensitive legacy labels cause migration refusal rather than automatic merging. New server requires clean schema version 3; no startup migrations. Regenerate with installed pinned sqlc, never hand-edit generated files.

Owner alone applies existing `go run ./cmd/migrate up development` / `up check`. Migration remains unexecuted here. Rollback convention: stop incompatible app, preserve state, use reviewed forward fix/compatibility work or owner-created backup recovery. Prior schema-2 binary refuses schema 3; no automatic downgrade. Supplied down file loses active/version/update metadata and re-exposes deactivated labels, only for separately authorized disposable recovery tests; no down/drop/reset execution.

## API Impact
Add protected GET/POST `/api/v1/admin/lists` and GET/PATCH `/admin/lists/{id}`. GET list: q max 100 Unicode chars, kind category/location or empty, active true/false or empty, page 1–100000, pageSize 1–50 (default20). Return `{items,total,page,pageSize}`; entries `{id,kind,label,active,version,updatedAt,jobCount}` sorted kind/lower(label)/id. Detail returns same entry. POST `{kind,label}` always active, random cat-/loc-prefixed stable ID; PATCH `{label,active,version}` retains kind. Required active pointer/version enforced, unknown keys rejected. Label trimmed/collapsed internal spaces, 2–100 Unicode chars, no controls; per-kind case-insensitive uniqueness across active/inactive entries. Duplicate409 `conflict`, stale409 `stale_list`, missing404, invalid422; referenced deactivation409 `list_in_use` with safe explanation. GET public/lists preserves `{id,kind,label}` shape but only active entries; public unknown/inactive filter IDs reject422. Public reads of jobs preserve current joins/visibility; in-use deactivation is forbidden, including draft/archived/expired references.

## Security Impact / Tenant Impact
Reuse full-MFA active super-admin guard on every admin handler; anonymous/pending/recruiter/company-admin/revoked denied even with forged client role headers/IDs. Existing Origin/CSRF/no-store/bounded JSON/query protections and transactions apply. Parameterized SQL only. No applicant/private-data scope; super-admin global list administration only.

## Implementation Approach / Edge Cases
Lock entry FOR UPDATE before version/reference checks and update in same transaction. Job references hold FOR SHARE locks and now require active=true; whichever operation wins determines safe outcome, preventing deactivation/new-job races. Consistent category-before-location reference order retained. Labels may rename while referenced; count all statuses. React keeps unsaved form on validation/duplicate errors, explicitly reloads stale versions, aborts obsolete loads and clears protected data on revoked access. New inactive entries remain reserved for reactivation; no reuse of deleted identity. Empty lists/lookup offline, delayed responses, duplicate clicks, stale pages, cross-kind IDs and whitespace/Unicode labels covered.

## Test Plan
From `api/` with workspace GOCACHE: `go test ./...`, `go vet ./...`, and `go test -tags=integration -run '^$' ./internal/httpapi` (compile only). Extend owner-only integration with CRUD/state/duplicate/version/role/MFA/CSRF denial, reference protection, rename propagation, inactive authoring rejection and concurrent job/deactivation checks. Do not execute DB tests here. From `web/`: existing `test:unit`, `lint`, `build` then `typecheck`; preview frontend/prototype and synthetic live HTTP scripts on task-owned loopback servers. Browser checks at375/768/1440, keyboard/form/read/reload/conflict/state needed; unavailable checks BLOCKED. Root diff/new-file/whitespace/link checks and byte-for-byte sqlc generation; independent reviewer required.

## Acceptance Criteria
1. Live `/admin/lists` uses protected persisted services; sample route still works in sample mode.
2. Authorized super-admin creates/renames/reactivates unused entries and deactivates only unused entries; IDs/kind fixed and duplicates/stale writes refused.
3. Renames propagate through current job joins/public filter labels; inactive entries disappear from public lists and cannot receive job references; referenced deactivation cannot race with authoring.
4. Non-super/anonymous/pending/revoked access and bad Origin/CSRF cannot read/write admin lists; bounded input and safe errors retained.
5. Meaningful offline/HTTP checks and independent source review complete; DB/migration/recovery/browser gaps reported without claiming acceptance/release.

## Risks / Dependencies / Estimated Complexity
Risks: hiding referenced filters or silently reassigning jobs, case-insensitive legacy duplicates, stale admin forms. Mitigate with no delete, reference locks/conflicts, unique index and explicit version recovery. Dependencies: existing FE-03–06 source, pinned tooling and owner-run runtime setup. Complexity medium; no new dependencies selected.

## Approval / Small Task Breakdown / Lifecycle
10 November owner's “don the next” follows the named FE-07 next task and explicitly authorizes this source implementation. The reversible/no-delete policy is the bounded implementation choice described to the owner; existing restrictions on DB and release operations persist.

| Small Task ID | Objective / exact scope | Dependencies | Expected files | Steps / verification | Acceptance | Status |
| --- | --- | --- | --- | --- | --- | --- |
| LIST-1 | Schema/contracts/admin API/active references | Investigation | API/migration/query/store/tests | Add metadata, lock/check writes, regenerate; Go tests/vet/integration compile | 2–4 | Source COMPLETE; DB acceptance BLOCKED |
| LIST-2 | Live list manager/navigation | LIST-1 contract | web components/routes/client/tests | Reuse shared controls, state/conflict/access UX; unit/lint/build/types | 1–4 | Source COMPLETE; browser acceptance BLOCKED |
| LIST-3 | Regression/docs/independent review | LIST-1–2 | tests/docs/spec/log/review | HTTP/doc/diff/new-file checks; resolve review findings | 5 | Offline/HTTP/docs/coverage resolution COMPLETE; overall runtime review BLOCKED |

Request/investigation/specification/task approval/breakdown/source implementation/offline and HTTP testing/source coverage resolution COMPLETE. Independent source review found no actionable defects; final overall acceptance BLOCKED by runtime DB/migration/recovery/browser prerequisites/evidence. Final owner/release/authorized merge/post-merge PENDING.
