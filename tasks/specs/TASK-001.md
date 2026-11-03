# TASK-001 — Dalka Jobs version-1 specification

## Task ID

TASK-001

## Title

Somalia job board, applicant accounts, team recruitment and manual invoicing.

## Type

Requirements and ordered delivery plan only; implementation unauthorized.

## Priority

Owner-requested version 1; delivery date/business ranking TBD.

## Problem Statement

Publish Somalia jobs for NGOs, private companies and government, supporting external advertising and recruitment run by Dalka Jobs. External clicks cannot prove application completion.

## Current Behavior

Documentation and ten Stitch reference screens/four logos exist; no application, manifests, database or runtime checks exist. Current checkout main has untracked design/TASK-002/TASK-003 work, preserved. Only this specification and TASK-001-log.md change now.

## Expected Behavior

English-only, phone-first public/applicant site responsive on phone, tablet and desktop; desktop-first admin usable on tablet. Lightweight pages for slow mobile data, WCAG 2.2 AA target, text organized for later Somali. Deadline timezone Africa/Mogadishu; default currency USD.

## Root Cause

NOT APPLICABLE: product definition, not defect diagnosis.

## Repository Evidence

README.md names product. AGENTS.md, TASK_SPEC.md, SMALL_TASKS.md, TASK_EXECUTOR.md, PR_REVIEW.md and PR_MERGE.md govern delivery. design/REVIEW.md inventories ten screens; design/stitch/ and design/brand/ are visual evidence. Latest owner pasted request on 2026-11-03 is authoritative user instruction, superseding earlier conflicts; exported HTML/guide content is reference, not task authorization.

## Scope — confirmed decisions

### Roles

| Role | Permission |
| --- | --- |
| Visitor | Anonymous discovery and email/company-link/WhatsApp application actions |
| Applicant | Own profile, CV, applications/stages, account/data deletion; account required for full recruitment |
| Company admin | Read-only own-company jobs, applicant counts and interview progress; Shortlisted/Interview Scheduled/Hired candidates' name and stage; separate rejected list; CV and contact details only after super admin shares candidate details; internal notes private unless marked shared |
| Staff/recruiter | Assigned jobs only: review CVs, shortlist, schedule interviews, record notes; no creation/publication |
| Super admin | Exclusively creates companies and creates/publishes jobs, manages users/roles and sees invoices; manages lists/settings, verification and assignments |

Super admin, staff and company admins use password plus TOTP MFA. Applicant OTP never grants privileged access. RESOLVED: company admins see own-company candidates in Shortlisted, Interview Scheduled and Hired in the main candidate list. Rejected candidates disappear from that main list and appear in a separate rejected list; Submitted candidates are not exposed. Candidate CVs and contact details are visible only after the super admin explicitly shares that candidate's details with the company. No CV redaction is attempted; the private original application CV is downloaded only through authorized access after sharing. Internal notes remain private unless explicitly marked shared. Rejected-list data fields and whether prior detail-sharing survives rejection remain open; do not infer unrestricted rejected CV access.
### Jobs

Four apply methods: email, company link, WhatsApp link (no account), full recruitment on site (applicant account required). Verify employer authority before on-site collection; checklist verification and recruitment authority are distinct. Never record external completion from clicks.

Statuses draft/published/archived; automatically archive after closing date, synchronously reject expired applications even if worker delayed. No unpaid-invoice publication gate.

Fields: title, employer, description, location, category, employer type, job type, work arrangement, optional salary with currency, closing date, apply method details. Public filters: keyword, location, category, employer type, job type, closing soon. Default sort newest; clean job URLs and Google job structured data on job pages.

Super admin edits managed categories/locations. Exact initial categories: Health and Medicine; Education and Training; ICT and Technology; Finance and Accounting; Administration and Office; Engineering and Construction; NGO Humanitarian and Development; Legal and Governance; Logistics and Transport; Hospitality and Tourism; Sales Marketing and Media; Agriculture and Environment; Security; Other.

