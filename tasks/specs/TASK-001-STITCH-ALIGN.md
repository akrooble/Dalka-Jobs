# TASK-001-STITCH-ALIGN

- Title: Resume frontend work and align the five supplied screen pairs with Stitch.
- Type: Frontend design correction and project audit.
- Priority: Owner requested.
- Problem Statement: The existing sample frontend materially diverges from the uploaded Stitch layouts and was never visually accepted.
- Current Behavior: Invented homepage hero/art; generic applicant admin-style shell; incomplete card metadata, mobile controls, profile document presentation and application progress records. Earlier automated checks passed, but browser acceptance is blocked.
- Expected Behavior: Reference-based public and applicant composition with working local sample controls, preserving honest sample labels and established live entry points. A documented distinction between frontend source, live functionality and acceptance.
- Root Cause: Earlier implementation reused generic workspace components and substituted layout/content without completing browser comparison. No rendered comparison evidence exists.
- Repository Evidence: `design/stitch/*/code.html`, paired `screen.png`, `design/REVIEW.md`, `web/components/job-browser.tsx`, `web/components/frontend/account-screen.tsx`, `web/components/frontend/public-job-detail.tsx`, prior FRONTEND-COMPLETE spec/log/review. Existing branch `task/001-03b-local-database` has extensive modified/untracked owner work.
- Scope: All five desktop/mobile screen pairs: home, job detail, applicant sign-in, profile and application tracker; public/applicant navigation, sharp tokens, locally hosted reference fonts, mobile filters, filter chips, result pagination, compensation/date metadata, local CV viewer/replace/remove and application stage counts/progress. Existing sample workflows retained; frontend documentation and restart audit.
- Out of Scope: Database/backend/scripts/proxy mutation or execution, new live services, saved jobs, SMS/WhatsApp authentication, unsupported trust claims, self-posting, applicant PDF export, production policy decisions, release operations.
- Affected Components: Next frontend source, sample presentation model, public and applicant CSS, static fonts, documentation and proportionate regression tests.
- Expected Files: `web/app/page.tsx`, `globals.css`, `stitch.css`, public header/footer/card/browser, frontend applicant/detail components, `web/lib/frontend-demo.ts`, `web/public/fonts/*`, frontend tests; this task/log/review and `docs/development/project-restart.md`.
- Database Impact: None; no connection, provisioning, migrations, reset or database tests.
- API Impact: No contract changes. Existing explicit live routes and authentication stay intact. Sample interactions remain in React memory.
- Security Impact: No real credentials, CVs or personal information accepted. No browser authentication simulation. Fonts served locally, with licenses; no new executable dependency. No invented trust/identity/success claims.
- Tenant Impact: Sample role projections retained; real tenant authorization unchanged and unverified.
- Implementation Approach: One implementation agent; independent read-only reviewer. Use screenshots/HTML as visual evidence, adapt copy to established product scope. Add dedicated applicant shell; reuse validated sample model/actions and dialog/pagination controls.
- Edge Cases: Unknown/empty filters; pagination after narrowing; long labels and zero applications; draft/closed/authority-paused jobs; no CV, unsaved profile cancellation/reset; inaccessible browser tooling.
- Test Plan: From `web/`: `npm.cmd run test:unit`, `lint`, `build`, then `typecheck`; production preview on free loopback 3100 and existing frontend/prototype HTTP checks. Root diff/whitespace and actual untracked-content inspection. Browser 375/768/1440, keyboard and hydrated flows only if available; otherwise explicitly BLOCKED. No backend/database verification.
- Acceptance Criteria: Five reference compositions represented in source; mobile navigation/filter/apply controls; coherent local forms and application records; no fabricated live functionality or excluded features; unit/lint/build/typecheck and HTTP regressions pass; precise audit/restart report; independent review with unresolved browser evidence explicitly recorded.
- Risks: Visual fidelity cannot be certified without browser evidence; missing reference assets use explicit local fallback. Existing user work must be preserved. Sample preview remains an unfinished product.
- Dependencies: Existing pinned Next/React toolchain and installed dependencies; reference font binaries/licenses from Google Fonts source repository, no npm changes.
- Estimated Complexity: Substantial frontend correction.

## Approval

2026-11-08 owner requested checking where everything stands, completing the frontend and correcting divergence from the uploaded Stitch design. This explicitly authorizes the frontend correction scope above; no new live/backend or release scope inferred. Earlier 2026-11-05 frontend-only restrictions remain respected.

## Small tasks

| ID | Objective / scope | Dependencies | Files | Verification / acceptance | Status |
| --- | --- | --- | --- | --- | --- |
| SA-1 | Audit current source and ten reference exports | Repository investigation | Read-only source/reference | Concrete five-screen gap matrix | COMPLETE; independent source audit CHANGES REQUIRED |
| SA-2 | Public home/navigation/cards/detail and mobile controls | SA-1 | public components/styles/fonts | Existing model checks; lint/build/HTTP | SOURCE IMPLEMENTED; automated checks PASS, visual acceptance BLOCKED |
| SA-3 | Applicant shell/sign-in/profile/tracker composition | SA-1 | applicant components/model/styles | Meaningful model tests; lint/build/HTTP | SOURCE IMPLEMENTED; automated checks PASS, hydrated acceptance BLOCKED |
| SA-4 | Verify, independent review, restart handoff and limitations | SA-2/3 | docs/log/review | Fresh commands and actual file inspection | Automated/docs/code findings COMPLETE; browser/overall approval BLOCKED |

## Lifecycle

REQUEST, REPOSITORY INVESTIGATION, TASK SPECIFICATION, TASK APPROVAL, SMALL TASK BREAKDOWN, SOURCE IMPLEMENTATION: COMPLETE. Automated frontend TESTING: PASS (47 unit tests, lint/build/typecheck, both HTTP suites and local font delivery). INDEPENDENT PR REVIEW: source findings resolved and independently rechecked; overall BLOCKED by missing browser acceptance. ISSUE RESOLUTION: COMPLETE for reported source findings. Browser capture: BLOCKED (Chrome extension and built-in Browser host unavailable, including after owner installation/selection). FINAL APPROVAL: PENDING. AUTHORIZED MERGE, POST-MERGE VERIFICATION: NOT APPLICABLE; no release requested or authorized. Source corrections do not certify exact visual fidelity or live functionality.
