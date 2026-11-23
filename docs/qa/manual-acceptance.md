# Dalka-Jobs local QA checklist

Prepared 5 November 2026; extended 10 November for FE-06 job authoring and FE-07 managed lists. Scope: interactive frontend preview and implemented live source through FE-07. This is a test plan and blank evidence record, not a completed QA report or production approval.

## Choose the scope

| Track | Setup / reference | What can be accepted |
| --- | --- | --- |
| A — Frontend preview | [Website guide](../development/website.md); leave `DALKA_WEBSITE_MODE` unset | Fictional public, applicant, admin, recruiter, company and finance interactions in React memory. Refresh resets changes. No real authentication, uploads, delivery, accounting or access control. |
| B — Live source through FE-07 | [Owner-run setup guide](../development/live-first-five.md), [first-five contract](../api/first-five.md), [job authoring](../api/job-authoring.md), [managed lists](../api/managed-lists.md) | Public discovery, team MFA, super-admin companies/jobs and categories/locations. Database/key/bootstrap prerequisites are owner-run; schema3 required. Applicant/recruitment/finance services remain outside this track. |

`/prototype` and `/ui-preview` are public fictional reference routes in either track. Other frontend workspaces remain samples even when live mode is selected. Implemented live entry points are public discovery, `/admin/sign-in`, `/admin/companies`, `/admin/jobs`, `/admin/job-editor` and `/admin/lists`; a rendered admin shell does not prove authenticated access.

Use only fictional information in Track A. In Track B use owner-approved local test accounts and companies; do not enter real applicant data. Do not attach passwords, TOTP/setup secrets, recovery codes, cookie/CSRF values, `.env`, key files or unredacted network traces to QA evidence. Crop or redact authentication screenshots before saving them.

## Current evidence and blockers

These are historical reports, not results of this QA-document task. Re-run relevant checks against the actual checkout under test.

| Evidence | Recorded result | Remaining acceptance |
| --- | --- | --- |
| [Frontend execution log](../../tasks/specs/TASK-001-FRONTEND-COMPLETE-log.md), 5 November | 46 unit tests, lint, build, types, frontend and prototype HTTP checks passed | Hydrated workflows, 375/768/1440 layouts, keyboard/dialog focus and invoice print appearance unverified |
| [Frontend independent review](../../tasks/specs/TASK-001-FRONTEND-COMPLETE-review.md) | Reported source findings resolved | Overall BLOCKED by browser evidence |
| [Live execution log](../../tasks/specs/TASK-001-FE-01-05-LIVE-log.md), 4 November | Offline Go/frontend checks and synthetic live HTTP smoke passed; integration source compiled only | Real database setup/migrations/integration/recovery and live browser journeys unverified |
| Browser tooling | Prior attempts could not obtain supported browser access / verify Chrome's URL | Use supported browser access or record owner-performed manual evidence; do not bypass the tool refusal |

No browser, application or database tests were run to prepare this document. Initial current-run status is NOT RUN; prerequisite-dependent live cases are BLOCKED until setup evidence exists. Missing evidence prevents acceptance.

## Run record

Copy this block for each run and store it with the QA evidence. The Git commit alone is insufficient for this currently modified/untracked checkout: record the tested file snapshot or safe patch/artifact reference as well. Exclude secrets and ignored local credentials from snapshots.

```text
Run ID / tester / date and timezone:
Track: A preview / B live-first-five
Git branch / commit / tested snapshot reference:
Browser and version / OS / device / viewport widths:
Website origin / API port (live only):
Node/npm/Go versions actually used:
Prerequisite evidence / approved test data:
Case ID | viewport | PASS / FAIL / BLOCKED / NOT RUN / NOT APPLICABLE | evidence / defect ID
Command | working directory | exit code | sanitized output reference:
Open defects / blocked prerequisites:
Independent reviewer / review status:
Owner acceptance / date:
```

PASS requires the steps and expected result to be observed. FAIL means an observed mismatch. BLOCKED names the missing prerequisite. NOT RUN means unattempted. NOT APPLICABLE requires a scope reason. Record each viewport separately; one width cannot establish all three. HTTP/model checks cannot pass visual, interaction or accessibility cases.