Exact initial locations: Mogadishu; Hargeisa; Garowe; Kismayo; Baidoa; Beledweyne; Galkayo; Bosaso; Berbera; Burao; Jowhara; Remote; Other.

### Applicant identity and CVs

RESOLVED: production applicant sign-in is email only. Phone codes work in development; phone sign-in stays off in production until the owner chooses an SMS provider and authorizes enabling it. Email and phone channels retain independent settings with production phone hard-disabled for version 1. Sender interface, development adapter printing codes in API terminal; real providers added later via configuration. Terminal codes are an explicit development-only exception to secret-log prohibition; never return codes through API or enable terminal delivery in production.

RESOLVED: profile requires name and either email or phone (both allowed). CV formats are PDF and .docx only; maximum 5 MB, exactly 5,242,880 bytes, type checked by content; legacy .doc excluded. Store privately, never a public address; runtime uploads git-ignored. Each application receives an immutable submitted CV copy/snapshot, not a live reference to a replaceable profile CV. Authorize every download. Applicant sees own applications/stages and can delete own account/data. Production login still requires a verified email identity; phone-only profile eligibility does not enable production phone sign-in. Whether a CV is mandatory for profile completion versus application submission remains open.

### Recruitment and notifications

Dalka Jobs team runs stages Submitted, Shortlisted, Interview Scheduled, Hired, Rejected; interview dates and internal notes. Every stage change, note and CV download records actor/time. Do not duplicate note/CV contents into audit metadata.

In-site status updates plus email: applicant confirmation, stage changes and interview scheduling. Staff alerted for new applications on assigned jobs. SMS notifications later. Use transactional outbox/retry/deduplication; decide staff-alert channel and rescheduling semantics.

### Trust/privacy

Super-admin verified badge with checklist on company record; report-this-job and reports queue; editable warning on every job page. Code/application rate limits, wrong-code lockout, hidden trap field in forms.

Consent before collecting details. RESOLVED: account deletion removes profile and profile CV immediately; application, interview and application CV copies are deleted six months after submission. Audit logs keep only IDs and times, no names/contact details/note bodies or CV contents. Backups expire within 35 days. Invoices remain separate and contain no applicant data. Application snapshots are distinct from the immediately deleted profile CV; access is revoked on account deletion, with active-case processing policy still to define. Restores must reapply deletions rather than reactivate deleted accounts/files. Privacy policy, terms, about and contact pages required. Earlier generic account-and-all-data deletion wording is superseded by these distinct timelines.

### Money

No online payments. Super admin creates company invoices linked to jobs: automatic invoice number, line items, amount, currency, issue/due dates, payment instructions from settings. RESOLVED: numbers follow DJ-YYYY-0001 in sequence and are never reused; annual reset/allocation timing remain to specify. One currency per invoice, USD default. Sent invoices are locked; cancel and reissue to change financial/content fields (status/payment recording remains possible). No automatic tax calculation in version 1; allow a manual line. Partial payments supported; payments stored separately. Revenue billed/paid/unpaid totals are per currency. PDF download and manual sending. Statuses Draft, Sent, Paid, Cancelled; Overdue derived automatically. Price list advert/recruitment fees with company/job overrides. Exact arithmetic, snapshots, override precedence and remaining payment rules need specification. Invoices contain no applicant data.

### Design

Ten Stitch screens (home/detail/sign-in/profile/applications, each phone/desktop) and brand assets guide public/applicant UI. Rebuild components; do not copy exported HTML wholesale. Brand/guide colors/fonts override screen styling. RESOLVED: canonical brand primary color is #5850EC, superseding the conflicting #3e32d3 guide value for the primary token. Original reference files remain unchanged. Remove saved jobs, unsupported trust claims/statistics and employer promotion unless requested. Region tiles derive from managed locations. Add loading/empty/error/closed states. Exception to the earlier admin ordering: a small super-admin companies/jobs/managed-lists UI and API task 001-11a immediately follows 001-11, enabling real job entry early. Include its minimal desktop/tablet design and privileged password/TOTP sign-in UI, reusing completed auth APIs. Remaining admin design/UI stays later. No real applicant intake before privacy/security lifecycle protections; early job entry is not launch authorization.

