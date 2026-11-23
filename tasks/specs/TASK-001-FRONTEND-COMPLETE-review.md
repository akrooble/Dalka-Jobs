# Independent frontend review · 5 November 2026

Independent reviewer: `frontend_review` (read-only agent, separate from the implementation agent). Specification: `TASK-001-FRONTEND-COMPLETE.md`.

Reviewed all new frontend components, sample model/provider, canonical routes, styles/tests, public navigation/detail changes and preserved explicit live-mode entry points. New sample components contain no API calls or browser persistence. Company projections strip private fields; recruiter views follow assignments. Invoice locking, integer cents, payment bounds and separate-currency totals were inspected. Authentication/authorization, tenant security, database integrity, real uploads, email, migrations and API behavior are unchanged and outside this sample-only task, not certified by the frontend review.

| Finding | Severity | File / line | Reproduction / problem | Expected behavior / fix verified |
| --- | --- | --- | --- | --- |
| FR-01 | MAJOR | `web/components/frontend/jobs.tsx:27`, `web/lib/frontend-demo.ts:91` | Reassigning a linked job to another company left candidate/invoice company references inconsistent. | Linked reassignment is refused with an explanation. Model regression passes. RESOLVED. |
| FR-02 | MINOR | `web/components/frontend/management.tsx:15`, `web/lib/frontend-demo.ts:95` | Location rename left company profiles using a removed option. | Rename cascades across job/company references. Model regression passes. RESOLVED. |
| FR-03 | MINOR | `web/components/frontend/public-copy.tsx:3` | Saved name/about/contact copy was not reflected publicly. | About/Contact render sample settings. Source wiring verified. RESOLVED. |
| FR-04 | MINOR | `web/lib/frontend-demo.ts:100`, `web/components/frontend/recruitment.tsx:22` | Submitted stage retained a disabled sharing flag; own progress changes did not notify the sample applicant. | Ineligible sharing clears, exact application tracks progress and receives changed-stage/interview notifications. Model regression passes. RESOLVED. |
| FR-05 | MAJOR | `web/lib/frontend-demo.ts:82`, `web/components/frontend/public-job-detail.tsx:18` | Revoked sample authority still permitted local on-site application. | Validator rejects it; public UI explains paused applications. Model regression passes. RESOLVED. |
| FR-06 | MAJOR | `web/components/frontend/demo-provider.tsx:12` | Resetting sample state retained mounted unsaved form drafts. | Reset keys the child Fragment by generation and remounts local form state. Source verified; actual browser interaction remains unverified. Code finding RESOLVED. |
| FR-07 | MINOR | `web/app/workspace.css:36` | Long unbroken editable headings/list labels risked narrow-layout overflow. | Heading shrink and editable-copy wrapping rules added. Source verified; visual acceptance pending. Code finding RESOLVED. |
| FR-08 | MINOR | `web/app/admin/[...section]/page.tsx:4`, `web/app/account/[section]/page.tsx:4`, `web/app/workspace/[area]/[section]/page.tsx:3` | Unknown panel paths returned a streamed not-found page with HTTP 200. | Finite generated paths reject unknown routes before rendering; independently verified four valid 200s and four expected 404s. RESOLVED. |

Independent checks: `npm.cmd run test:unit` passed 46/46, exit 0, after fixes; read-only local HTTP valid/unknown route checks passed. Reviewer did not repeat build/lint/typecheck (implementation-agent evidence in log). No backend/database commands or edits were performed by the reviewer. No unresolved code findings remain in reviewed scope.

Remaining required acceptance evidence: browser tooling could not determine Chrome's current URL with enough confidence and stopped. Responsive checks at 375/768/1440, keyboard navigation, modal focus/restoration, hydrated workflows and invoice print/PDF appearance are unverified. HTTP checks and source inspection do not substitute for that evidence. Final approval and all release operations remain pending/not authorized.

BLOCKED