## Setup and automated checks

Use the pinned installed toolchain and existing dependencies from the development guides. Do not upgrade or install tools merely to fill in the QA record. Record each exit code; stop dependent checks after prerequisite failure. Stop an owned Next process before rebuilding its `.next` output; use separate terminals for servers and checks. Do not stop or reconfigure unrelated listeners.

For Track A, from repository root in the server terminal:

```powershell
Remove-Item Env:DALKA_WEBSITE_MODE -ErrorAction SilentlyContinue
Set-Location web
npm.cmd run test:unit
npm.cmd run lint
npm.cmd run build
npm.cmd run typecheck
npm.cmd run start -- --port 3100
```

Open `http://127.0.0.1:3100`. In a second terminal, from `web/`, with live mode also unset:

```powershell
$env:PROTOTYPE_BASE_URL = 'http://127.0.0.1:3100'
npm.cmd run test:frontend-http
npm.cmd run test:prototype-http
```

These HTTP scripts request rendered pages, destinations, 404s and sample boundaries; they do not exercise browser JavaScript. If a process was already running, verify its mode and tested snapshot before reusing it. See `web/package.json` for authoritative scripts.

Track B requires the owner's [setup, diagnostics, key, migration and bootstrap procedure](../development/live-first-five.md). Do not execute those operations as part of this document task. For an authorized manual live run, use the same `DALKA_WEB_ORIGIN` and `DALKA_API_PORT` in both server terminals, an absolute `DALKA_KEY_FILE` in the API terminal, and `DALKA_WEBSITE_MODE=live` in the website terminal. The guide uses `http://127.0.0.1:3000` and API port `8081`; keep the strict provisioning `.env` format unchanged. Track A sample credentials cannot authenticate in Track B.

The live guide defines three distinct checks:

| Check / working directory | Commands / prerequisites | Evidence limit |
| --- | --- | --- |
| Offline Go / `api/` | Set workspace `GOCACHE` as in the guide; `go test ./...`, `go vet ./...`, `go test -tags=integration -run '^$' ./internal/httpapi` | Last command compiles without executing integration. Windows ACL tests require supported current-user SID access; never weaken the check. |
| Synthetic proxy contract / `web/` | Live Next production server on 3101 with matching origin; `DALKA_API_PORT=8081` in Next and test terminals; Go stopped and API port free; `npm.cmd run test:live-http` | Script temporarily owns a synthetic upstream. No PostgreSQL or real login/persistence evidence. Do not run against the active real Go API. |
| Owner-only integration / `api/` | Follow the guide's `migrate up check`, explicit `DALKA_INTEGRATION=dalka_jobs_check`, integration test and environment cleanup sequence | Writes/deletes synthetic fixtures in the empty migrated check database. Never target development. Confirm `TestFirstFiveDatabaseIntegration` actually ran rather than skipped. No destructive recovery certification. |

Never run down/drop/force/reset commands to unblock QA. Interrupted integration leftovers must be preserved for inspection. Destructive migration recovery needs a separately authorized disposable procedure and remains BLOCKED until that evidence is supplied. Do not use account-factor reset as routine QA; it requires an authorized operator and independent owner verification under the setup guide.

## Track A — frontend browser cases

Keep one browser session for connected sample journeys and use internal navigation so React-memory changes survive. Reload only when a case calls for reset. All rows below start NOT RUN.

