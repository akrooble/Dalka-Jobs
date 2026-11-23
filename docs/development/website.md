# Local website development

See the [8 November project restart audit](project-restart.md) for the current Stitch alignment, verified project status and remaining live-service gaps. Public/applicant source has since been aligned with the five supplied desktop/mobile pairs; browser visual acceptance remains pending.

Use the [local QA checklist](../qa/manual-acceptance.md) for frontend browser cases, live-scope boundaries, evidence recording and sign-off. It is a test plan; required browser acceptance remains unverified.

## Complete frontend preview · 5 November 2026

The default mode now includes an interactive website, applicant workspace and full admin frontend. It runs without the Go API, PostgreSQL, an environment file, secrets, remote assets or additional dependencies. Leave `DALKA_WEBSITE_MODE` unset (or remove it from the current terminal with `Remove-Item Env:DALKA_WEBSITE_MODE -ErrorAction SilentlyContinue`) to use this mode. The explicit existing live mode remains separate; this frontend task made no backend/database/proxy changes.

From `web/`, use `npm.cmd run dev`, then open the loopback URL it prints. A production preview can use `npm.cmd run build` followed by `npm.cmd run start -- --port 3100`. Stop that server before rebuilding. The agent's final local production preview is on `http://127.0.0.1:3100` while its terminal session remains running.

| Route | Frontend journey |
| --- | --- |
| `/` and `/jobs/[existing-sample-slug]` | Search/filter sample jobs, details, related jobs, method walkthroughs and local report submission |
| `/preview-job?id=...` | Preview newly created/edited sample vacancies, including drafts |
| `/account/sign-in` | Read-only email verification layout; opens public sample workspace without authenticating |
| `/account` | Applicant overview, application counts and profile summary |
| `/account/profile` | Validate reserved sample contact details; attach built-in sample CV; clear sample profile |
| `/account/apply?job=sample-04` | Add a fictional application after profile/CV/acknowledgement checks |
| `/account/applications`, `/account/application-detail?id=...` | Follow sample applications, stages and interview information |
| `/account/notifications` | Read and dismiss unread status using mark-read controls; no emails sent |
| `/admin/sign-in` | Password/authenticator/recovery layout using disabled fixed examples |
| `/admin` | Overview, linked metrics, recent jobs and next steps |
| `/admin/companies`, `/admin/jobs`, `/admin/job-editor?id=...` | Company create/edit/job associations; job drafts/edit/publish/archive/preview |
| `/admin/recruitment`, `/admin/candidate?id=...` | Candidate search/filter, stage/interview updates, private sample notes and sharing-review marker |
| `/admin/users`, `/admin/assignments` | Local team role/status editing and per-job recruiter assignments |
| `/admin/lists`, `/admin/trust`, `/admin/reports` | Add/rename categories/locations; separate sample verification/authority checks; resolve local reports |
| `/admin/content`, `/admin/settings` | Sample about/contact/warning copy and general preferences; public sample pages reflect saved copy |
| `/admin/invoices`, `/admin/invoice-editor`, `/admin/invoice-detail?id=...` | Draft/edit/mark-sent/cancel invoices; locked sent content; print a labelled sample invoice or save using the browser's PDF option |
| `/admin/payments`, `/admin/prices`, `/admin/summary` | Partial payment records, illustrative default fees/instructions and separate USD/EUR totals |
| `/admin/activity` | Only synthetic actor/record IDs and timestamps |
| `/workspace/recruiter/jobs`, `/workspace/recruiter/candidates`, `/workspace/recruiter/interviews` | Assigned-job sample views, candidate review and interview/private-note controls |
| `/workspace/company/jobs`, `/workspace/company/candidates`, `/workspace/company/progress`, `/workspace/company/rejected` | Read-only own-company projection; eligible names/stages only; rejected fields withheld pending policy |

All changes live in a single React-memory provider in this tab. Navigate with site links to retain local edits; refreshing, opening another tab, or **Reset sample data** restores the fixtures. Reset also clears mounted unsaved form drafts. There is no localStorage, persisted session, real login, email, real file upload, applicant intake, API write or payment. The built-in sample CV avoids accepting personal documents. Contact email fields require `@example.invalid`; sample phone is empty or `+000 000 000`. Enter fictional values only.

