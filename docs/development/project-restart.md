# Project restart audit — 8 November 2026

This is a resume of the existing project, not a reset. No files, database, credentials or Git history were deleted. The checkout remains on `task/001-03b-local-database`, with extensive pre-existing modified and untracked application work. No commit, push, deployment or merge was performed.

## Where the project stands

| Area | Verified current state | Remaining work |
| --- | --- | --- |
| Frontend stack | Next 16.4.2, React 19.3.1, TypeScript 6.0.3 declared in `web/package.json`; installed Node 26.13.0/npm 11.20.0 executed successfully | Browser acceptance and owner design approval |
| Public website | Search/filter sample vacancies, details, report/method previews, location discovery and information pages | Real listings/job authoring workflow and final launch policies |
| Applicant frontend | Local profile/CV example, application creation, tracker/progress and updates | Real email-code authentication, private CV service, persistent intake/tracking/notifications and privacy decisions |
| Admin frontend | Local company/job/team/list/recruitment/report/content/invoice/payment/settings/activity workflows | Most screens still use React-memory fixtures; backend service integration remains |
| Recruiter/company frontend | Assigned-job and own-company sample projections | Real authorization, persisted workflows and tenant acceptance |
| Live source | Public Go API, privileged password/TOTP/session frontend and super-admin company management exist | Owner-run database/migration/recovery and browser acceptance remain unverified; source is not an operational pass |
| Release | Local preview only, noindex | Independent final acceptance, owner approval and separately authorized release work |

## What differed from Stitch

The earlier frontend was a broad functional sample, not a faithful reproduction of the ten supplied screenshots. Original references remain unchanged under `design/stitch/`.

| Supplied screen pair | Previous gap | Source correction in this task |
| --- | --- | --- |
| Home | Invented oversized hero/arrow art, keyword-only search bar, generic cards, no mobile filter dialog/bottom navigation | Compact text hero, integrated keyword/location/category search, quick/removable filters, mobile filter dialog, pagination, salary/posted dates, mobile navigation |
| Job detail | Basic full-width heading/sidebar, no compensation grid or mobile action | Breadcrumb, two-column summary/content/application composition, compensation metadata, explicit configured channel and sticky mobile application entry |
| Sign in | Generic applicant admin-style workspace and two-column access walkthrough | Centered sharp-edged access card, identification/verification layout and six-code-cell illustration; email-only, fixed examples |
| Applicant profile | Generic form/CV checkbox, no location/document presentation | Public applicant shell, summary/readiness, location selection, contact fields, local fictional CV viewer/replace/remove, save/cancel |
| My applications | Three-column generic table | Status counts, richer role/employer/date/progress records, mobile cards and compact overview presentation |

All use locally hosted Geist and Space Grotesk plus the existing purple brand and sharp surfaces. A text/D brand fallback remains: the uploaded brand files are presentations with large backgrounds, not production-ready transparent/vector assets. No new brand logo was invented. Sidebar filters retain the established single-selection model rather than adopting Stitch's inconsistent multi-select semantics. Initial tracker contains one actual fictional on-site application; external clicks are not falsely represented as successful applications. The visual match is **not certified** without browser checks.

Some reference elements intentionally remain absent under existing approved product scope: Saved jobs, Somali language switching, self-service Post a Job/employer promotion, unsupported job/employer/user statistics or accreditation/identity claims, SMS/WhatsApp applicant authentication, enterprise SSO, real applicant PDF export, and a 10 MB CV allowance. Approved future CV limit is 5,242,880 bytes for PDF/.docx. No biometric, national-ID, telecom-verification or real delivery claim was copied from the mockups. Admin/recruiter/company designs have no uploaded Stitch screen counterparts; those layouts were created separately.

## Resume the frontend

No backend environment variables, API key or PostgreSQL setup are required for the sample frontend. The selected commands in `live-first-five.md` are for the separate live mode.

From the repository root:

```powershell
Remove-Item Env:DALKA_WEBSITE_MODE -ErrorAction SilentlyContinue
Set-Location web
npm.cmd run dev
```

Open the URL printed by Next. Review `/`, a sample job detail, `/account/sign-in`, `/account/profile`, `/account/applications` and `/admin`. Navigate with site links to retain sample changes; refresh or Reset sample data restores fixtures. Use only fictional information.

For this audit, the latest production build is also running at `http://127.0.0.1:3100` while the agent's terminal remains alive. Stop that owned server before rebuilding. This is local preview hosting, not deployment.

For real services, follow [live first-five setup](live-first-five.md). Database/setup/migrations/bootstrap/integration remain owner-run under their existing restrictions. No database connection, backend test or setup command ran in this frontend audit. A working frontend preview does not prove PostgreSQL is configured.

## Verification and next work

Fresh frontend evidence and independent review are recorded in [the alignment log](../../tasks/specs/TASK-001-STITCH-ALIGN-log.md) and [review](../../tasks/specs/TASK-001-STITCH-ALIGN-review.md). Automated checks cannot verify browser hydration, responsive layout or keyboard focus.

Next: restore browser access and verify all five pairs at 375/768/1440 widths, complete keyboard/dialog/zoom checks and connected sample journeys, resolve visual findings and obtain owner design acceptance. Both the Chrome extension and the built-in Browser currently return `The browser access host is unavailable`, including after extension installation/Manage selection; native Chrome capture reported a minimized window. No visual or keyboard pass is claimed. Browser connection failure is independent of the frontend build.

After frontend acceptance, resume the numbered service roadmap in `tasks/specs/TASK-001-FRONTEND-PLAN.md`: job authoring and persisted applicant/recruitment/finance features still require their backend contracts/policy gates. Do not label the whole product complete based on its sample UI.
