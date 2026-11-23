# TASK-001-FE-12 — remaining-panel design

## Task ID / Title / Type / Priority
TASK-001-FE-12 / Remaining super-admin, recruiter, company and finance design/contracts / Design specification / Fifth of next five, 11 November 2026.

## Problem Statement / Current Behavior / Expected Behavior
`docs/design/frontend-prototypes.md` inventories fictional remaining panels; early live companies/jobs/lists now exist. Expected: a concrete design and permission/projection/state matrix for later FE-13–19 specs, reusing early authoring and exposing unresolved policy gates before implementation.

## Root Cause / Repository Evidence
NOT APPLICABLE: planned design refinement. Evidence: TASK-001 role/privacy/finance requirements, roadmap FE-12 and001-21, prototype design inventory, current frontend management/recruitment/role-screen/workspace/finance components and FE-05–07 source/contracts.

## Scope / Out of Scope
Produce [remaining-panel design](../../docs/design/admin/remaining-panels.md): navigation, desktop/tablet behavior, role/data/action matrix, own/assigned/company/global query boundaries, loading/empty/error/forbidden/stale/revoked states, proposed later service responsibilities and policy decision register. Existing early authoring screens remain reused. No remaining panel UI/API/schema, actual applicant/finance operations, owner design acceptance or application tests claimed from documents. Runtime dependencies FE-07/11 remain unaccepted; design preparation is permitted while they are blocked.

## Affected Components / Expected Files
This spec, new `docs/design/admin/remaining-panels.md`, shared proposal/log/review and task-board links; reference existing prototypes without changing them. No runtime source change for FE-12.

## Database / API / Security / Tenant Impact
No database/API execution or contract mutation. Design records required future scoped queries, DTO allowlists, version/conflict behavior, permission revocation and audited changes. Tenant data: recruiter assigned-job scope, company own-company read-only projections, Submitted hidden and explicit CV/contact sharing; rejected/notes policies gated. Finance super-only and applicant-free. No client-side authorization substitute.

## Implementation Approach / Edge Cases
Map FE-13–19 screens to known requirements and existing components; distinguish known permissions from proposed routes/undefined policies. Specify exact forbidden projections and progressive role/revocation handling, draft preservation only during recoverable conflicts. Include direct-link access, sharing/rejection/revocation, stale assignments, mixed-currency finance and disabled pending-policy controls. No new feature from illustrative sample behavior.

## Test Plan / Acceptance Criteria
Documentation-only: inspect source evidence and untracked content, root `git diff --check`, local Markdown link validation and independent permission/dependency/policy review. Application tests NOT APPLICABLE to this design artifact; earlier checks test prior implementation only. Browser/design validation at 768/1440 for future panel source PENDING, not passed by a prose matrix.

Acceptance: every later FE-13–19 area maps to a permission and proposed service projection; super-only/assigned/own-company boundaries and Submitted hiding explicit; rejected/contact/CV/note gates cannot widen access; finance separate per currency with Sent lock/no publication gate; all common failure states and responsive navigation covered; FE-14 live authority prerequisite visible before FE-10 activation; no duplicate early CRUD or release claim.

## Risks / Dependencies / Estimated Complexity
Risk: treating samples/design as approved contracts or enabling company leakage. Dependencies: owner decisions on invitations/membership, authority, sharing/rejection/notes, recruitment, audit and finance. Medium design work; no new dependencies. Live downstream implementation blocked until those decisions and relevant service acceptance.

## Approval / Small Tasks / Lifecycle
Owner 11 November selected preparing five specifications/contracts for approval. Design refinement and investigation authorized; proposed future contracts and final owner design acceptance PENDING.

| ID | Objective / exact scope | Dependencies | Expected files | Steps / verification | Acceptance | Status |
| --- | --- | --- | --- | --- | --- | --- |
| DESIGN-1 | Remaining-panel permission/state/projection design | Source/requirements investigation | remaining-panels.md | Map FE-13–19; compare current early CRUD/sample inventory | Design criteria above | Source COMPLETE; owner acceptance PENDING |
| DESIGN-2 | Independent review and decision handoff | DESIGN-1 | review/log/board | Check links/policies/scope; resolve findings | No silent defaults | Document review COMPLETE; owner design approval PENDING |

Investigation/specification/design drafting and independent document review COMPLETE; minor allocation-policy wording finding resolved. Contract/design owner approval PENDING. Runtime implementation/testing NOT APPLICABLE to this documentation slice; later panel implementation PENDING. Final approval/release/merge/post-merge PENDING. See [shared log](TASK-001-CONTINUE-08-12-log.md) and [review](TASK-001-CONTINUE-08-12-review.md).
