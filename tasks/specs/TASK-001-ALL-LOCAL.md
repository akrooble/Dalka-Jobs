# TASK-001-ALL-LOCAL — finish the local task roadmap

## Task ID / Title / Type / Priority
TASK-001-ALL-LOCAL / Complete locally authorized frontend and service tasks / Feature and verification / Owner requested 23 November 2026.

## Problem Statement / Current Behavior / Expected Behavior
The 11 November task board records source through FE-07, later sample workflows, drafted FE-08–12 contracts and outstanding runtime acceptance. The owner requested “do it all” after being shown the twenty tasks and next approval/verification steps. Implement the local roadmap in dependency order, preserving existing work and reporting each remaining gate accurately. Local implementation is not deployment or production intake approval.

## Root Cause / Repository Evidence
Planned incomplete work, not a single defect. Evidence: `docs/development/task-board.md`, `tasks/specs/TASK-001.md`, `TASK-001-FRONTEND-PLAN.md`, FE-08–12 specs, `docs/api/applicant-next-five-proposal.md`, `docs/design/admin/remaining-panels.md`, current Go/pgx/sqlc API and Next/React client. Branch `task/001-03b-local-database` has substantial pre-existing uncommitted work; preserve it.

## Scope / Out of Scope
Approve the recommended A–H contracts for local development under the owner's current request; implement in dependency order with meaningful security and compatibility checks. Record concrete later policy choices before implementing their consumers. Keep real email, real CV/applicant intake, release and production operations gated on actual missing prerequisites. No production provider is selected, no public policy copy fabricated and no real database/setup/bootstrap/key/credential operations performed: existing owner-run restrictions remain. No commit, push, merge or deployment is authorized.

## Affected Components / Expected Files
API auth/domain/HTTP/queries/migrations/generated store/tests and server schema gate; web live account/admin/role/finance components and session/client/proxy routes/tests; feature specifications and API/development/QA docs. One implementation agent; independent reviewer reads the resulting source and evidence.

## Database / API / Security / Tenant Impact
Additive migration source only with compatibility/forward-recovery documentation before changes. Preserve privileged MFA and existing public/admin contracts. Every own-data, assigned-job, own-company and super-admin check is server-enforced; no role inference from client state. Preserve exact Origin, CSRF, bounded bodies, no-store, private files, audit minimization, deletion and retention requirements. Run only offline checks and compilation until owner-run DB prerequisites are satisfied.

## Implementation Approach / Edge Cases
Start FE-08: separate applicant identities; exclusive session subjects; purpose/identity/session-bound keyed OTPs; durable limits, exact expiry, resend invalidation and one-use rotation. Extend originating anonymous session only to challenge expiry after accepted request. Use explicit development terminal adapter for synthetic `.invalid` identities only, with a reserved fictional-testing acknowledgement; production/default delivery is disabled. This resolves missing approved real policy/provider without collecting real identity. Switch every live account route away from sample data. Then progress through profile/private-file lifecycle, authority/intake/events, remaining role services and integration as prerequisites allow. Preserve all existing role guards, reject ambiguous sessions and retain recoverable error states.

## Test Plan / Acceptance Criteria
Run `go test ./...`, `go vet ./...` and integration compilation from `api`; frontend unit/lint/build/typecheck and synthetic HTTP suites from `web`. Use workspace GOCACHE. Add OTP exact-boundary/replay/purpose/identity/format and session-isolation tests; owner-only synthetic DB tests for transaction/concurrency/persistence. Browser acceptance requires observed hydrated behavior at 375/768/1440; never infer it from HTTP. Independently review source including untracked additions. All twenty tasks must meet their individual acceptance criteria before claiming the roadmap complete; missing services, real DB and owner design acceptance remain explicitly outstanding.

## Risks / Dependencies / Estimated Complexity
Large multi-feature task. Hostile files, financial arithmetic, tenant projection, auth races, privacy lifecycle and stale caches require separate verifiable slices. Missing public policies/provider/scanner/storage/backup evidence constrain activation, not independent source work. Existing tool pins reused; no new dependency selected for FE-08.

## Approval / Lifecycle
Owner's 23 November 2026 “do it all” authorizes local implementation and verification of the listed roadmap and recommended local contracts. This authorization supersedes the earlier preparation-only selection for local source work. Real intake prerequisites and explicit release restrictions still apply. Request/investigation/specification/task approval COMPLETE; implementation/testing/review/issue resolution IN PROGRESS; owner runtime/design acceptance and final approval PENDING; owner-only DB verification BLOCKED pending owner execution; release/merge/post-merge PENDING and unauthorized.
