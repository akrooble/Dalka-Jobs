# TASK-001-FE-11 — own applications and updates

## Task ID / Title / Type / Priority
TASK-001-FE-11 / Applicant tracker, interview information and notifications / Feature specification / Fourth of next five, 11 November 2026.

## Problem Statement / Current Behavior / Expected Behavior
`account-screen.tsx` and `frontend-demo.ts` show fictional application histories and notifications. No own-data APIs, authorized stage writers or outbox exist. Expected: authenticated own persisted applications, five-stage history, permitted interview information, in-site unread/read state and approved email notifications.

## Root Cause / Repository Evidence
NOT APPLICABLE: planned feature. Evidence: TASK-001 stages/notifications and001-17–19, roadmap FE-11/B3, sample account/recruitment components and demo data, existing API/session/client and FE-10 proposal. Fictional transitions are not policy approval.

## Scope / Out of Scope
After choice G/H approval and accepted event source, implement FE-11 section of [proposal](../../docs/api/applicant-next-five-proposal.md): own list/detail/timeline/interview, paginated notifications and idempotent read state, transactional notification projection/outbox dispatcher with approved adapters. Fake adapter for offline tests; actual provider dispatch requires separate approval. No applicant stage editing, staff mutation workspace, sharing/notes/company projections, withdrawals, exports, saved jobs, SMS or inferred external outcomes.

## Affected Components / Expected Files
API applicant read/projection/notification/outbox handlers, queries/migration/tests and dispatcher interface; account tracker/detail/notification live components/routes/client/tests; API/QA/event/retry docs. Existing applicant sample adapter retained in sample mode; live pages dynamic/no-store. No dependency chosen.

## Database / API / Security / Tenant Impact
Application-owned stage/interview events, per-applicant notification/read state and event-recipient-channel deduplication. Proposed `/api/v1/applicant/applications` list/detail and notifications/read routes infer owner solely from session. Foreign IDs indistinguishable from missing; parameterized owner predicates on every query. CSRF on mark-read; bounded pagination/stable sorting; no private caches, staff notes, CV storage keys or other applicant/company data. Email payload minimal and sender separately gated.

## Implementation Approach / Edge Cases
Approve stage/interview event semantics but keep mutation APIs in later authorized staff tasks. Feed real events into own-data projections; don't generate sample stage changes in live mode. Store stage/interview/audit/outbox together. Dispatcher retries with bounded backoff/deduplication, rechecks deletion/retention and current recruiter assignment, suppresses queued messages after deletion. External email can be at-least-once, not a guaranteed exactly-once transaction. Handle deleted account/closed job, rescheduled/cancelled interview, stale detail links, same-timestamp pagination, unread races and partial delivery without losing in-site truth.

## Test Plan / Acceptance Criteria
Existing Go tests/vet/integration compile, frontend unit/lint/build/typecheck and HTTP checks with synthetic data. Add two-applicant forged-ID/read-state denial, page bounds/order, duplicate/out-of-order event, commit failure, retry/provider uncertainty, deleted-recipient/assignment-revocation suppression tests. Owner-only DB/dispatcher synthetic checks and actual browser own tracker/keyboard/expiry at 375/768/1440; real delivery test only after provider/destination approval.

Acceptance: applicant sees only own accepted applications/events; five exact stages; dates and interview changes derive from authorized service; internal notes/sharing/private files absent; read state persists/idempotent; stage/event and notification commit together; provider failure does not show false delivery; deletion suppresses queued contact use; external clicks never create tracker outcomes. Missing source writers/provider/runtime evidence remains explicit.

## Risks / Dependencies / Estimated Complexity
Medium-high complexity: access leakage, stale events and repeated/late delivery. Dependencies: FE-08–10, approved G/H/stage/interview semantics, staff event contracts and provider approval for actual email; source writer implementation remains later FE-15/16 scope. No invented staff/rejection policy.

## Approval / Small Tasks / Lifecycle
Owner 11 November selected specifications/contracts for approval. Planning authorized; proposed event policies and implementation PENDING approval.

| ID | Objective / exact scope | Dependencies | Expected files | Steps / verification | Acceptance | Status |
| --- | --- | --- | --- | --- | --- | --- |
| TRACK-1 | Own application/notification projections | FE-08–10; G/H | API/query/tests | Owner predicates; stable pages/read state; cross-user tests | Own-only truthful data | PENDING approval |
| TRACK-2 | Event/outbox delivery | TRACK-1; approved writers/adapters | events/outbox/dispatcher/tests | Atomic events; bounded retry/dedup/delete suppression | Durable safe updates | BLOCKED contracts/provider |
| TRACK-3 | Live tracker/interview/notification UI | TRACK-1–2 | account components/routes/client/tests | States/reload/session expiry; frontend checks | No private leakage/fallback | PENDING |
| TRACK-4 | Runtime/review | TRACK-1–3 | integration/browser/docs/review | Owner-run synthetic persistence/dispatch; review | All acceptance | BLOCKED prerequisites |

Investigation/specification COMPLETE; contract approval/implementation/testing/review/issue resolution PENDING. Runtime/email acceptance BLOCKED. Final approval/release/merge/post-merge PENDING. See [shared log](TASK-001-CONTINUE-08-12-log.md).

Independent specification/contract review COMPLETE and APPROVED for document quality/scope in the [continuation review](TASK-001-CONTINUE-08-12-review.md); feature implementation review remains PENDING.
