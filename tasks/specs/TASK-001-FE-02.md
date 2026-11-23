# FE-01 audit and FE-02 shared frontend foundation

## Task ID / Title / Type / Priority
TASK-001-FE-02. Audit the remaining public-preview checks and build the shared UI foundation/minimal panel shell. Frontend implementation, owner-requested next work.

## Problem Statement / Current Behavior
The owner explicitly requests "complete task 1 if there is somthing mising and start task 2" against TASK-001-FRONTEND-PLAN.md. The public fixture site exists and has passing source/unit/type/lint/build/HTTP evidence, but full visual/browser checks remain unverified. Shared panel/UI primitives do not exist; public components use existing global brand/button styles. Preserve existing uncommitted website/database work on task/001-03b-local-database.

## Expected Behavior
Task 1's existing functionality is rechecked and any proven gaps fixed; unavailable browser checks remain BLOCKED. Task 2 provides reusable accessible UI components and a responsive, explicitly non-authenticated panel-layout/component preview at /ui-preview. It uses fictional fixtures only and no real credentials, uploads or administration actions.

## Root Cause
NOT APPLICABLE: planned frontend foundation. Browser access host unavailability is an existing environment limitation, not an application defect.

## Repository Evidence
AGENTS.md and workflow files; TASK-001-FRONTEND-PLAN.md FE-01/02 scope and permission/backend gates; TASK-001-WEB-01/02 specs/logs; web/app/globals.css existing #5850EC tokens/button/layout styles; public component inventory; web/package.json current scripts; installed locked React/Next/TypeScript packages. Current browser inventory still reports access host unavailable.

## Scope / Implementation Approach
1. Reuse current tokens and button styles; add typed Button, form input/select/textarea fields, ValidationSummary, StatusBadge, Feedback, StatePanel, native modal Dialog, generic DataTable and Pagination primitives under web/components/ui/.
2. Use native semantics: labelled fields/error descriptions, headings, caption/scoped table headers, keyboard-scrollable table region, disabled/busy controls, opt-in live feedback, native dialog Escape/focus behavior and visible focus/reduced-motion handling.
3. Add minimal PanelShell with desktop sidebar/header and native inline expandable mobile navigation. Navigation leads only to real /ui-preview anchors and the public site. No role switcher, authentication simulation, hidden access-control claim or unfinished panel destinations.
4. Add /ui-preview as a component gallery using synthetic fields and current fictional job fixtures. Demonstrate variants, disabled/busy feedback, local validation/error summary, dismissible example notice, modal, table filtering/pagination and loading/empty/error/forbidden examples. Local validation explicitly says nothing is saved/sent. Do not use a collecting form, storage or network writes.
5. Add pure pagination and example-validation helpers with meaningful boundary/regression tests using Node's existing runner. Run established unit/lint/build/type checks, HTTP content/link checks, final diff inspection and independent review. Attempt visual checks only through available supported tools; do not repeat failed browser recovery without evidence of repair.

## Out of Scope
Complete admin dashboards/business workflows, account/sign-in or MFA screens, authorisation/session client, API/database/services, real credentials/files, persistent storage, dependency changes, new design assets/fonts, production hosting, commit/push/merge/deploy. Task 12's remaining-panel design stays later. No claim that the component gallery enforces role/tenant protection.

## Affected Components / Expected Files
New web/components/ui/{button,fields,validation-summary,status-badge,feedback,state-panel,dialog,data-table,pagination}.tsx; web/components/panel-shell/panel-shell.tsx; web/components/ui-preview.tsx; web/lib/ui.ts (pagination/shared type) and ui-preview.ts (local example validation); web/tests/ui-foundation.test.ts; web/app/ui-preview/page.tsx. Existing web/app/globals.css, web/package.json test script only, docs/development/website.md, numbered plan/log, WEB-01 log and this spec/log. No dependency/lockfile edits. Proven Task 1 fixes would be recorded before changing additional public source.

## Database Impact / API Impact
None. The gallery has no service writes or data persistence. B1–B4 remain future live-feature prerequisites. Existing user-only local database setup is untouched.

## Security Impact / Tenant Impact
All preview content is fictional, noindex and explicitly unauthenticated. Buttons never grant roles or save real records; local example validation stores values only in component memory. Public preview routes expose no protected data. Hidden sidebar navigation is not authorisation. No raw HTML or external scripts/links needed.

