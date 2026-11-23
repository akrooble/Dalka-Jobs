# TASK-001-WEB-01 — First local website preview

## Task ID
TASK-001-WEB-01, a frontend-first increment of TASK-001 (parts of 001-02, 001-03-C and 001-10).

## Title
Run Dalka Jobs locally with a responsive homepage and searchable sample jobs.

## Type
Frontend foundation and public website preview.

## Priority
Next requested work: owner asked to start building the website, break work into small tasks, and identify configuration/install requirements.

## Problem Statement
The repository has frontend dependency declarations and design references but no runnable website. A small local preview will let the owner review the public design while backend work remains separate.

## Current Behavior
On 2026-11-03, branch is task/001-03b-local-database. web/ contains package.json and package-lock.json only; web/node_modules, app/ and tsconfig.json are absent. Node 26.13.0 and npm 11.20.0 are installed and match the existing pins. Lockfile version 3 parses successfully and its direct dependencies match package.json. Existing uncommitted database work is preserved.

## Expected Behavior
A local, English-language, responsive homepage uses the approved primary color #5850EC and the existing home-screen references. Clearly labelled fictional sample jobs support keyword, location and category filtering, clearing filters, result counts and an empty state. This is a design preview, with no real applications, accounts or personal data.

## Root Cause
NOT APPLICABLE: first frontend implementation, not a defect fix.

## Repository Evidence
- TASK-001.md: public/applicant product requirements, exact initial locations/categories, approved color, Next.js/TypeScript/Tailwind presentation layer and Go-owned business rules.
- web/package.json and web/package-lock.json: existing exact frontend dependency pins; only check:dependencies script currently exists.
- .node-version and tool-versions.json: toolchain pins; installed Node/npm versions verified directly this turn.
- design/stitch/dalka_jobs_desktop_home/ and dalka_jobs_mobile_home/: reference layouts; do not execute or copy exported HTML wholesale.
- design/brand/: original logo presentation PNGs; no standalone SVG/transparent header logo is evidenced.
- TASK-001-03.md: existing database work and user-only setup restrictions.
- AGENTS.md, TASK_SPEC.md, SMALL_TASKS.md and PR_REVIEW.md: approval, decomposition, preservation and review requirements.

## Scope
1. Install existing locked frontend dependencies locally, with no version changes or new packages.
2. Establish minimal Next.js App Router, TypeScript, Tailwind/PostCSS and ESLint configuration; add local dev, build, start, typecheck, lint and unit-test scripts.
3. Build reusable page shell, responsive header/footer, theme tokens, hero/search area, job cards, filters and empty state.
4. Use a small typed fixture of fictional employers/jobs; show a visible sample-data notice. Reuse the product's managed-list names for location/category choices. Preview fixtures do not become an API contract or production seed.
5. Implement accessible keyword/location/category filtering and clear-all behavior with meaningful regression tests using the installed Node test runner, without a new test dependency.
6. Document installation, local URL, commands and current preview limitations; verify and obtain independent review.

This explicitly proposes a preview before the original 001-10 backend dependency. Approval of this specification authorizes only this local preview exception, not production job reads or the remaining 001-03-C scope. Existing product task IDs and dependencies remain intact for integration.

## Out of Scope
Go/database changes or executing setup/check-db; fixing the previously reported inherited-PG-settings defect; real job API integration; authentication; CVs; applications; admin portals; employer posting; invoices; email/SMS providers; hosting; commits, pushes, deployment or merge. No fake sign-in, submission success, trust statistics, saved jobs, job alerts, Somali switch or unsupported reference-screen claims. Later filters from TASK-001 remain future integration scope.

## Affected Components
web/ frontend and local development documentation only; task specification/log track this work.

## Expected Files
- web/package.json (scripts only; preserve exact dependencies), web/next-env.d.ts, web/tsconfig.json, web/next.config.ts, web/postcss.config.mjs, web/eslint.config.mjs.
- web/app/layout.tsx, web/app/page.tsx, web/app/globals.css, web/app/loading.tsx, web/app/error.tsx.
- web/components/site-header.tsx, site-footer.tsx, job-browser.tsx and job-card.tsx.
- web/lib/demo-jobs.ts, web/lib/job-search.ts, web/tests/job-search.test.ts.
- docs/development/website.md, README.md, this specification and TASK-001-WEB-01-log.md.
- web/node_modules/ and build output are ignored local artifacts. No lockfile changes intended; stop and explain if npm reports incompatibility or a pin change is needed.

