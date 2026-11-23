# TASK-001-FE-10 — on-site application intake

## Task ID / Title / Type / Priority
TASK-001-FE-10 / Authorized on-site submission with private snapshots / Feature specification / Third of next five, 11 November 2026.

## Problem Statement / Current Behavior / Expected Behavior
Sample application journeys mutate React memory; live authoring explicitly refuses publishing Dalka recruitment jobs. Expected: a signed-in applicant submits exactly one valid on-site application after server eligibility/authority/privacy checks, with committed immutable document snapshot, consent evidence and truthful confirmation.

## Root Cause / Repository Evidence
NOT APPLICABLE: planned feature. Evidence: TASK-001 recruitment/privacy/authority requirements and001-16; FE-10/FE-14 roadmap; `api/internal/httpapi/admin_jobs.go`, public jobs/client, sample public-job-detail/account-screen and FE-09 proposal. No recruitment authority, application or retention service exists.

## Scope / Out of Scope
After approval, implement choice F plus C/D/E/H prerequisites and FE-10 section of [proposal](../../docs/api/applicant-next-five-proposal.md): eligibility/read/review, job-specific required document and versioned consent, atomic submission/snapshot/idempotency/outbox, duplicate/expired/error states. External email/company/WhatsApp methods remain anonymous links and never produce internal completion. No withdrawal/reapply, recruiter stages/company sharing, real authority bypass or live intake before FE-14 administration/safeguards.

## Affected Components / Expected Files
New application/authority-check/snapshot/outbox domain/query/migration/tests, live `/jobs/[slug]/apply` journey and client/proxy tests; publication guard revision only after documented authority capability and acceptance, QA/API/privacy docs. Reuse existing public routes/job metadata and private file interface. No new dependency selected.

## Database / API / Security / Tenant Impact
Proposed applications, immutable snapshot metadata, versioned consent, idempotency and event/outbox tables with applicant/job unique constraint and consistent FKs. Proposed eligibility and submission routes are in the shared proposal. Server derives applicant subject; published/unexpired on-site job and active explicit authority checked under locks at commit. Use CSRF/Origin/bounded body/trap/rate limits. No client-selected role/owner/company or early file visibility. Company/recruiter projections remain unavailable in this slice.

## Implementation Approach / Edge Cases
Approve policy/schema/forward recovery before code. Stage clean snapshot, lock/recheck identity/job/authority/versions/consent/duplicate then commit application+snapshot+Submitted audit/event/outbox together. Compensate staged files on failed commit, reconcile after crash. Serialize submit/delete and submit/authority-revoke races; do not call external providers under DB locks. Same-key identical retry returns original result; conflicting payload409. Expiry at exact deadline denies; replacing/removing profile CV never changes accepted snapshots. Retention synchronous guard prevents expired data access when worker delayed.

## Test Plan / Acceptance Criteria
Existing Go offline tests/vet/integration compile and web unit/lint/build/typecheck; add meaningful duplicate/idempotency/concurrent-submit, deadline/authority/delete races and failure-injection atomicity checks. Owner-only disposable DB tests with explicit synthetic authority fixtures, never real job publication. Browser signed-out/eligibility/consent/snapshot/duplicate/expired states at 375/768/1440 after services accepted.

Acceptance: only valid own applicant session and active authority permit on-site submissions; external/expired/unauthorized/invalid-consent requests leave no application/file/event; concurrent duplicate attempts create one accepted record; snapshot immutable;201 only after transaction commit; confirmation references server accepted record; internal audit contains IDs/times only; deletion and outbox suppression follow approved policy. Real intake stays unavailable until FE-14 and privacy/file lifecycle accepted.

## Risks / Dependencies / Estimated Complexity
High complexity: race/atomicity/privacy and employer authorization. Dependencies: accepted FE-08/09, C/D/E/F/H, approved public policies, live FE-14 authority/warning/report administration (outside this five-task batch), job-specific document rules and retention safeguards. Source tests alone cannot remove publication gate.

## Approval / Small Tasks / Lifecycle
Owner 11 November selected specifications/contracts for approval. Planning authorized; new intake semantics and implementation PENDING explicit approval.

| ID | Objective / exact scope | Dependencies | Expected files | Steps / verification | Acceptance | Status |
| --- | --- | --- | --- | --- | --- | --- |
| APPLY-1 | Eligibility/authority contract | FE-08/09; FE-14 contract; F | API eligibility/query/tests | Check current job/authority/profile/consent | No unauthorized intake | BLOCKED decisions/services |
| APPLY-2 | Atomic intake/snapshot/events | APPLY-1; C/D/E/H | migrations/applications/files/outbox/tests | Lock/recheck/commit; race/crash tests | Single immutable accepted submission | PENDING |
| APPLY-3 | Live review/submit/confirmation UI | APPLY-1–2 | apply routes/components/client/tests | Reuse design; honest recoverable errors; frontend checks | Server-only success | PENDING |
| APPLY-4 | Runtime/review/activation gate | APPLY-1–3; FE-14 accepted | integration/browser/docs/review | Owner-run synthetic checks, independent review | All acceptance | BLOCKED prerequisites |

Investigation/specification COMPLETE; contract approval/implementation/testing/review/issue resolution PENDING. Real intake/runtime acceptance BLOCKED. Final approval/release/merge/post-merge PENDING. See [shared log](TASK-001-CONTINUE-08-12-log.md).

Independent specification/contract review COMPLETE and APPROVED for document quality/scope in the [continuation review](TASK-001-CONTINUE-08-12-review.md); feature implementation review remains PENDING.
