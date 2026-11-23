# TASK-001-FRONTEND-COMPLETE

- Title: Complete the website and admin frontend independently of services.
- Type: Frontend implementation.
- Priority: Owner requested while local database/backend setup is blocked.
- Problem Statement: Most panel journeys are static, disabled prototypes; the owner needs a usable frontend without backend/database work.
- Current Behavior: `web/app/page.tsx` has fixture discovery; `web/components/prototype/screen.tsx` covers 37 designs; only admin sign-in/companies have live implementations.
- Expected Behavior: Navigable responsive website, applicant journeys and comprehensive admin workspace with functional, clearly labelled in-memory sample interactions. Refresh resets samples.
- Root Cause: Service-dependent implementation order left later panel interactions unfinished; service setup itself is outside this task.
- Repository Evidence: `web/package.json`, `web/lib/demo-jobs.ts`, `web/lib/prototype.ts`, `tasks/specs/TASK-001.md`, `docs/development/website.md`, `docs/development/live-first-five.md`. Branch `task/001-03b-local-database` contains extensive existing user changes; preserve them.
- Scope: Public navigation/application preview/report UI; applicant profile/application/tracking/notifications; admin overview, companies, jobs/editor, managed lists, users, assignments, verification, reports, content, recruitment/candidate/interview/notes/sharing, invoices/payments/prices/summary, settings and activity; read-only company and assigned recruiter sample workspaces. Shared React-memory fixtures and form validation. Existing prototypes remain reference routes.
- Out of Scope: Backend/API/proxy changes, database/scripts/migrations/setup, real authentication/intake/uploads/email/payments, production policy decisions, dependencies, commits/pushes/deployment/merge.
- Affected Components: Next frontend pages/components, frontend fixture model/tests, developer documentation.
- Expected Files: `web/components/frontend/*`, `web/lib/frontend-demo.ts`, frontend app routes/layout, public navigation/job UI, `web/app/globals.css`, frontend tests/package test command, task spec/log, `docs/development/website.md`.
- Database Impact: None; no database command or connection permitted.
- API Impact: No contracts or API code modified. Default previews make no API requests; existing explicit live mode remains separate.
- Security Impact: No authentication simulation or browser-stored session. Sample-only labels; no real credentials/files accepted; no real submission/delivery claimed. React escapes editable text. No external services/assets.
- Tenant Impact: Demo role projections illustrate own-company and assigned-job restrictions only; no claim of access control. Company contacts/CVs/private notes remain withheld. Production isolation is unchanged and unverified.
- Implementation Approach: Reuse pinned Next/React and shared UI; add a single memory provider for coherent sample workflows; use canonical routes with bounded screens; keep explicit live entry points intact.
- Edge Cases: Empty searches, invalid/duplicate values, expired sample jobs, repeated sample application, draft/published/archived status, invoice lock and partial payments, separate currencies, unknown routes, narrow viewports, keyboard/dialog focus, refresh reset.
- Test Plan: From `web/`: existing unit/lint/build/typecheck scripts plus targeted fixture workflow tests and local HTTP route checks. Browser checks at 375/768/1440 where tooling supports them. No backend or database tests/commands. Root `git diff --check`, inspect changed/untracked sources directly. Independent read-only reviewer after implementation.
- Acceptance Criteria: All listed frontend routes render; navigation exposes website/account/admin; forms validate and update sample state across client navigation; job/company/candidate/invoice workflows show coherent updated records; financial samples use integer cents and currency-separated totals; company/recruiter samples retain projections; default UI requires no API/environment/secrets; required frontend checks pass or limitations explicitly reported; no backend/database files changed by this task.
- Risks: Samples mistaken for saved/live operations; mitigate persistent preview notice, memory-only state and honest action feedback. Existing unfinished service work is preserved. Final legal/security/finance rules remain pending real integration.
- Dependencies: Installed existing Node 26.13.0/npm 11.20.0 and `web/node_modules`, existing shared controls/fixtures. No new dependencies.
- Estimated Complexity: Large frontend change, decomposed below.

## Approval

2026-11-05 owner explicitly requested completing the overall website and admin frontend and explicitly excluded all backend/database work. This exact frontend-only scope is authorized by that request; no additional task approval needed. Release is not authorized.

## Small tasks

| ID | Objective / exact scope | Dependencies | Files | Verification / acceptance | Status |
| --- | --- | --- | --- | --- | --- |
| UI-1 | Shared sample model/provider, validation and transitions | Existing fixtures | frontend demo lib/provider/tests | Unit cases; no network/persistence | IMPLEMENTED; automated checks PASS |
| UI-2 | Admin shell and all management/recruitment/finance screens | UI-1 | frontend components/admin routes/CSS | Lint/build/types; local forms | IMPLEMENTED; browser acceptance BLOCKED |
| UI-3 | Website/applicant navigation, apply/report/account and role previews | UI-1 | public components/account/workspace routes | Route/interaction checks, projections | IMPLEMENTED; HTTP/model checks PASS, hydrated browser acceptance BLOCKED |
| UI-4 | Responsive verification, documentation and independent review | UI-1–3 | tests/docs/log/review | Frontend checks, reviewer findings resolved | Docs/automated checks/code review COMPLETE; visual/keyboard/print evidence BLOCKED |

## Lifecycle

REQUEST, REPOSITORY INVESTIGATION, TASK SPECIFICATION, TASK APPROVAL, SMALL TASK BREAKDOWN, SOURCE IMPLEMENTATION: COMPLETE. Automated frontend TESTING: PASS. Browser acceptance TESTING: BLOCKED (tool could not verify Chrome URL). INDEPENDENT PR REVIEW: performed, overall BLOCKED by browser evidence; no unresolved code findings. ISSUE RESOLUTION: COMPLETE for reported code findings. FINAL OWNER APPROVAL: PENDING. AUTHORIZED MERGE and POST-MERGE VERIFICATION: NOT APPLICABLE to this local implementation; no release authorized. Source implementation is not a claim of live service completion or final visual acceptance.