| ID | Steps | Expected result |
| --- | --- | --- |
| A-01 Navigation and scope | Open `/`, `/admin`, `/account`, company/recruiter workspaces, `/prototype` and `/ui-preview`; follow sidebar, header and footer links. | Appropriate sample notices; internal destinations work; password/file controls remain disabled; sample flows make no `/api/v1` requests or external submissions. |
| A-02 Search | On `/`, test keyword, location, category, employer/job type, closing-soon and sort; combine filters, produce zero matches, clear, paginate and select a location tile. | Results/counts/ordering reflect selected controls and the labelled sample date; empty state explains recovery; filter changes keep pagination valid; Search jobs moves focus to results. |
| A-03 Details and missing routes | Follow a job card and related job; open `/jobs/logistics-assistant-sahan`; request an unknown job and `/admin/unknown`. | Matching details and method explanation; closed state has no active application; unknown URLs return branded 404 with HTTP 404. Sample data emits no JobPosting markup; pages remain noindex. |
| A-04 Companies and jobs | Create/edit a fictional company; search it; create a draft job, preview, publish and archive it; navigate back to public search and associations. Attempt linked-job reassignment. | Connected sample records update coherently; drafts stay out of public search; archived job leaves active results; linked reassignment is refused with explanation. Reload restores original fixtures. |
| A-05 Applicant | In `/account/profile`, submit invalid sample contact values, then valid reserved sample values; attach built-in sample CV. Use `/account/apply?job=sample-04`; test missing profile/CV/acknowledgement, valid submit and repeat submit. | Field feedback identifies missing/invalid data; only built-in fictional CV is used; one sample application appears in tracker/detail; duplicates are refused; nothing is uploaded or delivered. |
| A-06 Recruitment and notifications | In `/admin/recruitment` and a candidate detail, filter, change stage/interview, add a fictional private note and adjust sharing. Navigate to applicant tracking/notifications; mark a notice read. | Stage/interview updates reach the matching sample application and notifications; ineligible sharing clears; unread counts update; private notes stay out of applicant/company views. |
| A-07 Role projections | Compare `/workspace/recruiter/candidates`, company candidates/progress/rejected and admin candidates; follow each workspace's available actions. | Recruiter sees assigned-job samples. Company sees only its permitted projection: candidates B/C/D, no A/E/F initially, no contacts/CVs/private notes. These are fixture checks, not real authorization or tenant-isolation acceptance. |
| A-08 Management and trust | Exercise users/assignments, lists, trust, reports, content and settings. Rename a referenced location; revoke sample recruitment authority; retry the affected on-site application. | Forms validate; references remain consistent; saved name/about/contact copy appears publicly; report state changes locally; revoked authority blocks the sample application with an explanation. |
| A-09 Finance | Create/edit draft invoice; mark sent; attempt content edit; record partial payment, then an invalid overpayment; inspect summary and cancellation feedback. | Draft remains editable; sent content locks; invalid amount is rejected; balances remain coherent with integer-cent arithmetic; USD/EUR totals remain separate. No real invoice numbering, sending or payment occurs. |
| A-10 Print | Print a sample invoice at browser print preview; inspect all pages and save a local PDF if needed for QA. | Labelled sample invoice, legible amounts/currency, no clipped rows or distracting navigation; no claim of real accounting validity. Store only fictional evidence. |
| A-11 Reset | Edit an unsaved form and sample records; use reset; then modify again and reload. | Reset clears saved sample changes and mounted unsaved drafts; reload restores initial fixtures; no sample state is persisted in browser storage. |
| A-12 Public actions | Exercise application-method walkthroughs and a local job report; inspect resulting feedback and network activity. | Clear local-only result; no email/WhatsApp/website delivery or accepted real application is claimed. |

## Shared browser and accessibility checks

Run these on Track A's homepage, detail, applicant form, admin table/editor, candidate and invoice pages; repeat on Track B's live search, sign-in and company list/editor. Track B has no applicant/finance service to accept. Start NOT RUN for each applicable page and width.

| ID | Steps | Expected result |
| --- | --- | --- |
| S-01 Responsive | At viewport widths 375, 768 and 1440 CSS pixels, inspect long titles/labels, notices, tables, forms, empty/error states and mobile navigation. | No page-level horizontal overflow or hidden actions; copy wraps; table scroll region is usable; controls and status text remain readable. |
| S-02 Keyboard | Use Tab/Shift+Tab, Enter, Space and Escape across navigation, search, forms, pagination and dialogs. | Visible logical focus; every action usable without pointer; mobile menu works; dialog traps focus, Escape closes where allowed, and focus returns to its trigger. No keyboard trap elsewhere. |
| S-03 Validation and status | Submit invalid forms; follow validation-summary links; inspect field labels/hints/errors and loading, empty, error, forbidden and success states. | Errors identify fields without losing entered nonsecret data; summary links focus fields; status is understandable without color alone; busy/disabled actions prevent duplicate submission. |
| S-04 Accessibility and zoom | Check accessible names/roles and announcements with a screen reader; inspect headings/landmarks, contrast and 200% browser zoom. | Inputs/buttons have meaningful names; errors/status changes are announced; content order is usable and zoom keeps essential content/actions available. Record tools and observations; no accessibility certification inferred from source. |
| S-05 Runtime and performance | Reload representative pages with the browser console/network panel open; record browser/load conditions and observed timings. Repeat navigation and submit actions. | No uncaught errors, failed required local assets or permanently stuck loading states. Record measurements and regressions; no numerical performance budget is established by this checklist. |