## Earlier TBDs resolved / superseded

| Earlier uncertainty | Latest resolution |
| --- | --- |
| Country/language | RESOLVED Somalia/English; Somali later; legal jurisdiction remains open |
| Roles/portals/login requirement | RESOLVED five roles above, anonymous external apply, account for full recruitment; provisioning/memberships remain open |
| Employer access | RESOLVED own-company main list: Shortlisted, Interview Scheduled, Hired; Rejected in separate list, Submitted hidden. CV/contact only after super admin shares candidate details; no CV redaction. Rejected-list projection/sharing lifecycle remain open |
| Staff posting | RESOLVED prohibited; super admin alone creates/publishes |
| Authentication | RESOLVED production email only, development phone codes, production phone off until owner selects SMS provider; privileged roles password+TOTP; recovery details open |
| No CV, optional phone baseline | SUPERSEDED private PDF/.docx CV copies, max 5,242,880 bytes; profile name plus email or phone required |
| Interview stages/notes/assignment | RESOLVED five stages, dates, assigned staff, actor/time audit; transitions/sharing rules open |
| Acknowledgement/status/notifications | RESOLVED own application/stage access, in-site/email and staff alerts; duplicates/withdrawal and delivery details open |
| Account deletion | RESOLVED immediate profile/profile-CV removal; submitted records/copies follow six-month deadline; verification/active-case behavior open |
| Applicant export | RESOLVED excluded; invoice PDFs are separate |
| Retention anchor | RESOLVED six months after submission; audits IDs/times only, backups max 35 days, invoices separate/no applicant data; calendar boundaries/audit lifetime open |
| Salary/deadlines | RESOLVED USD default/explicit currency and Africa/Mogadishu; range/precision/exact cutoff open |
| Destinations/lifecycle/filter/sort | RESOLVED four apply methods, automatic archive, filters/newest; closing-soon threshold open |
| Branding | RESOLVED primary #5850EC; overrides conflicting primary token in guide; other token/font checks remain |
| API version | RESOLVED /api/v1; payload/error/pagination contracts open |
| Invoicing | RESOLVED DJ-YYYY-0001 sequence/no reuse, single currency/USD default, Sent lock/cancel-reissue, manual tax line only, partial payments, per-currency revenue; remaining arithmetic/payment details open |
| Hosting | DEFERRED owner research, not authorized here |

## Out of Scope

Current work: implementation, scaffolding, installs, commits, pushes, merge/deploy, hosting research. Version 1: online payments, production SMS, Somali, mobile app/token auth, saved jobs/job alerts, company posting, staff draft posting, applicant exports. WhatsApp links do not approve WhatsApp authentication/notifications. Bulk imports, recommendations, subscriptions, calendar integrations and click analytics are not requested. No inferred external application tracking.

## Affected Components

Public/applicant website, company read portal, staff workspace, super-admin management/billing, API/auth/authorization, database, private files, notifications/audit/retention.

## Implementation Approach / Architecture

web/: Next.js/TypeScript/Tailwind renders website, navigation and presentation. api/: Go net/http/chi, PostgreSQL/pgx/sqlc/golang-migrate; versioned /api/v1 with reusable domain/business rules and no website rendering/page routing; future mobile client ready, cookie sessions now, tokens later. Exact versions unresolved/uninstalled; justify dependencies and pin during tooling task. Fixed-width zero-padded migrations; sqlc schema/query consistency and disposable-data recovery checks.

