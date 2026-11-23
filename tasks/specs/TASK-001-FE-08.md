# TASK-001-FE-08 — applicant email sign-in

23 November update: owner “do it all” authorized local implementation in [ALL-LOCAL](TASK-001-ALL-LOCAL.md). Synthetic-only auth/session/UI source is implemented and source-reviewed; actual DB/browser and real policy/provider acceptance remain BLOCKED. See [current auth contract](../../docs/api/applicant-auth.md), [execution evidence](TASK-001-ALL-LOCAL-log.md) and [review](TASK-001-ALL-LOCAL-review.md). The original planning/lifecycle text below is historical and does not override this update.

## Task ID / Title / Type / Priority
TASK-001-FE-08 / Applicant email sign-in and session boundary / Feature specification / First of next five, 11 November 2026.

## Problem Statement / Current Behavior / Expected Behavior
`web/components/frontend/applicant-access.tsx` is a disabled fictional email-code walkthrough; `api/internal/httpapi/sessions.go` and migration000001 support privileged password/TOTP accounts only. Expected: real development email-code request/verification/resend/logout, Go-owned applicant sessions and truthful throttled/expired/offline states; no privileged access or sample fallback in live mode.

## Root Cause / Repository Evidence
NOT APPLICABLE: planned feature. Evidence: TASK-001 identity/architecture decisions, frontend roadmap FE-08/B1, current API/session/client/config/schema, `web/components/frontend/account-screen.tsx`, `web/lib/session/client.ts`, sample access component and FE-07 log. No applicant service/provider exists.

## Scope / Out of Scope
After approval, implement contract choices A/B and FE-08 section of [contract proposal](../../docs/api/applicant-next-five-proposal.md): email OTP, development-only sender, isolated applicant subject, request/verify/resend/error states, session recovery/logout and protected live account routing. Preserve fictional adapter. No production provider/send, phone implementation, applicant password, profile/CV/intake or privilege linking. Production phone hard-disabled; development phone remains separate future scope.

## Affected Components / Expected Files
New API applicant auth/sender tests and queries; additive migration source after schema design; existing sessions/config/router/store/sqlc integration; Next API allowlist/session discriminator; applicant access/account route/components/tests; API/setup/QA docs. Keep existing password/TOTP/bootstrap semantics and server schema gate until reviewed migration revision.

## Database / API / Security / Tenant Impact
Proposed separate applicant identities/challenges and explicit session ownership/FKs; no migration executed. Proposed POST `/auth/applicant/request`, `/verify`, extended existing session/logout under `/api/v1`. Choice A defines OTP expiry/limits, purpose/session binding, keyed storage and rotation. Exact Origin/CSRF/no-store/bounded inputs on all writes, generic identity failures, transactionally persisted rejected attempts. Applicant identity cannot elevate any matching privileged email. Own-data boundary introduced; company access NOT APPLICABLE to auth endpoints because applicant subject is never company authority.

## Implementation Approach / Edge Cases
Approve A/B plus exact account acknowledgement before real intake; implement fake/development senders and fail-closed production selection. Test pure challenge/limits and transaction outcomes before connecting UI. Add explicit session union and guard, rotate tokens on verification and clear private UI on expiry. Wrong/resend-old/used/expired code, concurrent verification, provider failure, browser back and account switching must recover honestly. No automatic return to arbitrary URL.

## Test Plan / Acceptance Criteria
Existing `api/`: `go test ./...`, `go vet ./...`, integration compilation only via `go test -tags=integration -run '^$' ./internal/httpapi`; add synthetic OTP/sender/session-isolation tests. `web/`: unit/lint/build/typecheck scripts; extend HTTP proxy/no-fallback cases. Owner-only actual disposable DB/MFA regression; browser request/resend/paste/logout/expiry at 375/768/1440.

Acceptance: code never returned or logged except approved development operator terminal adapter; exact expiry/replay/attempt/resend limits enforced under races; only applicant session after success; all admin endpoints deny applicant/forged roles; all privileged regressions preserved; reload/logout/expiry and generic errors verified; production unconfigured sender/phone fail closed. No live acceptance until DB/browser evidence and consent approval.

## Risks / Dependencies / Estimated Complexity
Risks: OTP abuse, identity enumeration, session confusion and privilege linking. Dependencies: FE-07 runtime acceptance remains BLOCKED; choices A/B and public acknowledgement; production provider separately gated. Medium complexity; no dependency addition currently authorized.

## Approval / Small Tasks / Lifecycle
Owner on 11 November selected **prepare the five specifications and recommended contracts for approval; finish safe pending fixes now**. This specification is authorized planning; proposed auth contracts and feature implementation await approval.

| ID | Objective / exact scope | Dependencies | Expected files | Steps / verification | Acceptance | Status |
| --- | --- | --- | --- | --- | --- | --- |
| AUTH-1 | Applicant schema/session/OTP sender design | A/B approval | API migration/query/auth/tests | Isolate subject; transactional challenge limits; Go tests/vet/integration compile | Isolation, replay/limits | PENDING approval |
| AUTH-2 | Live applicant auth UI/client | AUTH-1 | access/session/routes/tests | Reuse design; no-store; request/resend/expiry/logout; frontend checks | No fallback/role widening | PENDING |
| AUTH-3 | Runtime/regression/review | AUTH-1–2, owner DB/browser | tests/docs/review | Actual disposable DB/browser; review and resolve | All acceptance | BLOCKED prerequisites |

Investigation/specification COMPLETE; task-contract approval PENDING; implementation/testing/review/issue resolution PENDING. Production delivery and runtime acceptance BLOCKED. Final approval/release/merge/post-merge PENDING. Shared [execution log](TASK-001-CONTINUE-08-12-log.md) records this planning batch.

Independent specification/contract review COMPLETE and APPROVED for document quality/scope in the [continuation review](TASK-001-CONTINUE-08-12-review.md); feature implementation review remains PENDING.