## Database Impact
None for this increment: no connections, migrations, setup commands, schema or personal data. Known 03-B defect remains open and gates later database-dependent work.

## API Impact
None: no new endpoints, proxy or inferred contracts. Go remains the future source of authorization and business rules. Fixture types are presentation-only and will be reconciled with approved API contracts later.

## Security Impact
No identity/session handling, file uploads, secrets or applicant collection. Render fixture text through React without raw HTML. Bind the preview to 127.0.0.1. No remote fonts/images/scripts are required; use a local system-font stack initially. Use an accessible text wordmark until standalone logo preparation is approved. Do not expose fixtures through JobPosting structured data or advertise sample vacancies as real.

## Tenant Impact
Tenant authorization is NOT IMPLEMENTED by this public, fictional-data preview. No protected records exist here; company/applicant/staff isolation remains mandatory before real integration.

## Implementation Approach
Use existing pinned Next.js/React/TypeScript/Tailwind packages rather than a generator or alternate stack. Rebuild components from references, with #5850EC primary, restrained borders and responsive spacing. Keep the interactive job browser a bounded client component; leave the static page shell server-rendered. Use native form controls, labels, keyboard focus and semantic landmarks. Do not add dead navigation links: render only working destinations or explicit noninteractive future-feature text. Job-detail and application actions are deferred; sample cards must not imply an application is accepted.

## Edge Cases
No matches; blank/whitespace/case-varied keyword; combined filters; clear-all; long job titles; narrow screens; keyboard-only navigation. Sample deadlines do not implement authoritative production expiry. Distinguish rendering/loading failure states from legitimate zero search results. Dependency/network failures must be reported without changing pins or security settings.

## Test Plan
Current inspection commands from repository root: git status --short, git diff --check, direct Node/npm version checks and Node JSON parsing of package/lock metadata. These have been run; no frontend build currently exists.

After approval and scaffold, from web/:
- npm.cmd ci — requires registry/network access and writes ignored node_modules; uses existing lockfile.
- npm.cmd run check:dependencies — existing npm ls --all script.
- npm.cmd run typecheck, npm.cmd run lint, npm.cmd run test:unit and npm.cmd run build — now established; actual verification results are in the execution log.
- npm.cmd run dev — established local development command, bound to 127.0.0.1. Use an available local port and report the actual URL.
- Browser QA at 375px, 768px and 1440px widths: no horizontal page overflow; keyboard operability, labels/focus, filtering and empty-state behavior. Read the Sites local-preview guidance before launching; if browser tooling is unavailable, record the specific verification block.

Inspect the full final diff and untracked source files; obtain read-only independent review and resolve findings. Do not install a browser/test dependency or change execution policy to bypass a blocked check.

## Acceptance Criteria
1. Existing exact dependency pins and lockfile remain unchanged; installed versions match.
2. Local dev server serves the homepage on loopback with no required database, credentials or email provider.
3. Header, hero, search/filter controls, cards and footer adapt at the three QA widths without horizontal page overflow.
4. Sample content is visibly fictional; no real application/identity workflow or unsupported claims are presented.
5. Keyword/location/category combinations return correct fixture subsets; clear-all restores all fixtures; zero results show an accessible empty state.
6. Typecheck, lint, meaningful filtering tests, production build and browser checks pass, or the task remains incomplete with explicit blocked evidence.
7. Developer instructions include exact commands, local-only limitations and remaining dependencies; independent review findings are resolved.
8. Existing database work and original design assets remain untouched; no release operations occur.

## Risks
The preview can be mistaken for a working recruitment product: prominent fixture labelling and no functional intake mitigate this. Some design-review text is stale; TASK-001 decisions take precedence. Local dependency install may be blocked by network access or unavailable pinned packages; report the actual failure rather than silently selecting versions. Browser QA capability is not yet verified. The current branch contains unrelated local work, so any later commit must be separately scoped and authorized.

