# Frontend roadmap screen prototypes

## Task ID / Title / Type / Priority
TASK-001-FE-PROTOTYPES. Complete the remaining frontend screen prototypes. Owner-requested frontend implementation, 4 November 2026.

## Problem Statement / Current Behavior
The public preview and FE-02 shared controls exist. The remaining numbered frontend roadmap has no applicant or privileged screens. Live APIs, sessions, authorisation, private files and finance contracts are not implemented. Existing database and website work is uncommitted and must be preserved.

## Expected Behavior
A navigable, responsive, clearly fictional prototype covers the known screen requirements in FE-03–20. The existing public website remains available. Each screen distinguishes a design example from working authentication, intake, data management and financial operations. Live roadmap acceptance stays pending; browser checks are blocked when unavailable.

## Root Cause
NOT APPLICABLE: planned frontend delivery, not a defect.

## Repository Evidence
AGENTS.md and workflow documents; TASK-001.md roles, jobs, privacy, finance and unresolved decisions; TASK-001-FRONTEND-PLAN.md numbered screens/dependencies; TASK-001-FE-02.md and web/components/ui/; web/lib/demo-jobs.ts; web/package.json scripts; design/REVIEW.md and preserved design references. Existing branch task/001-03b-local-database contains unrelated user work.

## Scope / Implementation Approach
Create /prototype index and statically enumerated /prototype/[area]/[screen] routes for public service states, privileged sign-in, early companies/jobs/lists, applicant sign-in/profile/application/tracker/notifications, remaining admin users/assignments/trust/reports/content/recruitment/sharing, recruiter workspace, company read views, finance and settings/activity/overview. Reuse existing styles/components and fictional jobs. Record screen/permission/state design before remaining panel implementation. Use typed presentation fixtures, never a proposed production API schema. Support local table search and state selection, sample editor validation and preview, notification dismissal and navigation. Sensitive operations stay disabled with explanations. Authentication is a read-only walkthrough, accepts no credentials and cannot create a session. File selection/download, application submission, deletion, sharing, publishing, payments and invoice PDF generation remain unavailable. Expose no real data. No persistence or network client is introduced.

The owner's prototype choice supersedes live-service dependencies only for the design preview. Implement early management/applicant designs before remaining panel designs. FE-03 live contracts/client and FE-20 live integration remain BLOCKED; prototype coverage never closes their live acceptance. Record coverage per numbered task in the roadmap and design inventory.

## Out of Scope
Backend/API/session contracts, CSRF implementation, auth/role simulation, storage, real credentials/CVs/applications, database or service execution, live policy decisions, dependency changes, external assets, commits/pushes/merge/deployment. Existing user-only database restrictions persist.

## Affected Components / Expected Files
web/lib/prototype.ts; web/components/prototype/{shell,screen}.tsx; web/app/prototype/page.tsx and [area]/[screen]/page.tsx; web/app/globals.css; web/tests/prototype.test.ts and prototype-http.ts; web/package.json test commands only; docs/design/frontend-prototypes.md; docs/development/website.md; README.md; frontend roadmap/log; this spec/log. Existing FE-02 spec/log and WEB-01 log receive verification/status updates only.

## Database Impact / API Impact
None. No database connection, fetch, environment access, schema or API contract changes. Fixtures model presentation only. Live services remain prerequisites.

## Security Impact / Tenant Impact
All prototypes are public, noindex and synthetic. Display only the known role-specific projection. Company views exclude Submitted/private notes/contact/CV; rejected fields and sharing lifecycle stay unresolved. Recruiter fixtures show assigned work only. No browser storage or session cookies. These projections illustrate design, not access enforcement. No rendered HTML injection or arbitrary external destinations.

## Edge Cases
Unknown routes; empty searches; stale pages; long cell content; pending/expired/forbidden/error states; invalid sample fields; unsupported workflow policies; reduced motion; narrow tables; sample finance totals per currency and Sent lock; revoked-access illustrations; no success claims for disabled server operations.

## Test Plan
From web/: npm.cmd run test:unit, lint, build, then typecheck. Meaningful tests cover exact route uniqueness/lookup, role/permission projections, company stage exclusions, search/pagination, finite local sample validation and invoice sample arithmetic/currency separation. Production loopback HTTP checks cover all enumerated routes, unknown-route 404, noindex, sample notices, internal destinations and no collecting credential/file forms. Inspect full changed/new source, unchanged lockfile and git diff --check. Independent read-only review required. Browser 375/768/1440, keyboard/modal and interaction checks are BLOCKED until supported capture works; static/HTTP checks never substitute for them.

## Acceptance Criteria
1. Every known screen scope in FE-03–19 has a linked prototype or an explicit policy/service block; existing public pages and FE-02 gallery regressions pass.
2. Role-specific navigation, sample filtering/pagination, state examples and sample editor validation work in source; no broken placeholder links or claimed server successes.
3. Company/recruiter design projections follow resolved product restrictions; unresolved policies are visibly gated.
4. Unit/lint/build/type/HTTP checks pass; independent findings resolved. Remaining browser and live-service acceptance remains explicit.
5. No dependencies, backend/services, real data, persistence or release operations change; original work is preserved.

## Risks / Dependencies / Estimated Complexity
Risk: mistaking a broad prototype for a working secure product. Permanent sample banner, /prototype route prefix, disabled operations and separate status tracking mitigate this. Depends on installed pinned frontend toolchain, existing fixtures/shared controls and known requirements. Moderate multi-screen frontend increment; no unsupported estimate for live completion.

## Small Tasks
| ID | Objective / exact scope | Dependencies / files | Steps and verification | Status |
| --- | --- | --- | --- | --- |
| PROTO-A | Screen/permission/state inventory and typed fixture adapter | Known product requirements; docs/design/frontend-prototypes.md, lib/prototype.ts | Preserve unresolved gates; test route/projection boundaries | SOURCE COMPLETE; unit checks PASS |
| PROTO-B | Early authoring and applicant prototypes | A, shared UI; prototype shell/screen/routes/CSS | Build first-phase screens and local demonstrations; lint/build/HTTP | SOURCE COMPLETE; automated/HTTP PASS; browser QA BLOCKED |
| PROTO-C | Remaining role and finance prototypes | B design; same implementation files sequentially | Record remaining panel design then implement; permission/arithmetic tests | SOURCE COMPLETE; automated/HTTP PASS; browser QA BLOCKED |
| PROTO-D | Full source regression, docs and independent review | A–C; tests/docs/log | Run checks, inspect all routes/new files, resolve findings | Automated/HTTP PASS; source review no findings; full review BLOCKED by browser QA |

## Approval and Lifecycle
Owner explicitly selected “Continue through the frontend roadmap” and then “Build frontend screen prototypes now; keep live integration pending” on 4 November 2026. The concrete scope above was presented before implementation. REQUEST/INVESTIGATION/SPECIFICATION/TASK APPROVAL/BREAKDOWN: COMPLETE for this prototype slice. IMPLEMENTATION: source COMPLETE for 37 screen routes plus the index. TESTING: 30 unit tests, lint, build, typecheck and 50-page/50-destination/five-404 HTTP regression PASS. Independent source review found no actionable issues; full PR review and browser-dependent acceptance remain BLOCKED. ISSUE RESOLUTION: no source findings; browser block unresolved. Acceptance 1 and 5 source boundaries verified; 2–4 source/automated/HTTP portions verified, browser interaction/rendering portions unverified. Full live roadmap acceptance BLOCKED by B1–B4 and unresolved policies. Final owner acceptance and all release phases PENDING; no commit/push/merge/deployment authorisation.
