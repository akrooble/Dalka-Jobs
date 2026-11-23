# TASK-001-CONTINUE-08-12 — previous-task closure and next five tasks

## Task ID / Title / Type / Priority
TASK-001-CONTINUE-08-12 / Resolve pending FE-07 work and start FE-08–FE-12 / Fix and planning / Owner priority, 11 November 2026.

## Problem Statement / Current Behavior / Expected Behavior
The owner requests completion of pending previous work and starting the next five tasks. FE-07 source exists; runtime acceptance is still unavailable. Its log references a missing review/manifest. Independent review found that the integration test defers connection close and advisory unlock until function return, but performs fixture deletion in `t.Cleanup`, which runs later. It also registers cleanup after initial inserts. Expected: cleanup registered before fixture mutation, running while the connection and exclusive advisory lock are held; truthful refreshed evidence and five concrete specifications ready for policy/contract approval.

## Root Cause / Repository Evidence
Go function defers run before testing cleanup callbacks. Evidence: `api/internal/httpapi/integration_test.go`, FE-07 spec/log, `docs/development/task-board.md`, `TASK-001.md`, frontend roadmap, AGENTS and root workflow files. Current root/branch/status verified; existing changes preserved. FE-08–FE-12 have sample screens only. `accounts` and `sessions` currently represent privileged identities only.

## Scope / Out of Scope
Fix integration resource/fixture lifecycle only; obtain independent source review; refresh offline/HTTP/browser availability evidence; create five specifications and a proposed shared contract; develop the FE-12 remaining-panel design. Update task board and roadmap links. Leave the active live-first-five guide untouched because its editor buffer has unsaved user changes. Missing historical FE-07 evidence will be replaced by explicitly dated current evidence, never backdated.

No setup, dbcheck, credential reads, migrations, PostgreSQL connection, real file collection, external delivery, release operation or unapproved applicant API/schema. Runtime acceptance stays BLOCKED. New contract choices remain proposals until explicit approval; existing production-email-only, private-CV and retention requirements remain authoritative.

## Affected Components / Expected Files
`api/internal/httpapi/integration_test.go`; new continuation log/review and FE-07 current-source manifest; `tasks/specs/TASK-001-FE-08.md` through `FE-12.md`; `docs/api/applicant-next-five-proposal.md`; `docs/design/admin/remaining-panels.md`; task board and roadmap. No edit to the active live-first-five guide.

## Database / API / Security / Tenant Impact
No database execution or application contract change. The test fix preserves connection/lock ownership through cleanup and cleans partial fixture setup within the already guarded disposable database. Applicant drafts must specify own-data authorization, privilege separation, upload/deletion/consent and company projections before implementation. No production or tenant acceptance claim.

## Implementation Approach / Edge Cases
Register close first and advisory unlock second with `t.Cleanup`; after successful existing safety/emptiness guards, register fixture cleanup before first insert. LIFO then runs fixtures, unlock, close. Early preflight failures must never register deletion. Existing `httptest` server still stops at function return before fixture deletion. Preserve canonical managed lists. Draft exactly FE-08–FE-12 in roadmap order, showing dependency blocks and proposed decisions. FE-12 design may progress independently but cannot certify blocked prerequisites.

## Test Plan / Acceptance Criteria
From `api/`, workspace GOCACHE: offline `go test ./...`, `go vet ./...`, integration compile `go test -tags=integration -run '^$' ./internal/httpapi`. Record Windows identity failures honestly; never weaken ACL guards. From `web/`, existing unit/lint/build/typecheck scripts and HTTP suites against owned local frontend servers if available. Browser availability inventory only before any browser acceptance. Root `git diff --check`, inspect untracked edits and local document links. Independent reviewer verifies cleanup registration/order, five specs, policy boundaries and evidence.

Acceptance: (1) test deletion runs before unlock/close and covers partial insertion failures; no deletion registered before guards; (2) latest review and snapshot evidence exist with current dates; (3) five task specs include measurable acceptance, dependencies and explicit policy gaps; (4) remaining-panel design records own/assigned/company/global permissions and forbidden/stale/empty states; (5) docs clearly separate source completion from blocked runtime acceptance and proposed contracts from approval.

## Risks / Dependencies / Estimated Complexity
Risk: destructive test cleanup without exclusivity or overclaiming live completion. Mitigate with unchanged empty-check DB guards, lock lifetime and no execution here. Dependencies: installed tools, owner-run DB/browser evidence and applicant policy choices. Complexity small fix plus medium planning/design; no new dependencies.

## Approval / Small Task Breakdown / Lifecycle
Owner's 11 November request explicitly authorizes finishing pending work and starting the next five tasks. This authorizes the discovered lifecycle fix and specification/design work. It does not settle new policy defaults or revoke owner-only database/release restrictions.

| ID | Objective / exact scope | Dependencies | Files | Steps / verification | Acceptance | Status |
| --- | --- | --- | --- | --- | --- | --- |
| CONT-1 | Correct integration cleanup lifetime | Investigation | integration_test.go | Register LIFO callbacks before inserts; compile and independent review | 1 | Source/review COMPLETE; actual DB cleanup BLOCKED |
| CONT-2 | Current FE-07 review and evidence | CONT-1 | log/review/manifest/docs | Offline checks; browser inventory; inspect snapshot | 2, 5 | Current evidence COMPLETE; runtime acceptance BLOCKED |
| CONT-3 | Start FE-08–FE-12 specifications/design | Roadmap/policy investigation | five specs, contract proposal, design | Write bounded contracts and dependency-order breakdown; review links/permissions | 3–5 | Specification/design/review COMPLETE; owner contract/design approval PENDING |

Request/investigation/specification/task approval/breakdown/source fix/document drafting/available checks/independent bounded review/issue resolution COMPLETE. Full Go suite has an explicit sandbox identity failure; DB/migration/recovery/browser acceptance BLOCKED. New applicant contract/design approval and dependent implementation PENDING. Final owner approval, commit/push/deploy/merge/post-merge PENDING; no release authorization. Evidence: shared log and review alongside this spec.