## Dependencies
Installed Node/npm and existing lockfile verified; frontend dependency install succeeded after approved network escalation, with no dependency-pin/lockfile changes. Owner task approval COMPLETE. Browser verification PARTIAL: 375px search/empty/reset/Remote/focus checks succeeded in the completion attempt; full tablet/desktop and remaining interactions are BLOCKED by repeated minimized-window/user-input errors even after owner readiness and one automation reset. See the execution log for exact coverage. No PostgreSQL, Go service, SMTP/SMS provider, domain or hosting account is needed for this preview. Approved standalone logo/font files are optional later design inputs, not a prerequisite for this increment.

## Estimated Complexity
Small-to-moderate first frontend increment; no delivery-time promise.

## Proposed small tasks
Owner approved this exact scope with "you can start" on 2026-11-03. Implementation and installation are authorized; release operations remain unauthorized.

| ID | Objective and exact scope | Dependencies | Expected files | Steps | Verification / acceptance | Status |
| --- | --- | --- | --- | --- | --- | --- |
| WEB-01-A | Install locked packages and make Next.js runnable | Approval; Node/npm; registry access | web/package.json scripts; config/declaration files above; minimal app/layout.tsx and page.tsx; ignored dependencies | npm ci; configure App Router/TS/Tailwind/check scripts and minimal page | Dependency check; typecheck/build of minimal page; no pin changes | COMPLETE; production startup verified, dev-mode interaction not checked |
| WEB-01-B | Responsive brand shell | A; approved color/reference layouts | app/layout.tsx, page.tsx, globals.css; header/footer | Tokens, wordmark, landmarks, responsive shell and local-font fallback | Typecheck/lint/build; keyboard/width checks | IMPLEMENTED; browser verification BLOCKED |
| WEB-01-C | Homepage and sample-job browser | B | page.tsx; job-browser/card; demo-jobs/search; search tests | Fictional fixtures, labelled preview, keyword/location/category filters, counts, clear and empty state | Unit cases for search combinations/empty/reset; browser interaction at three widths | IMPLEMENTED; unit tests PASS; browser verification BLOCKED |
| WEB-01-D | Error/loading states, documentation and independent review | C | app/loading.tsx, error.tsx; website.md, README; task/log | Finish states; run all checks; inspect scope; independent review and fixes | Acceptance 1–8 verified; no unresolved findings | PARTIAL; no source findings, required browser evidence BLOCKED |

## Following website increments
These are proposed next tasks only; each needs its own concrete specification/approval.
1. WEB-02: job detail preview and clear presentation of external versus on-site application methods.
2. WEB-03: public API contracts and integration, remaining product filters, authoritative published/expired states and valid job SEO; depends on the original API/schema/authorization work and resolution of the database defect.
3. WEB-04: early super-admin company/job/list management under original 001-11a, with real password/TOTP protection and all original backend prerequisites.
4. WEB-05: applicant sign-in/profile/application tracker connected to completed authentication, private-file and retention services, after early admin entry; no real data before safeguards. Remaining staff/company/finance portals follow the existing delivery order.

## Approval and Lifecycle
Owner explicitly approved the presented WEB-01 specification with "you can start" on 2026-11-03. This includes installation of existing locked website dependencies and the frontend-first local preview exception. REQUEST, REPOSITORY INVESTIGATION, TASK SPECIFICATION, TASK APPROVAL and SMALL TASK BREAKDOWN: COMPLETE. IMPLEMENTATION: preview source complete. TESTING: dependency/type/lint/unit/build checks PASS; browser checks BLOCKED. INDEPENDENT IMPLEMENTATION REVIEW: BLOCKED solely by required browser evidence; no actionable code/document findings. ISSUE RESOLUTION: source findings NOT APPLICABLE (none), browser block unresolved. Acceptance criteria 3 and browser portions of 5–7 remain unverified; task is not marked complete. FINAL APPROVAL: PENDING. Database/live-service verification: NOT APPLICABLE to this preview. Commit/push/merge/deploy: unauthorized and PENDING; POST-MERGE VERIFICATION: PENDING until an authorized merge.