## Track B — live acceptance cases

Initial status for all B cases: BLOCKED pending owner-run setup and test-account evidence. Once prerequisites are satisfied, mark NOT RUN until attempted. Use only the implemented live entry points. Start from a fresh anonymous browser session; keep account credentials and all MFA evidence private. Limit invalid attempts to avoid account/peer rate limits affecting unrelated cases.

| ID | Steps / prerequisites | Expected result |
| --- | --- | --- |
| B-01 Startup | Owner completes documented checks, additive migration/version, key and first-owner bootstrap; starts Go and live Next with matching origin/port. | API starts only with valid key/configuration and clean expected schema; site reaches the intended API. Record sanitized outcomes, not `.env`, secret paths/content or passwords. Missing/dirty schema is a blocker, never a reason to force migration state. |
| B-02 Empty/offline public | With no jobs authored, open `/` and unknown detail; temporarily stop only the QA-owned Go process and retry; restart it. | Empty live list is valid; unknown detail returns 404 when API is available. Offline/error states are distinguishable from empty; no fictional fallback. Canonical lists come from the API; local site remains noindex with no JobPosting markup. |
| B-03 Persisted jobs / FE-06 | Requires schema 3, full-MFA super-admin access and an owner-approved local test company. At `/admin/jobs` create a draft with external apply method, save, follow its saved editor URL and reload; inspect preview; edit/publish/archive and check public list/detail. Try stale saves from two tabs, wrong-kind/missing references, on-site publishing and past/equal deadlines. Change browser timezone and verify UTC+3 entry is consistent. | Drafts are private; saved fields persist across reload; new record keeps its ID when reloading after an error; company retry preserves unrelated form edits. Only published/unexpired jobs appear; deadline equality is expired; invalid destinations/on-site publication fail; stale save is 409 and requires review; company association and public slug stay fixed. Saved preview escapes descriptions and has no application action. Without approved local test records/setup, browser coverage is BLOCKED. Check-database integration uses a temporary server and cleans fixtures; it does not seed normal development for browser QA. |
| B-04 Password and enrollment | At `/admin/sign-in`, try one invalid credential; use owner-provided test account correctly; attempt protected data before MFA; enroll authenticator and confirm its code. | Generic credential failure; password-only session cannot access companies; successful enrollment establishes full session and displays ten recovery codes once. Keep setup key/codes private and outside evidence. |
| B-05 MFA challenge | Log out; password-sign-in to enrolled account; try an invalid code, then valid fresh code. Under approved test conditions, test replay and expired pending state. | Invalid/replayed code grants no full session; valid unused code succeeds; expired state refreshes safely without trapping enrollment/login. RFC/time-boundary cases may use offline/integration evidence; do not change system time. |
| B-06 Logout and session | Log out from full session; revisit company data; in approved test conditions check expired/revoked states. | Prior session no longer authorizes protected requests; anonymous UI remains usable; stale logout recovers. Full-session absolute/idle limits and revocation require actual observed or controlled-test evidence, not merely closing a tab. |
| B-07 Recovery | With a dedicated test account, sign in by password then consume one saved recovery code; try protected access and reusing the code; complete new authenticator enrollment. | Recovery grants enrollment-required state only; previous sessions/codes are revoked; consumed code cannot be reused; protected access resumes only after fresh enrollment. Store the new codes privately. Operator factor reset is outside this routine case. |
| B-08 Company persistence | Full-MFA super admin creates a uniquely named QA company; edits name/type; searches and reloads detail/list; inspects associations. | Valid values persist across reload; name/type validation matches contract; associations belong to selected company and may be empty. Record IDs only as needed. No company deletion endpoint exists: use an approved test environment and retain records rather than inventing cleanup SQL. |
| B-09 Duplicates and conflicts | Try a case-insensitive duplicate and invalid names/types; edit the same company in two tabs loaded at the same version; save each in turn. | Duplicate/stale update returns 409 without overwriting the saved record; invalid fields are rejected; UI explains recovery. If browser cannot reproduce a stale version, retain BLOCKED and record controlled API/integration evidence separately. |
| B-10 Authorization | With separately owner-provisioned recruiter/company-admin accounts, enroll MFA and request company reads/writes directly; repeat with anonymous/pending/revoked sessions and altered IDs/client role headers in controlled tests. | Company API denies non-super-admin authority even when UI is bypassed; client headers/IDs cannot elevate access. Later sample workspaces do not establish live role/tenant isolation. Record status codes without credential headers. |
| B-11 Transport and abuse | Use offline, synthetic and owner-run integration coverage for wrong Origin/CSRF, malformed/oversized JSON, unknown/repeated filters, cookie allowlists, rate limits and concurrency; note uncovered cases. | Requests fail closed with contract errors; responses do not disclose internal/credential details; only intended session cookie crosses proxy. Never copy full requests/tokens into QA artifacts or flood shared local accounts to test limits. |
| B-12 Database and recovery gates | Owner runs documented check-database integration, verifies actual execution/cleanup and supplies separately authorized migration-recovery evidence if required for acceptance. | Correct disposable DB only; no leftover fixtures or hidden skips; cleanup failure remains FAIL/BLOCKED pending investigation. Integration does not certify down-migration recovery; that gate remains BLOCKED without its separate evidence. |
| B-13 Managed lists / FE-07 | With schema3 and full-MFA super admin, search/filter/page `/admin/lists`; create a unique category/location; reload/rename it and inspect public filters; deactivate unused entry, confirm absent from public filters/job choices, then reactivate. Reference it from a draft and attempt deactivation; rename and inspect saved/public job labels. Try duplicate case variants, invalid inputs, stale two-tab edits, forged kind, non-super/pending/revoked access and retry directory after unsaved form edits. Use controlled API integration evidence for authoring/deactivation race. | Stable ID/kind, persisted labels/state, per-kind case-insensitive duplicates refused, stale409 requires reload, linked-job count includes all statuses. Inactive values cannot receive job references; referenced deactivation conflicts and never hides/reassigns existing jobs. Directory retries preserve draft fields. No delete/merge. Missing browser or owner-run database prerequisites remain BLOCKED. |

