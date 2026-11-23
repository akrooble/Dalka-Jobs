# TASK-001-WEB-02 — Complete the public website preview

## Task ID / Title / Type / Priority
TASK-001-WEB-02. Complete the public website preview. Frontend increment; next owner-requested work.

## Problem Statement
The homepage exists but sample cards have no detail pages, public information routes are absent and only three filters are available. The owner requested the next tasks in one pass and explicitly selected "Finish the public website preview first" rather than the connected system.

## Current Behavior / Repository Evidence
Branch task/001-03b-local-database contains existing uncommitted database and WEB-01 work. web/app/page.tsx, components/job-browser.tsx/job-card.tsx and lib/demo-jobs.ts implement six fictional listings. web/package.json defines working type/lint/unit/build commands. TASK-001.md defines public job fields, filters, four application methods, information pages, brand primary #5850EC and Go-owned backend rules. TASK-001-WEB-01-log.md records partial mobile QA and unavailable tablet/desktop browser verification. Preserve that work and original design references.

## Expected Behavior
Visitors can browse/filter fictional jobs, follow clean detail URLs, understand each application method, distinguish closed sample jobs, and navigate public information pages. All routes retain explicit preview notices, noindex metadata and no real application collection.

## Root Cause
NOT APPLICABLE: the next planned frontend increment, not a diagnosed production defect.

## Scope / Implementation Approach
1. Extend typed fictional fixtures with slugs, employer type, descriptive sections, illustrative posted/deadline dates and salary text. Use an explicitly labelled fixed preview-date snapshot for demo expiry/closing-within-seven-days; do not settle the unresolved production cutoff policy.
2. Implement /jobs/[slug] details with responsibilities, requirements, employer information and application guidance for email/company website/WhatsApp/on-site recruitment. No real destinations, account forms or submission buttons. Include a closed example and safe unknown-slug 404 behavior.
3. Add employer-type/job-type/closing-within-seven-days filters and newest/closing-date sort. Preserve keyword/location/category behavior; filter and sort fixtures only. Keep the fixed preview date visible.
4. Add /about, /contact, /privacy and /terms with reusable shell, responsive navigation and working footer links. Contact information is not invented; policy text is expressly a preview draft describing planned requirements, not an approved legal policy.
5. Add meaningful unit coverage for lookup, closed-boundary behavior, combined filters/sort and all four method explanations. Run existing checks, HTTP route/status/content checks and independent review; attempt browser QA only through supported tools. Do not block independent source work on unavailable browser access or claim unexecuted visual checks passed.

## Out of Scope
Go/API/database changes, schema, actual expiry workers, authentication, applicant intake/CVs, company/staff/admin portals, payments/invoices, email/SMS configuration, real job SEO/JobPosting markup, production legal policy, hosted deployment, commits/pushes/merges. Original WEB-03/04/05 integration prerequisites remain in force. No new dependencies or version changes.

## Affected Components / Expected Files
web/lib/demo-jobs.ts, job-search.ts and new job-detail.ts; components/job-browser.tsx, job-card.tsx, site-header.tsx, site-footer.tsx and new information-page.tsx; app/globals.css, jobs/[slug]/page.tsx, not-found.tsx, about/page.tsx, contact/page.tsx, privacy/page.tsx and terms/page.tsx. Tests in web/tests/job-search.test.ts and job-detail.test.ts. web/package.json test script may include the new test. README.md, docs/development/website.md, this spec and its execution log. WEB-01 log may receive verification cross-reference. No change to dependency pins/lockfile or existing database work.

## Database Impact / API Impact
None: fixtures remain presentation data, not seeds or contracts. No service commands or database connections. The previously reported PostgreSQL-environment defect remains open for the later backend task.

## Security Impact
No secrets, real personal data, raw HTML, outbound application destinations or collection forms. Unknown slugs return 404. Draft policies do not claim live safeguards or finalized terms. Static sample pages remain noindex/nofollow; no JobPosting structured data.

## Tenant Impact
No protected data or tenant access in this public fixture-only increment. This does not implement or validate the future applicant/staff/company authorization rules.