Try these connected journeys:

1. Add a company in `/admin/companies`, then create a vacancy in `/admin/job-editor`. Add description, responsibilities, requirements and closing date. Save a draft, reopen it, then publish the sample. A published on-site method requires that company's sample authority flag in `/admin/trust`. Follow **Visit website** to see the published sample. Archive it and verify it disappears from the public collection. Jobs with linked candidates/invoices cannot move to a different company.
2. In `/account/profile`, select the built-in CV and save. Open `/account/apply?job=sample-04`, add fictional experience and acknowledge the preview. The new sample appears in My applications and admin recruitment. Updating its stage/interview in the candidate editor updates its applicant tracker and creates a local unread notification. Duplicate, expired and authority-revoked sample applications are refused.
3. Report a listing from its detail page, then review/resolve the sample in `/admin/reports`. Renaming a managed location updates matching jobs and company profiles.
4. Create an invoice, save the draft and mark it Sent. Content becomes locked. Record a partial payment, then open revenue summary to see the outstanding balance. Amounts use integer cents; zero/excess/draft payments are rejected. A sample with existing payments cannot be cancelled while the refund policy is unresolved. Printing is a browser action, not server PDF generation. New display numbers start `SAMPLE-`; no real invoice number is allocated.

Company previews continue to withhold contacts, CVs and private notes even if a sharing-review marker is selected. Submitted/Rejected records are excluded from the main company list, and those stages clear the marker. Recruiter preview uses the current sample assignments. These are presentation projections, not access control or production business rules. Legal content, actual sharing/downloads, identity, retention, exact financial policies and live service integration remain pending their separate tasks.

Frontend verification from `web/`: `npm.cmd run test:unit` (46 cases), `npm.cmd run lint`, `npm.cmd run build`, then `npm.cmd run typecheck`. With a separate default-mode production preview on port 3100: `npm.cmd run test:frontend-http` (39 pages, 69 link destinations, six 404 cases) and `npm.cmd run test:prototype-http` (50 existing preview pages). These HTTP suites make no API/database requests and do not execute browser JavaScript. Current automated results, resolved independent review findings and blocked visual/keyboard/print checks are recorded in `tasks/specs/TASK-001-FRONTEND-COMPLETE-log.md` and its review artifact. Do not treat missing browser evidence as a visual or accessibility pass.

## Earlier preview increments

The notes below describe the earlier fixtures/component gallery and reference-only prototypes. Canonical interactive workspace behavior is documented above. Five published samples appear initially in public search; the archived Logistics Assistant detail remains available directly. Earlier live-integration tasks and their acceptance gates are unchanged by this frontend-only work.

The public website preview includes a responsive homepage, six original job-detail pages, public information pages and fixture-based search/filtering, plus the current interactive workspaces described above. A separate /ui-preview route demonstrates the Task 2 shared UI foundation and minimal panel layout. All preview listings and employers are fictional. This default mode uses no database, Go service, email provider, remote fonts or remote images. The separately configured live-mode API/auth/company source and its pending database/browser acceptance are described in [first-five local setup](live-first-five.md). Applicant intake and private CVs remain unavailable.

## Requirements and installation

Use the existing pinned Node 26.13.0 and npm 11.20.0. The versions are recorded in .node-version, tool-versions.json and web/package.json. No global framework installation is needed.

From the repository root:

```powershell
Set-Location web
npm.cmd ci
npm.cmd run dev
```

Installation requires network access to the npm registry. Use the committed lockfile; do not update dependency versions to resolve an installation failure. Dependencies and generated output are ignored by the root .gitignore. The development command binds to 127.0.0.1 and normally prints http://127.0.0.1:3000. If 3000 is busy, use the actual port printed by Next.js, or choose one explicitly:

```powershell
npm.cmd run dev -- --port 3001
```

Open the printed URL in a browser. Stop the server with Ctrl+C. No environment file or secrets are required for this increment. Use npm.cmd on Windows when PowerShell restricts npm.ps1; these commands do not change the execution policy.

## Checks

From web/:

```powershell
npm.cmd run check:dependencies
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test:unit
npm.cmd run build
```