## Defects, review and sign-off

Copy one record per defect:

```text
Defect ID / case ID / track / run ID:
Severity: BLOCKER / CRITICAL / MAJOR / MINOR / INFO
Route or file:line / browser / viewport / tested snapshot:
Prerequisites and minimal reproduction steps:
Expected result:
Actual result and sanitized evidence:
Impact / recommended fix:
Owner / status / fix snapshot / retest result:
```

Use BLOCKER for a missing essential prerequisite or inability to complete acceptance; CRITICAL for demonstrated severe security/data loss; MAJOR for a broken core journey; MINOR for limited functional/layout issues; INFO for observations. Do not invent findings for unexecuted checks.

Before accepting a track:

- Record every applicable case result with evidence and explicit reasons for exclusions/blocks. Resolve defects and retest affected behavior.
- Attach command results for the tested snapshot, including new/untracked files. Preserve historical logs; do not promote their results into a new run.
- Have an independent reviewer assess the specification, actual files, findings and verification evidence. Self-review cannot approve the track. Review status is APPROVED, CHANGES REQUIRED or BLOCKED.
- Obtain owner acceptance separately. Frontend sample acceptance does not accept live services; first-five acceptance does not accept the later roadmap or production launch.

Initial sign-off: both tracks UNACCEPTED. Browser evidence is missing; live database/migration/recovery evidence is also missing. Final owner approval and any commit/push/deployment/merge remain PENDING and require explicit authorization. This checklist authorizes no release operation.