Prefer same-origin /api/v1 proxy, exact routing/cookie policy to specify without choosing hosting. Go opaque hashed-token sessions, Secure/HttpOnly cookies, explicit SameSite/expiry/rotation/revocation and CSRF. Next.js neither owns duplicate auth nor directly accesses database; forward only intended credentials to trusted API and avoid private shared caching. CORS is not CSRF.

Privileged passwords hashed; TOTP encrypted with separately managed keys, replay/rate limits and hashed one-use recovery codes; pre-MFA sessions cannot use privileged operations. OTP hashed/single-use/short-lived, identity/purpose-bound with resend/attempt limits. Define provisioning/bootstrap/recovery/linking first.

Private storage interface with content/size validation, bounded processing, authorized/audited downloads and independent application snapshots. Define malware/quarantine/encryption/backup and file/database consistency before intake. Archive/deletion workers idempotent with synchronous expiry checks; scheduler provider unselected. Domain transactions cover application+snapshot, stage+audit+notification outbox, invoice numbering/payment and deletion consistency. Pagination, constrained payloads/scripts, optimized assets and measurable mobile budgets. Structured data from authoritative published jobs; verify current official eligibility guidance during implementation.

## Data Model

Users/verified identities/roles/company memberships, password credentials, hashed sessions/OTP, encrypted TOTP/recovery metadata; companies/checklists/authority, staff assignments, managed locations/categories, jobs/status/method/closing time. Applicant profiles/private CV references; applications link authenticated applicant/job, immutable CV/contact snapshot, consent version/time, stage/submission/deletion deadline; interviews/notes/explicit sharing and minimal actor/time audits. Reports/settings/policy versions, abuse state and notification outbox/delivery/in-site records. Price lists/overrides, invoices with unique numbers and immutable line/currency/instruction snapshots, separate payments/allocations. Constraints/transactions/scoped queries mandatory; schema not created now.

## Expected Files

Only tasks/specs/TASK-001.md and TASK-001-log.md now. Future web/, api/, docs/ and test paths in task table are proposed scopes; each concrete spec approves exact files before changes. Private runtime uploads outside source assets and git-ignored.

## Database Impact

None now; future entities/migrations/constraints/scoping/retention and file references. Define compatible migrations and recovery on disposable data. Applicant deletion must not corrupt financial records or leak retained personal data through audit/finance.

## API Impact

None now; future /api/v1 public listings and protected applicant/auth/CV/intake/tracker/deletion, privileged MFA/recruitment, scoped company reads and super-admin management/reports/settings/invoices/payment-record contracts. No future tokens implemented now.

## Security Impact

Deny-by-default Go authorization, role/company/job scoping, privileged MFA, secure recovery/sessions/CSRF, input validation/safe job rendering, safe email/URL/WhatsApp destinations without arbitrary server fetching. Private content-checked CV access, abuse protection, consent/deletion and minimal logs. Development terminal codes are the only explicit secret-log exception. Financial integrity/PDF checks required. Legal wording/incident ownership remains open.

## Tenant Impact

APPLICABLE and RESOLVED at high level: applicant own-only, staff assigned-jobs-only, company read-only own-company, super admin global powers. Test forged identifiers, alternate download/list endpoints, revoked assignment/membership and cache leakage. Main-list stages and super-admin-gated CV/contact sharing are resolved; separate rejected-list projection, sharing revocation and multi-membership remain gated. Enforce the same sharing check on direct CV endpoints; no redaction pipeline.

## Edge Cases

Late submit/archive race; mode/authority changes; retries/duplicates; revoked role/assignment; hostile/spoofed/oversized CV; snapshot after profile replacement; account deletion during recruitment or queued email; shared files with different expiry; both OTP channels disabled; identity collision/reassigned phone; cancelled/partial invoices, mixed currencies and numbering concurrency; referenced list deletion; month-end retention; deleted records reappearing from backups.

## Test Plan

Current revision: repository-root git diff --check, git diff, git status --short; inspect untracked scope separately, requirement mappings/table dependencies, independent review. No application commands available or passed.