The test script uses Node's built-in runner and TypeScript stripping, without another test dependency. Its 46 cases cover keyword/combined filters, reset, exact lookup, deadline boundaries, deterministic sorting, four application-method explanations, pagination/filter transitions, local-example validation, prototype routes/projections, sample invoice arithmetic, API/session client boundaries and loopback-port validation. These tests do not establish browser interaction or live database/tenant security. Node may print a non-fatal module-type parsing warning for the TypeScript test files.

Typechecking includes Next's generated types when present. Run the build to generate route types on a fresh checkout. For a local production-mode check after a successful build:

```powershell
npm.cmd run start
```

This also binds to 127.0.0.1. Do not run dev and start on the same port at the same time.

## Design and frontend boundaries

- Next.js App Router renders the page shell. The bounded job browser is interactive client UI.
- Primary color is #5850EC. Original Stitch HTML is reference-only; the app is rebuilt from components.
- Typography now uses locally hosted Geist and Space Grotesk with system fallbacks; binaries/licenses/provenance are under `web/public/fonts/`. A text wordmark is used until a standalone logo asset is prepared; original brand presentations are unchanged.
- web/lib/demo-jobs.ts is a typed fixture, not a database seed or approved API schema. web/lib/job-search.ts filters only those fixtures. All cards visibly identify sample employers and link to their sample details; no real application destinations are linked.
- Search updates as the user types or selects filters. Search jobs moves keyboard focus to the results heading. Location tiles clear the previous search, select the chosen location and return to results.
- Controls include keyword, location, category, employer type, job type, closing within seven days and newest/closing-date sort. Closing-date sort puts closed examples last. Published examples appear in public search; the archived, closed Logistics Assistant example remains available at its original detail URL.
- Dates and expiry use a visible fixed snapshot of 3 November 2026, 09:00 Somalia time (UTC+3). The seven-day filter demonstrates a rolling 168-hour window from that snapshot; it does not settle the unresolved production closing-soon or exact deadline policy. Future real expiry is Go/API-owned.
- Metadata asks search engines not to index this preview. No JobPosting structured data is emitted for fictional vacancies.
- Private data, authentication and business rules will live behind the approved Go API. The preview implements none of those protections and must not receive real applicant data.

## Public preview routes

| Route | Contents |
| --- | --- |
| / | Homepage, sample collection and filters |
| /jobs/frontend-engineer-talo-digital | Company-website application-method explanation |
| /jobs/community-health-officer-daryeel | Full-recruitment application-method explanation |
| /jobs/finance-administration-officer-hilaac | Email application-method explanation |
| /jobs/programme-coordinator-wadajir | Second full-recruitment example |
| /jobs/product-designer-talo-digital | Remote job example |
| /jobs/logistics-assistant-sahan | Closed sample and WhatsApp-method explanation |
| /about | Product purpose and preview boundaries |
| /contact | Contact placeholder; no fabricated details or collection form |
| /privacy | Clearly labelled draft describing future requirements, not a live approved policy |
| /terms | Clearly labelled preview notes, not finalized terms |
| /ui-preview | Public, unauthenticated shared-control gallery and minimal panel layout; no admin access |
| /prototype | Index of 37 fictional screen designs across seven areas |
| /prototype/[area]/[screen] | Enumerated applicant, privileged, company, recruitment and finance screen prototypes; unknown combinations return 404 |

Unknown job slugs and unknown routes return a custom 404 page. Card titles and View job links open details; Back to all sample jobs returns to the homepage collection with default filters. Navigation/footer links work across pages. Application panels explain the future method and now offer clearly labelled local-only sample walkthroughs or the fictional on-site application journey; no destination or collection service is connected.

## Task 2 shared UI foundation

Open /ui-preview on the local server. This is a developer/design review route, not an administration portal. The desktop sidebar and inline expandable mobile navigation point only to real gallery sections and the public website. No role switching, authentication simulation, protected data or live administration action is implemented.

Reusable components in web/components/ui/:

- Button: primary/secondary/danger variants, disabled and busy states, default type=button to avoid accidental submissions.
- TextField, SelectField and TextAreaField: labels, optional hints/errors and combined aria-describedby references.
- ValidationSummary: linked field errors and an alert/focus target; errors in the gallery are refreshed when Validate example is clicked.
- StatusBadge, Feedback and StatePanel: textual status variants; opt-in live announcements; manual feedback dismissal; loading/empty/error/forbidden illustrations.
- Dialog: native modal dialog with associated title/description, close control and controlled Escape handling. Native focus trapping/restoration still needs actual browser verification.
- DataTable: caption, scoped headers, empty content and a keyboard-focusable horizontal-scroll region; use at least one column.
- Pagination: previous/next controls and page announcement. Pass the clamped values returned by web/lib/ui.ts paginate so filtered/empty data stays consistent.

web/components/panel-shell/ contains only the shared layout. web/components/ui-preview.tsx demonstrates controls with current fictional fixtures. Example fields are deliberately outside a collecting form and have no network writes or persistent storage. Values and notifications stay in React memory; refreshing clears them. Do not enter real credentials, candidate details or CVs. The local validation helper is not a product validation contract.

No additional package or configuration is needed for this foundation. Task 3's real API/session client and later approved panel workflows remain separate.

## Frontend journey prototypes

Open `/prototype` for the full screen directory. The [screen and permission design](../design/frontend-prototypes.md) maps the 37 routes to Tasks 3–19. It covers early company/job/list authoring, applicant email sign-in/profile/application/tracking, staff MFA walkthroughs, remaining admin/recruiter/company screens and finance. The component gallery stays separate at `/ui-preview`.

Prototype tables support local search/pagination, sign-in pages show selectable read-only steps, notifications can be dismissed locally and the job editor previews sample title/description/method copy. No draft, session or operation is saved. Other job fields illustrate the future editor. Sensitive inputs and actions are disabled. All routes are public, fictional and noindex. Company/recruiter fixture projections illustrate known restrictions; they do not provide live authorisation. No real files or credentials may be entered. Financial amounts and invoice numbers are display examples, not live accounting or allocated identifiers.

Live API/session/CSRF integration (Task 3), protected operations, unresolved policies and final combined live QA (Task 20) remain pending. The production UI needs the B1–B4 services in the numbered roadmap. Prototype source coverage is tracked separately from live completion.

After a production build, start a separate loopback server in one terminal:

```powershell
npm.cmd run start -- --port 3100
```

In a second terminal at `web/`, run the read-only HTTP regression:

```powershell
npm.cmd run test:prototype-http
```

An optional `PROTOTYPE_BASE_URL` may select another port on `http://127.0.0.1`; other hosts, credentials and paths are rejected. This checks the 50 preview pages, internal link destinations, five expected 404s, noindex/fictional boundaries and company/recruiter/finance projections. It does not execute browser JavaScript or validate rendering, focus, responsive layouts or client interaction. No database is contacted.

## Manual browser checks

Review 375px, 768px and 1440px viewport widths on the homepage, a detail page and an information page. Check that the page has no horizontal overflow; long titles wrap; inputs have labels; keyboard focus is visible; sample notices remain readable. Exercise all filters, checkbox, sort, combinations, zero results, clear filters, location tiles, card/detail navigation, footer links and page anchors. Inspect the closed example and unknown-slug 404. Confirm sample application/report actions update only React-memory fixtures, no real file picker or credential fields are enabled, and no API request or delivery occurs.

Verification results and browser/tooling limitations are in tasks/specs/TASK-001-WEB-01-log.md and TASK-001-WEB-02-log.md, not assumed from this command list. WEB-01 has only partial mobile browser evidence; tablet/desktop checks remain unverified where automation is unavailable.

For /ui-preview also check mobile navigation, validation-summary field links, notice dismissal, table filtering/page changes, empty results, disabled/busy controls and modal open/close/Escape/focus restoration. TASK-001-FE-02-log.md records the Task 1 recheck and Task 2 evidence. Browser host unavailability does not count as passing these interaction checks.

## Database work

The separate Windows database setup remains described in [windows.md](windows.md). Its scripts are user-run only under TASK-001-03. The inherited PostgreSQL environment-settings review finding remains open; the website preview neither fixes nor executes that setup. No database installation or configuration is required to review this homepage.