## Edge Cases
Unknown slug; long title; closed job; exact deadline; unmatched combined filters; sorting ties; empty results/reset; narrower layouts; no fabricated contact details; browser bridge or window activation failure. Demo dates are anchored to an explicit snapshot rather than becoming misleading as real time advances.

## Test Plan
From web/: npm.cmd run test:unit, npm.cmd run lint, npm.cmd run typecheck and npm.cmd run build. All are established commands; run build/typecheck sequentially to avoid generated-route type races. Node's built-in runner needs no new package. HTTP checks against loopback verify homepage, six detail routes, four information routes and unknown-slug 404; confirm preview/noindex markers and no application form/JobPosting markup. Inspect git diff --check, full changed/new source and unchanged package lock. Supported browser checks: 375px, 768px, 1440px, navigation/filter/empty/closed states where available; record unavailable checks explicitly. Reuse existing server without taking ownership of a user-run process, or start/stop an owned loopback preview if needed.

## Acceptance Criteria
1. All six sample job slugs resolve to correct details; an unknown slug returns 404.
2. All four application-method explanations are present; closed example disables applying by presenting closed guidance without intake controls.
3. Keyword/location/category/employer-type/job-type/seven-day filters combine correctly; stable sorting and clear-all pass regression tests against the labelled snapshot.
4. Four public information pages and cross-page navigation work; preview/draft boundaries and absence of real collection are clear.
5. Existing dependency versions/lockfile, database work and original references remain unchanged.
6. Unit/type/lint/build/HTTP checks pass, independent source findings are resolved, documentation records actual checks and any remaining browser limitations. WEB-01's unverified visual requirements remain unverified until evidence exists; do not silently waive them.

## Risks / Dependencies / Estimated Complexity
Risk: mistaking the preview for live recruiting or finalized policy; every page has a preview notice and no intake. Fixed demo dates/threshold are explicitly illustrative and do not resolve production policy gates. Dependencies: existing installed locked frontend packages, local server for HTTP checks, browser tools if available. No install or credentials needed. Moderate frontend increment; no delivery estimate promised.

## Small Task Breakdown
| ID | Objective / exact scope | Dependencies | Expected files | Steps | Verification / acceptance | Status |
| --- | --- | --- | --- | --- | --- | --- |
| WEB-02-A | Typed detail fixtures, lookup/date/search helpers | Existing fixtures; owner public-preview scope | lib/*.ts, tests/*.ts | Enrich data; pure lookup/filter/status/sort; regressions | Unit tests; criteria 1–3 | COMPLETE; unit checks pass |
| WEB-02-B | Detail routes and card links | A | jobs/[slug]/page.tsx, job-card.tsx, not-found.tsx, CSS | Details, method guidance, closed/404 states | Build/typecheck; HTTP statuses/content | COMPLETE; build/type/HTTP pass |
| WEB-02-C | Full preview filters and public information navigation | A/B | job-browser.tsx, shell, information page/routes, CSS | Add controls/pages/mobile navigation and working links | Lint/build; HTTP; browser if available | SOURCE COMPLETE; checks pass; visual/browser behavior unverified |
| WEB-02-D | Verify and independently review complete preview | A–C | docs, task/log; source findings if any | Checks, scope review, fixes and evidence | Criteria 1–6; report visual limits | COMPLETE for source/HTTP scope; independent source review APPROVED; browser limitation recorded |

## Approval and Lifecycle
Owner instructed "do the next tasks and complete all in one go" and explicitly clarified "Finish the public website preview first" on 2026-11-03. This authorizes the public-preview increment described above in one implementation pass; no further per-step implementation confirmation is needed. Concrete scope was recorded and presented in commentary before edits. REQUEST, INVESTIGATION, SPECIFICATION, TASK APPROVAL and BREAKDOWN: COMPLETE. IMPLEMENTATION: COMPLETE. TESTING: 12 unit tests, typecheck, lint, production build and 13 HTTP checks PASS. INDEPENDENT SOURCE REVIEW: APPROVED; one wording finding resolved and re-reviewed. Browser QA: UNVERIFIED because browser access infrastructure is unavailable; WEB-01's outstanding tablet/desktop and interaction acceptance remains open. Final owner acceptance and all release operations remain PENDING; no commit/push/merge/deploy authorization. Source completion does not assert visual or launch approval.