Future tooling establishes backend/domain/database tests, migration recovery/sqlc consistency, frontend build/types and browser/accessibility/performance tests. Cover five-role/company/assignment boundaries, OTP and MFA bypass/replay/recovery/rate limits, cookies/CSRF/private caching, four apply modes, content/size/private CV/download audit/snapshots, expiry races, stage/audit/outbox atomicity, email retries, deletion/retention/copy/backup rules, invoice/payment/number/currency integrity and unpaid-job publishing. Phone/tablet/desktop and keyboard checks; disposable data only.

## Acceptance Criteria

Documentation: latest decisions and every resolved earlier TBD marked, conflicts/open gates explicit, ordered small tasks, only two task documents edited, no implementation/release.
Future product (not authorization): exact managed lists, requested filters/newest, responsive light English public pages/clean URLs/valid structured data; super-only creation/publication with no unpaid gate; expired jobs archived and late applications denied; anonymous external methods without completion claims; authenticated/consented authorized full recruitment; secure configurable OTP and password+TOTP privileged auth; private content/size-validated CV snapshots and audited downloads; own/assigned/company-scoped views and hidden notes; five stages and required email/in-site alerts; six-month submission-based deletion and account deletion; checklist/report/warning/info pages; removed excluded design content; correct super-only manual invoices/PDF/overdue/separate payments/revenue by currency; missing states designed, required security/build/browser checks and independent review passed before separately authorized release.

Latest measurable acceptance additions: production phone login is rejected regardless of a client toggle; development phone codes work. PDF/.docx at or below 5,242,880 bytes accepted only after content validation; .doc and larger files rejected. Profile validates name and at least one contact channel. Company main-list endpoints expose only own-company Shortlisted/Interview Scheduled/Hired candidates; Rejected moves to a separate list, Submitted remains hidden. CV/contact endpoints reject access before super-admin detail sharing and permit authorized shared access without redaction; notes require a shared marker. Brand primary resolves to #5850EC. Deletion immediately removes profile/profile CV while application snapshots follow submission-based expiry; audits contain only IDs/times, backups never exceed 35 days and invoices contain no applicant data. Invoice numbers are unique/non-reused DJ-YYYY-0001 sequences; Sent content cannot be edited, cancellation/reissue preserves history; partial payments and per-currency billed/paid/unpaid are tested, with no automatic tax. Test early 001-11a authoring against the public listing before later admin scope.

## Conflicts, Risks and Missing Decisions

Resolved decisions above are no longer TBD. Remaining gates:
1. Brand primary #5850EC is RESOLVED. Other conflicting guide tokens and font delivery/license checks remain open; primary choice is no longer a gate.
2. Main-list stages and CV/contact sharing are RESOLVED: Shortlisted/Interview Scheduled/Hired, separate Rejected list, super-admin sharing before any company CV/contact access, no redaction. Still define rejected-list fields, whether sharing survives rejection, sharing revocation and who may mark notes shared; do not expand rejected CV access by inference.
3. Deletion: exact calendar-month/end-of-month cutoff, account-deletion verification, active application handling, audit ID/time retention duration, backup restore deletion enforcement and queued-message cleanup. Profile/profile CV immediate removal, application copies six months and backup maximum 35 days are resolved. Invoices retain no applicant data; finance retention period still open.
4. Identity/security: required CV timing, verified-email production identity versus phone-only profile updates, contact linking/reassigned phones, memberships/role combinations, provisioning/invites/bootstrap, password/TOTP recovery/key custody, session/OTP lifetimes and abuse thresholds. Choose production email provider/configuration later; production phone remains off.
5. Recruitment: duplicates/reapply/withdrawal, permitted stage transitions, note edit/delete, interview timezone/reschedule/cancel semantics and staff-alert channel. Define authority evidence/revocation and assignment administration before full recruitment.
6. Files: content validation details, malware/quarantine/encryption/storage and consistency/recovery; formats and maximum bytes are resolved.
7. Finance: invoice sequence annual-reset/allocation timing/overflow, exact prices and override precedence, precision/rounding, partial-payment allocation/reconciliation, refunds/overpayments, cancellation with payments, invoice/job cardinality, due cutoff and cancelled invoice totals. No reuse, Sent lock, per-invoice currency, partial payments, no automatic tax and per-currency totals are resolved.
8. Public/trust: closing-soon threshold, salary range/precision, date-only cutoff, slug/redirects, list deactivation, newest tie-break, performance budgets, policy/contact text, checklist/report ownership/warning overrides. Legal jurisdiction, policy wording and incident owner still need review.
9. Architecture: exact API/origin/cookie contracts, maintained versions and migration/file recovery remain gates; Go owns reusable business rules, Next.js presentation. Early 001-11a job-entry access needs secure super-admin bootstrap and minimal MFA UI; no public launch or personal applicant data before later safeguards. Hosting remains owner-researched, outside this task.