## Edge Cases
Empty/filtered table, stale/out-of-range page after filtering, invalid page size, very long cell labels, disabled/busy buttons, repeated local validation, empty/multiple field errors, modal open/close/Escape, narrow navigation/table scroll, reduced motion, feedback dismissal. Native browser interactions remain unverified until browser tools work.

## Test Plan
From web/: npm.cmd run test:unit, npm.cmd run lint, npm.cmd run build then npm.cmd run typecheck. Extend the existing test script for ui-foundation.test.ts; no test dependency added. HTTP checks of loopback production preview verify /ui-preview heading/notices/labelled controls/table captions/sections/links/no collecting form/no fake admin destinations/noindex plus existing public route/404 regressions. Unit tests cover pagination clamping/empty/filter transitions and validation error combinations. HTTP/static checks are not browser-interaction passes. Browser target widths remain 375/768/1440; unavailable checks are BLOCKED. At repository root inspect git diff --check, new source contents and unchanged dependency lockfile. Obtain independent source review and resolve findings.

## Acceptance Criteria
1. Task 1 source/public routes remain functional; its remaining visual gap is either verified or explicitly still BLOCKED, never silently waived.
2. /ui-preview demonstrates all scoped primitives and the minimal responsive panel shell with working anchor navigation and explicit preview/no-auth/no-save boundaries.
3. Fields associate labels/hints/errors; summary links target fields; native modal has title/description/close/Escape handling; table/pagination support valid empty/out-of-range states; feedback is dismissible without auto-timeout.
4. Unit/type/lint/build/HTTP checks pass and independent source findings are resolved. Visual/native focus-trap/interaction limits remain explicit if browser tools are unavailable.
5. No new dependency, auth/role simulation, real data collection, persistence, API/database change or release action. Existing user work preserved.

## Risks / Dependencies / Estimated Complexity
Risk: mistaking a visual panel shell for a protected administration system; clear permanent preview banner/no real destinations mitigate this. Native dialog/keyboard and responsive rendering need actual browser QA before declaring full acceptance. Dependencies: existing installed frontend packages, current fixtures and browser capability for visual checks. No install or configuration needed. Small-to-moderate foundation increment; no unsupported delivery estimate.

## Small Tasks
| ID | Objective / exact scope | Dependencies | Files | Steps / verification / acceptance | Status |
| --- | --- | --- | --- | --- | --- |
| FE-01-check | Recheck public source/routes and browser availability | Existing WEB-01/02 | Existing public source/tests/logs | Inventory and HTTP/unit regressions; fix proven defects only; document visual limits | SOURCE/HTTP VERIFIED; browser QA BLOCKED |
| FE-02-A | Typed primitives and helpers | Existing tokens; owner Task 2 instruction | ui/ components; lib/ui-preview.ts; unit test | Implement semantics and helper boundaries; unit/lint/type checks | SOURCE COMPLETE; automated checks PASS |
| FE-02-B | Minimal panel shell and component gallery | A | panel-shell/; ui-preview component/route; CSS | Working anchor/mobile layout, local-only examples; build/HTTP and available browser checks | SOURCE COMPLETE; build/HTTP PASS; browser QA BLOCKED |
| FE-02-C | Documentation, regression and independent review | A/B | Existing docs/plan logs; this spec/log | Run established checks, inspect scope, resolve findings and preserve Task 1 blocked visual gates | Source review: no findings; full acceptance BLOCKED by browser evidence |

## Approval and Lifecycle
The owner explicitly authorised Task 1 completion work and starting Task 2 on 2026-11-03, referring to the numbered plan, and requested continuation on 2026-11-04. REQUEST/INVESTIGATION/SPECIFICATION/TASK APPROVAL/BREAKDOWN: COMPLETE. IMPLEMENTATION: source COMPLETE. TESTING: unit/lint/build/type/dependency/HTTP checks PASS; browser interaction and responsive/focus checks BLOCKED. Independent source inspection found no actionable findings and separately reran the 20 foundation/public unit tests; overall review status BLOCKED by required browser evidence under PR_REVIEW.md. ISSUE RESOLUTION: no source findings; browser block unresolved. Final owner acceptance and release operations remain PENDING/unauthorised. Tasks 1–2 cannot be marked fully complete while required visual evidence is missing.
