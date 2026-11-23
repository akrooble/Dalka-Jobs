# TASK-001-QA-DOC

- Title: Prepare the local QA checklist and evidence record.
- Type: Documentation.
- Priority: Owner requested.
- Problem Statement: Browser and live database acceptance remain unverified; commands and outstanding journeys are distributed across development guides and task logs.
- Current Behavior: There is no dedicated QA checklist under `docs/qa/`.
- Expected Behavior: A tester can select frontend-preview or live-first-five scope, follow reproducible checks, record sanitized evidence and distinguish pending acceptance from historical automated results.
- Root Cause: UNKNOWN; this task consolidates existing evidence rather than diagnosing application behavior.
- Repository Evidence: `docs/development/website.md`, `docs/development/live-first-five.md`, `docs/api/first-five.md`, `web/package.json`, `web/tests/frontend-http.ts`, `web/tests/live-http.ts`, `api/internal/httpapi/integration_test.go`, `tasks/specs/TASK-001-FRONTEND-COMPLETE-log.md`, `tasks/specs/TASK-001-FRONTEND-COMPLETE-review.md`, `tasks/specs/TASK-001-FE-01-05-LIVE-log.md`.
- Scope: Markdown QA plan, case IDs/steps/expected results, run and defect templates, separate modes and prerequisites, known blockers, command references and links from both development guides.
- Out of Scope: Application changes, executing application/browser/HTTP/database checks, setup/credentials/migrations, service changes, dependencies, commits, pushes, deployments and merges.
- Affected Components: QA/development documentation and task records only.
- Expected Files: `docs/qa/manual-acceptance.md`, `docs/development/website.md`, `docs/development/live-first-five.md`, this specification and adjacent execution log.
- Database Impact: No connection or mutation. Existing owner-only integration instructions are linked; destructive migration recovery remains separately authorized and unverified.
- API Impact: None; expected results refer to the existing first-five contract.
- Security Impact: Evidence must exclude credentials, enrollment secrets, recovery codes, session/CSRF values, environment contents and real applicant data. No security policy changes.
- Tenant Impact: Sample projections are presentation checks; live role-denial checks cover the implemented company endpoints only. Future tenant services remain unverified.
- Implementation Approach: Read current source/contracts/logs; write the specification first; create one bounded checklist; add guide links; inspect links/whitespace/diff and obtain independent read-only documentation review.
- Edge Cases: Empty live listings without job authoring; live API offline; sample state reset; soft 404s; duplicate/stale company writes; unavailable browser; integration skip mistaken for pass; preview routes mistaken for protected services.
- Test Plan: Repository root: `git diff --check`; inspect new documents directly; verify local Markdown targets and case-ID uniqueness with a read-only script. No application tests needed for documentation-only changes. Independent review checks source alignment and safe owner-run boundaries.
- Acceptance Criteria: Both modes and their limits are explicit; numbered cases provide actions and observable expectations; current-run results default to NOT RUN/BLOCKED; commands match package/source evidence and identify working directories; run/defect/sign-off templates are present; both guides link to the document; documentation checks pass and review findings are resolved or explicitly blocked.
- Risks: Historical results mistaken for current acceptance; live mode mistaken for a complete backend; secret screenshots. Mitigate with explicit scope/status/evidence rules.
- Dependencies: Existing repository documentation/source only. Browser/database access is not needed to prepare this document.
- Estimated Complexity: Small documentation task.

## Approval

5 November 2026: Owner request, "prepare the QA doc", explicitly authorizes this documentation scope. No separate execution or release authorization is inferred.

## Small task

QA-DOC-1: Consolidate the two QA scopes into the expected files above, with no application edits. Dependencies: existing implementation evidence. Steps: inspect, draft, link, check, independently review, resolve. Verification: documented checks above. Acceptance: all criteria above. Status: COMPLETE; 29 cases, evidence templates and both guide links verified; independent documentation review APPROVED.

## Lifecycle

REQUEST / REPOSITORY INVESTIGATION / TASK SPECIFICATION / TASK APPROVAL / SMALL TASK BREAKDOWN / IMPLEMENTATION / DOCUMENT CHECKS / INDEPENDENT DOCUMENTATION REVIEW / ISSUE RESOLUTION: COMPLETE. Documentation review: APPROVED; no remaining actionable findings. FINAL OWNER APPROVAL: PENDING. Application acceptance: BLOCKED by outstanding browser and owner-run database evidence in the source task logs; not executed in this task. AUTHORIZED MERGE: PENDING separate authorization. POST-MERGE VERIFICATION: NOT APPLICABLE because no merge is in scope.

## Approved PDF export addendum - 5 November 2026

Owner request, "i want a pdf of the QA", authorizes QA-DOC-2: export the existing checklist to `output/pdf/dalka-jobs-qa-checklist.pdf`. Type/priority: documentation artifact, owner requested. Problem/current behavior: QA exists only as Markdown. Expected behavior/scope: readable paginated PDF preserving all source content, 29 case IDs, commands, references and unexecuted status. Evidence: `docs/qa/manual-acceptance.md` and PDF skill. All unchanged API/database/security/tenant boundaries, exclusions and risks above still apply; no application checks or release actions. Expected files: final PDF and this spec/log; temporary generation/render files under `tmp/pdfs/` are removed after verification. Dependencies: bundled Python/ReportLab, pypdf/pdfplumber and Poppler; no repository dependency changes. Approach: generate from Markdown with wrapped text/tables, embedded fonts and numbered pages; extract/check content and render/inspect every page. Edge cases: long routes/code lines, split rows and missing glyphs. Acceptance: all 29 cases and source sections/content retained; no clipping/overlap; final PDF opens and renders. Complexity: small format conversion. Verification: PDF text/geometry checks, rendered visual inspection and root `git diff --check`. Independent PDF review: BLOCKED (no separate reviewer for this small derivative export); existing Markdown review remains valid for source content, not PDF layout. Status: specification/approval/breakdown COMPLETE; generation/verification PENDING. Owner acceptance/release approval PENDING; no merge in scope.

QA-DOC-2 result: PDF generation and verification COMPLETE, 9 A4 pages. All 29 cases, source sections and prose/code content verified by extracted-text comparison (whitespace/dash normalization and table-to-case formatting only); page text bounds checked; every final page rendered and visually inspected. Independent PDF review remains BLOCKED as above; owner acceptance and release authorization remain PENDING. Source Markdown and application files unchanged.