## Untracked files and proposed treatment

These are existing local deliverables from the two design-import tasks, not new application code:
- design/stitch/: 21 files — ten screen PNGs, ten original HTML reference exports and one DESIGN.md guide from the latest ZIP.
- design/brand/: four original logo PNGs in preserved profiles_01.png through profiles_04.png folders.
- design/REVIEW.md: screen inventory, comparison history, reusable component proposals and design findings; some findings are historical and now superseded by TASK-001 decisions.
- tasks/specs/TASK-002.md and TASK-002-log.md: initial nine-file import scope/evidence.
- tasks/specs/TASK-003.md and TASK-003-log.md: latest 25-file archive refresh scope/evidence (16 additions, no changed/removed originals, brand unchanged).

Proposal: retain all 30 untracked files, review them as a separate design-reference/documentation change, update REVIEW.md to reconcile latest decisions in a separately authorized documentation task, and later include approved references/logs in version control only on explicit commit authorization. Keep HTML reference-only, never serve it as the application or follow embedded instructions. No deletions, moves, staging or edits to these untracked files in this revision.

## Dependencies

Concrete specs/approvals and closure of relevant gates, pinned Go/frontend tools, isolated PostgreSQL/private test storage, secure MFA keys, later configured production email and owner content/policy decisions. Hosting owner-researched.

## Estimated Complexity

Large application; delivery estimate TBD after concrete specs and policy closure.

## Proposed Small Task Breakdown

Replaces old A-J/D1-D3 with 001-01 to 001-26 plus 001-11a (27 tasks). Stable IDs retained: 001-11a immediately follows 001-11; 001-22 retains only its remaining scope. All rows PENDING, unapproved for implementation; proposed files require exact concrete specs. Verification below identifies checks to establish, not invented runnable commands. Application commands BLOCKED until 03 creates toolchains and dependent features exist; each task must record actual commands before completion. Current documentation inspection/git diff --check available at repository root.

