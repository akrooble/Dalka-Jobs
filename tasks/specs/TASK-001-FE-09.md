# TASK-001-FE-09 — private profile, CV and deletion

23 November update: owner “do it all” authorized local source work in [ALL-LOCAL](TASK-001-ALL-LOCAL.md). Own profile/version and fresh-code identity/profile/session deletion source is implemented and reviewed for the current no-files/no-applications slice. CV validation/scanning/storage, submitted retention/restore and actual DB/browser remain BLOCKED/unimplemented. See [current profile contract](../../docs/api/applicant-profile.md), [execution evidence](TASK-001-ALL-LOCAL-log.md) and [review](TASK-001-ALL-LOCAL-review.md). Original planning/lifecycle text below is historical.

## Task ID / Title / Type / Priority
TASK-001-FE-09 / Own profile, private CV lifecycle and deletion foundation / Feature specification / Second of next five, 11 November 2026.

## Problem Statement / Current Behavior / Expected Behavior
`web/components/frontend/applicant-profile.tsx` uses reserved fictional contacts and a built-in CV. No private file/profile/deletion service exists. Expected: authenticated own contact editing and validated private CV replacement/removal/download, with immediate account/profile deletion distinct from submitted-copy retention.

## Root Cause / Repository Evidence
NOT APPLICABLE: planned feature. Evidence: TASK-001 CV/privacy requirements and001-13–15, roadmap FE-09/B3, applicant sample profile/demo-provider, existing API session/transport and schema. No file parser/scanner/storage/backup/restore infrastructure is evidenced.

## Scope / Out of Scope
Approve choices C/D/E and FE-09 section in [contract proposal](../../docs/api/applicant-next-five-proposal.md), then implement own profile and private file interface/quarantine/content checks, versioned CV pointer and independent snapshot primitive, fresh-verification deletion, durable purge intents and retention/restore foundation. No real files now, production storage selection, actual purge/backup operations, applicant exports, identity-email replacement or staff/company downloads.

## Affected Components / Expected Files
New API applicant/files/deletion/retention packages, migration/query sources, private upload ignore rules; live profile/CV/deletion components/routes/client/tests; storage recovery/owner-run QA docs. Parser/scanner dependency selection/pins require documented approval before implementation; no package chosen by this spec.

## Database / API / Security / Tenant Impact
Add profile version/contact fields, private file metadata/state, deletion intent/tombstones and future snapshot references. Preserve existing privileged/company/job/list data. Proposed profile/CV/deletion routes under `/api/v1/applicant`, server-derived owner only; extend multipart handling through a narrowly bounded approved proxy path, never raise global JSON limits. Current API client does not support these operations. Content checks, exact5,242,880-byte cap and authenticated no-store downloads mandatory. Company/recruiter access denied; filename/path/ID tampering cannot widen own-data access.

## Implementation Approach / Edge Cases
Review migration/forward-recovery contract and file/DB consistency before code. Stage/scan upload outside public roots; atomically swap pointer and retain prior file on failure; reconcile orphan staging after crashes. Immediate deletion revokes access and removes profile bytes before reporting completion; show pending failures honestly. Submitted snapshots remain inaccessible until six-month purge, without retaining contact in audit. Apply deletion tombstones on restore; max35-day backup expiry must have operational evidence. Handle disk full/scanner unavailable, encrypted/malformed/ZIP-bomb files, interrupted replacement/deletion, active cases and calendar-month boundaries. Exact public copy and audit lifetime remain owner gates.

## Test Plan / Acceptance Criteria
Use existing Go offline tests/vet/integration compile and frontend unit/lint/build/typecheck. Add synthetic bounded PDF/.docx/content/path tests, cross-applicant direct-ID/download denials, failure/crash consistency tests, version conflict tests, deletion/submission races and retention leap-day/month-end/restore cases. No real private data in tests. Owner-run disposable DB/private-storage recovery and375/768/1440 browser evidence required.

Acceptance: valid name and email or phone; login identity stays separate; only PDF/.docx by content within exact cap; quarantined/failed files never downloadable; only authorized own bytes returned; replacing profile CV cannot change submitted copy; deletion revokes all access/removes profile bytes, retained snapshots purge on approved deadline; failed purge/restore never reactivates data. No success implied by fictional controls or metadata-only tests.

## Risks / Dependencies / Estimated Complexity
High complexity: hostile files and irreversible privacy lifecycle. Dependencies: FE-08 accepted subject/session; choices C/D/E, approved consent/contact/policy, parser/scanner/storage/backup/key/recovery design and audit lifetime. No production intake before these gates.

## Approval / Small Tasks / Lifecycle
11 November owner selected specifications/contracts for approval. Planning authorized; proposed policy/architecture and implementation PENDING explicit approval.

| ID | Objective / exact scope | Dependencies | Expected files | Steps / verification | Acceptance | Status |
| --- | --- | --- | --- | --- | --- | --- |
| PROFILE-1 | Own profile/version contract | FE-08; C/D | API profile/query/tests, client | Server owner guard and bounded fields; Go/frontend tests | Own-data/conflict | PENDING approval |
| PROFILE-2 | Private CV validation/storage | PROFILE-1; scanner/storage approval | files/quarantine/tests, profile UI | Bounded staging/scan/atomic replace; content/failure tests | Private exact-format/cap | BLOCKED decisions |
| PROFILE-3 | Deletion/retention/restore foundation | PROFILE-2; D/E | deletion/retention/query/UI/docs | Durable intents, revoke/purge/reconcile; calendar/crash/restore tests | Distinct timelines | BLOCKED decisions |
| PROFILE-4 | Runtime/review | PROFILE-1–3 | integration/browser/docs/review | Owner-run synthetic recovery/browser; independent review | All acceptance | BLOCKED prerequisites |

Investigation/specification COMPLETE. Contract approval/implementation/testing/review/issue resolution PENDING; runtime/private-intake acceptance BLOCKED. Final approval/release/merge/post-merge PENDING. See [shared log](TASK-001-CONTINUE-08-12-log.md).

Independent specification/contract review COMPLETE and APPROVED for document quality/scope in the [continuation review](TASK-001-CONTINUE-08-12-review.md); feature implementation review remains PENDING.
