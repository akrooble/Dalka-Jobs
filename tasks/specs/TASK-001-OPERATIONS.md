# TASK-001-OPERATIONS — local team access and live workspace boundaries

## Task ID / Title / Type / Priority
TASK-001-OPERATIONS / Persist recruiter assignments, team directory and live workspace guards / Feature / FE-13, FE-16, FE-17, FE-19 foundation under 23 November “do it all”.

## Problem Statement / Current Behavior / Expected Behavior
Remaining admin/company/recruiter routes render fictional workflows even in live mode. Accounts exist through the approved operator CLI but no persisted assignments or directory UI exists. Add actual super-admin directory/activation and assignment management, scoped job reads, ID/time activity and actual overview counts. Live routes must never fall back to sample operations.

## Root Cause / Repository Evidence
Incomplete service integration. Evidence: remaining-panel design, frontend-demo role projections, admin catchall/root and workspace routes, existing account/company/job/session schema and `super` guard. Privileged provisioning and MFA recovery remain the existing owner CLI; no invented invitation/password mechanism.

## Scope / Out of Scope
Versioned activation/deactivation of existing recruiter/company-admin accounts; owner account immutable through this route. Every activation change revokes all target sessions; deactivation revokes assignments. Existing single-role/single-company model retained; role/company/email edits and invitations remain unavailable pending their explicit design. Assign only active recruiters to existing jobs; versioned revoke/reactivate records and current assignments control every recruiter read. Company admins read own-company jobs only. No candidate/CV/contact exposure until their approved service projections exist. Generic live shells show unavailable services truthfully. No real data operation or release.

## Affected Components / Expected Files
Migration000006, operations HTTP/tests/queries as needed, generated store for account version, router/server schema gate, client allowlist and live workspace components/routes, API/development docs and integration extension.

## Database / API / Security / Tenant Impact
Add account version, recruiter assignment table and bounded ID/time audit table. Super-only `/admin/users`, `/admin/assignments`, `/admin/activity`, `/admin/overview`; full-MFA `/recruiter/jobs` and `/company/jobs` use parameterized current account assignment/company predicates. Unknown/duplicate query keys rejected, bounded pages, no secrets in DTOs. Existing owner account cannot deactivate, avoiding self/last-owner lockout. Log allowed action keys/IDs/time only; local audit records expire from reads after30 days (a local development convention, not an approved production retention policy).

## Implementation Approach / Edge Cases
Preserve account-before-session lock order; super actor then target account then job/assignment; only source migrations owner-applied. Version conflicts never overwrite. Revocation clears future reads/sessions. Read DTOs use allowlists. Role-aware dynamic/no-store live routes reuse established shell styling, with sample mode still explicitly separate. Overview derives counts from DB; company/recruiter directories never widen to all jobs.

## Test Plan / Acceptance Criteria
Offline Go tests/vet, integration compilation, frontend unit/lint/build/typecheck and synthetic HTTP checks. Owner-only disposable tests for account activation session revocation, owner protection, active recruiter assignment/version conflicts and company/assignment forged-ID denial; browser acceptance separately. Acceptance requires persisted correct scope and no fixture fallback, all checks and independent review; compilation/source are not runtime acceptance.

## Risks / Dependencies / Estimated Complexity
Medium complexity; mutable authorization requires consistent locking and refresh/revocation handling. Existing role/MFA service and FE-05/06 source reused. Unknown invitations/multi-memberships/candidate policies are explicitly unavailable. No new dependency.

## Approval / Lifecycle
Local implementation authorized by 23 November “do it all” plus `TASK-001-ALL-LOCAL`. Investigation/specification/approval COMPLETE; OPS-1 schema/API, OPS-2 UI/guards, OPS-3 offline verification/review IN PROGRESS; actual DB/browser and owner acceptance BLOCKED/PENDING; final approval/release/merge/post-merge PENDING and unauthorized.