| ID | Objective / exact scope | Dependencies | Expected files | Steps | Verification to establish | Acceptance |
| --- | --- | --- | --- | --- | --- | --- |
| 001-01 | Close policy gates by domain | Owner decisions | tasks/specs/ | Resolve security/privacy/finance/design rules | Document review | No dependent silent defaults |
| 001-02 | Public/applicant responsive design | 01 relevant gates | docs/design/ | Canonical tokens, tablet/states/components/budgets, removals | Design/keyboard-flow review | Approved adapted references, no HTML copy |
| 001-03 | Pin both toolchains/checks | 01 architecture | web/ config/manifests/lockfile; api/go.mod/go.sum; docs/development | Scaffold tools and disposable test services | Both builds/types/minimal meaningful tests | Reproducible resolved versions/commands |
| 001-04 | /api/v1 contracts/session boundary | 03, 01 security | docs/api/; web/ client; api/ transport | Payload/errors/pagination/proxy/cookies/CSRF | Contract/origin tests | Reusable API, no duplicate auth |
| 001-05 | Core schema/query baseline | 04, 01 data | api/migrations/, queries/, sqlc.yaml, internal/db/ | Accounts/company/jobs/lists/assignments constraints and generation | Disposable migration/recovery/query tests | Safe coherent schema/scoped keys |
| 001-06 | Applicant OTP/session API | 05, 04, 01 identity | api/internal/auth/, senders/; queries/tests | OTP/channels/dev sender/lockout/sessions | Expiry/replay/settings/CSRF tests | Secure applicant auth, production terminal/SMS off |
| 001-07 | Privileged password/TOTP API | 06, 01 recovery | api/internal/auth/; MFA queries/tests | Bootstrap/hash/enroll/challenge/recover | Bypass/replay/recovery tests | Three privileged roles MFA-gated |
| 001-08 | Role/company/assignment policy | 07, 01 projection | api/internal/authorization/; scoped queries/tests | Enforce own/assigned/company/global rules | Forged-ID/revocation/cross-role tests | No privilege or company leakage |
| 001-09 | Public job/list API and expiry | 08, 05, 01 job rules | api/internal/jobs/; queries/tests | Exact seed lists, filters/newest, synchronous expiry/archive worker | Search/sort/deadline/worker tests | Published-only reads, expiry enforced |
| 001-10 | Public home/results/regions | 02, 09 | web/app/ public routes/components/tests | Responsive search/list/state UI and managed tiles | Phone/tablet/desktop/performance/keyboard | Requested filters and removals |
| 001-11 | Detail/external apply/SEO | 10, 01 URL/trust | web/app/ jobs; structured-data helpers/tests | Clean URL/detail/closed/warning and three external actions | Link/expiry/structured-data/browser tests | Anonymous external apply, no completion claim |
| 001-11a | Super admin: companies, jobs, managed lists | 11, 07, 08, 09; 01 bootstrap/job rules | api/internal/admin/ companies/jobs/lists; web/app/ admin/ entry and privileged sign-in; queries/tests | Minimal desktop/tablet design, super-admin password/TOTP entry, company/job create/edit/publish/archive and managed-list CRUD; prevent full-recruitment activation without authority | MFA/role/CRUD/list/reference/expiry/browser tests | Real jobs enter public listings early; super-only writes; no unpaid gate; no applicant intake before safeguards; no users/roles/general settings/report queue |
| 001-12 | Applicant sign-in UI | 06, 02, 11 | web/app/ sign-in; tests | Identity/code/resend/failure/paste states | OTP/channel/keyboard browser checks | Clear accessible configured auth |
| 001-13 | Private profile/CV API | 08, 01 files | api/internal/files/, applicants/; migrations; .gitignore | PDF/.docx content checks, 5,242,880-byte cap, name/contact validation, private storage/download audit and snapshot primitives | Spoof/size/.doc rejection/contact/private-access tests | Exact file policy; name plus email or phone; scoped reads |
| 001-14 | Retention/account deletion foundation | 13, 01 privacy | api/internal/retention/, deletion/; queries/tests | Immediate profile/profile-CV deletion; six-month submitted copies; ID/time-only audits, 35-day backup expiry/restore controls | Immediate deletion/calendar/copy/audit/backup policy tests | Distinct timelines before real intake; extend with applications; invoices no applicant data |
| 001-15 | Applicant profile UI | 12, 13, 14, 02 | web/app/ profile/deletion; tests | Contact/CV edit/replace/remove/consent/delete feedback | File/profile/deletion browser checks | Own-only usable profile and deletion |
| 001-16 | Full recruitment intake | 11a, 09, 13, 14, 15, 01 authority/duplicates | api/internal/applications/; queries; web/app/ apply; tests | Auth/authority/expiry/consent/snapshot/idempotency/trap/rate limits; authority fixtures only until 22 administration | Race/snapshot/consent/deletion tests | Valid Submitted record only for full recruitment; live authority administration required before real recruitment |
| 001-17 | Stages/interviews/notes API | 16, 08, 01 transitions | api/internal/recruitment/; queries/tests | Five stages/dates/private-sharing/audit transactions | Assignment/stage/note/audit tests | Scoped changes and actor/time audit |
| 001-18 | In-site/email notifications | 17, 06, 01 delivery | api/internal/notifications/, outbox/; tests | Transactional events/adapters/templates/retry/dedup | Applicant/staff/failure/deletion tests | Required alerts, no production SMS |
| 001-19 | My applications UI | 17, 18, 15 | web/app/ applications; tests | Own tracker/stage/date/empty/error states | Tracker/access/browser checks | No external outcome fiction or export |
| 001-20 | Trust/reports/information pages | 11, 01 content | api/internal/reports/, settings/; web/app/ info; tests | Report/trap/abuse/warnings/privacy/terms/about/contact | Report/content/consent tests | Required public safeguards/content |
| 001-21 | Remaining admin design/contracts | 19, 20, 11a, 01 admin/finance | docs/design/admin/; tasks/specs/ | Desktop/tablet remaining super/staff/company flows, later references; reuse early entry UI | Permission/state/design review | Early companies/jobs/lists UI retained; remaining admin UI follows public/applicant UI |
| 001-22 | Remaining super management UI/APIs | 21, 11a, 08, 20 | api/internal/admin/; web/app/ admin/; queries/tests | Checklist/authority/assignments/users/roles/general settings/reports; reuse existing companies/jobs/lists without duplicating CRUD | CRUD/MFA/permission/report tests | Remaining super-only operations work; early entry scope unchanged |
| 001-23 | Staff/company portal UI | 22, 17, 18 | web/app/ staff/company; API projections/tests | Candidate review/stages/CVs/notes; company active-stage and rejected lists with super-admin detail-share control | Stage-list/sharing/direct-CV/revocation/company/notes/browser tests | Rejected removed from main list; no company CV/contact before sharing; no redaction or private-note leakage |
| 001-24 | Billing/price/payment ledger API | 22, 01 finance | api/internal/billing/; migrations/queries/tests | DJ-YYYY-0001 non-reused sequence, prices/overrides, Sent lock/cancel-reissue, single currency/USD default, manual tax line, partial payment ledger | Number/concurrency/locking/cancellation/partial-payment/currency tests | Super-only applicant-free invoices; per-currency totals; no automatic tax or publish gate |
| 001-25 | Invoice PDF/UI/revenue | 24, 21 | web/app/ admin/billing/; api/internal/billing/ PDF/tests | Editor/payment recording/PDF/instructions/currency totals | PDF layout/content/finance browser tests | Manual sending, correct billed/paid/unpaid |
| 001-26 | Integrated verification/review | 23, 25, 14, 20 | web/api tests/docs; finding fixes | End-to-end/security/retention/performance/accessibility and resolution | Established builds/types/database/backend/browser checks | Acceptance verified and independent findings resolved |

All task statuses PENDING. Real jobs can be entered after 001-11a. No production intake before 14/16 privacy safeguards; no launch before admin operations/integrated checks. Release planning is separate after owner hosting research and authorization; no merge/deploy task approved here.

## Approval and Lifecycle

REQUEST/INVESTIGATION/SPECIFICATION REVISION/DOCUMENT-EDIT APPROVAL/BREAKDOWN REVISION COMPLETE under explicit latest user request. Earlier product/stack approvals historical; latest conflicting decisions supersede them. Every implementation task requires a concrete spec/approval. Application implementation/testing/review/issue resolution/final approval/authorized merge/post-merge verification PENDING; runtime checks BLOCKED by absent tooling/features. Document verification/review results in TASK-001-log.md. No implementation, commit, push, release or hosting research authorized or performed.
