# TASK-001 — Dalka Jobs version-1 requirements and proposed delivery

## Task ID
TASK-001

## Title
Define and deliver an English-language job website with advertising and delegated recruitment workflows.

## Type
Requirements and proposed new application. Current authorization covers specification only.

## Priority
TBD by owner.

## Problem Statement
Dalka Jobs needs a public job website and admin panel. Some employers delegate publication and candidate interviews to Dalka Jobs; others use Dalka Jobs solely to advertise a job and direct visitors to the employer's application channel. These workflows must not imply that external applicants are known to Dalka Jobs.

## Current Behavior
`README.md` contains only the project name. No application, dependencies, tests, database, authentication, or deployment configuration exists. Workflow documents and task artifacts are now tracked. Before this 2026-11-03 documentation revision, the working tree was clean on `main`.

## Expected Behavior / Goal
Visitors discover jobs in English on accessible, mobile-friendly pages. Admins create and manage listings. Each listing identifies its recruitment mode:
- **Delegated recruitment:** the employer has authorized Dalka Jobs to publish and interview candidates. Dalka Jobs collects applications on its own site; admins can view applicants for that job and manage an agreed interview workflow.
- **Advert only:** the apply action opens the employer-provided application/hiring URL or email destination. Dalka Jobs does not claim to know who applied or that an external application was completed.

## Root Cause (if known)
UNKNOWN; this is a new product definition, not a diagnosed application defect.

## Repository Evidence
- `README.md`: project name only.
- `AGENTS.md`: initial repository discovery, absent tooling, safety and lifecycle rules.
- `TASK_SPEC.md`: specification fields and approval gate.
- `SMALL_TASKS.md`, `TASK_EXECUTOR.md`, `PR_REVIEW.md`, `PR_MERGE.md`: delivery and release contracts.
- User requirements in this conversation: admin-managed jobs; two recruitment modes; English; accepted suggested job fields, browsing features, admin features, and privacy/security defaults; requested stack proposal; explicitly excluded hosting research and implementation.

## Scope
### Confirmed requirements
- English public job list and detail pages, keyword search, location/category filters, and apply actions.
- Admin job creation/editing, draft/publish/archive, closing dates, and per-job applicant visibility for delegated recruitment.
- Job fields: title, employer, description, location, category, employment type, work arrangement, optional salary, closing date, and applicable application destination.
- Delegated applicant form: name and email, optional phone; no CV uploads in version 1, following the accepted suggestion.
- Mobile-friendly pages targeting WCAG 2.2 AA.
- Go-backend account/session authentication with TOTP MFA for admins; restricted applicant access; clear consent before collection; automatic deletion of applicant personal data after six months. Retention trigger and legal applicability remain TBD.
- Domain, hosting provider, deployment region, and budget are for the owner to research.

### Requirements needing decisions
- User answered “all” to account roles: proposed roles are administrator, employer, and job seeker, but each role's login requirement, permissions, registration process, and portal features are TBD. Anonymous browsing remains required. Do not grant employer access to applicant records without explicit policy.
- Applicant export: TBD; “your suggestion” did not explicitly resolve the separate export question.
- Interview management is required in principle; stages, scheduling, interview notes, outcomes, assignment, and notification behavior are TBD. Suggested minimal proposal: admins manually record stage and interview date; no calendar integration.
- Employer delegation evidence and who verifies it: TBD. Proposed gate: an authorized admin records the authority confirmation before enabling on-site applications.
- Application acknowledgement, duplicate handling, applicant status access, and account deletion verification: TBD.

## Out of Scope
For this work: application implementation, scaffolding, dependency installation, commits, pushes, merges, deployment, and hosting research.
For proposed version 1: CV uploads; automatic identification or completion confirmation for external/email applicants; automated interview/calendar integrations. Payments, employer self-publishing, bulk imports, applicant export, recommendations, subscriptions, click analytics, and employer/job-seeker portals are excluded from the proposed baseline unless separately decided and approved. Account roles remain an open scope decision, not silently removed.

## Affected Components
Proposed: public website, admin panel, application intake, recruitment tracking, authentication/authorization, persistence, retention worker, and automated verification. Employer/job-seeker account components depend on the role decision.

## Proposed Architecture and Stack / Implementation Approach
**Stack selected for planning by the owner's 2026-11-03 request; implementation remains unauthorized. Exact versions are TBD; none are installed or resolved.** This supersedes the single Next.js application, Prisma, and candidate Supabase Auth proposal.
- **Frontend (`web/`):** TypeScript, Next.js and Tailwind CSS for public pages and admin UI. Server rendering supports discoverable listings. Frontend validation aids usability; Go repeats authoritative validation and access checks.
- **Backend (`api/`):** Go REST API using standard-library `net/http` and chi routing/middleware. Go owns business rules, accounts, sessions, MFA, authorization, persistence and recruitment operations. chi is an intentional external dependency, not part of the standard library.
- **Database:** PostgreSQL, pgx for database access/pooling, sqlc for typed Go query generation from reviewed SQL, and golang-migrate for versioned SQL migrations. Proposed locations: `api/migrations/`, `api/queries/`, `api/sqlc.yaml`, generated `api/internal/db/`. Migrations define the schema; sqlc does not apply migrations. Specify transaction boundaries, compatibility, failed-migration recovery and safe rollback/forward-repair conventions before database work; verify these on disposable data.
- **Sessions:** Go issues opaque tokens in Secure, HttpOnly cookies with an explicitly chosen SameSite policy; PostgreSQL stores token hashes and server-side session state. Define password hashing, provisioning/recovery, idle/absolute expiry, rotation, logout/revocation and disabled-account behavior in A/D1. Next.js neither issues a separate identity/session nor directly accesses PostgreSQL.
- **Admin TOTP MFA:** Go tracks confirmed enrollment and session MFA completion. Password-only/pre-MFA sessions cannot access admin business operations. Specify encrypted secret storage with separately managed keys, clock/replay windows, rate limits, hashed single-use recovery codes and audited reset/recovery. Bootstrap the first admin without public role escalation. Justify and approve maintained password-hashing/TOTP dependencies; do not implement cryptography from scratch.
- **Browser/API boundary:** prefer one browser origin with `/api/*` routed to Go. A/B must settle routing and cookie scope without choosing a hosting provider. Server rendering forwards only the intended request's credentials to the trusted API; private responses must not enter shared caches. Go enforces CSRF protection on cookie-authenticated mutations. CORS is not CSRF protection. Separate origins would require an explicit credentialed-CORS, cookie/SameSite and CSRF design before dependent work.
- **Contracts:** define REST payloads, errors, pagination, authentication/MFA states and permission rules before frontend integration. Go and TypeScript do not share types automatically; use documented contracts and contract checks, or separately approve generation tooling. No additional generator is selected here.
- **Retention:** a scheduled Go operation deletes expired applicant and related interview personal data. Scheduler/provider and retention anchor remain TBD; no infrastructure choice is authorized.
- **Proposed checks:** Go standard testing tools for backend/domain/security/integration behavior; Vitest for frontend logic where useful; Playwright for browser workflows/accessibility; isolated PostgreSQL checks for migrations, generated queries, constraints and transactions. These are future tools/checks, not installed dependencies or verified commands.

### Compatibility, project fit and order changes
No inherent stack conflict was identified. [chi uses standard net/http handlers](https://github.com/go-chi/chi); [sqlc supports pgx](https://docs.sqlc.dev/en/stable/guides/using-go-and-pgx.html) and [reads migration schemas](https://docs.sqlc.dev/en/stable/howto/ddl.html), while [golang-migrate applies migrations](https://github.com/golang-migrate/migrate). [Next.js supports an existing backend](https://nextjs.org/docs/app/guides/custom-server). Pin and validate compatible maintained versions during B/C. Use fixed-width, zero-padded migration sequence names so golang-migrate numeric ordering matches sqlc lexicographic ordering; verify generated schema/query consistency in C.

Project-fit assessment: two languages/runtimes, API contracts and owned authentication increase development, security and operating work over the previous proposal. This may be more machinery than a small initial jobs site needs; repository evidence does not establish a technical need for the split, but it is the owner's chosen direction. Tailwind does not satisfy accessibility requirements by itself. TOTP works with sessions but is not phishing-resistant; enrollment, recovery, encryption keys and replay handling are required scope, not supplied by chi/net/http.

Order changes: A resolves identity/MFA/recovery, organization and origin/contract policies; B establishes both toolchains and routing/contracts; C establishes migrations and sqlc queries. D becomes D1 accounts/sessions, D2 admin MFA, then D3 role/organization access control. E depends on all three. Authentication rate limits, CSRF and sensitive-auth audit events belong in D1/D2, not H. Organization-scoped queries begin in C/D3, before applicant intake. Runtime/routing requirements must be known early; hosting research and release remain deferred to the owner and J.

## Data Model (high level)
- **User / role assignment:** Go-owned account identity, credential hash under the approved login policy, agreed role(s), account state, relevant consent/deletion metadata. Registration and role grants TBD; never trust client-supplied roles.
- **Session / admin MFA:** hashed opaque session token, user reference, expiry/revocation and server-side MFA state; encrypted TOTP secret, enrollment/replay metadata and hashed single-use recovery codes. Detailed schema/key management require D1/D2 specifications; secrets and raw credentials/tokens must never enter logs.
- **Organization membership:** proposed user/employer association, role, membership state and scope. Policy TBD in A; membership does not imply applicant visibility.
- **Employer:** name and agreed organization/contact details. Employer-account membership and multi-user organizations TBD.
- **Job:** employer reference; agreed job fields; recruitment mode; publication state; closing date; validated URL/email for advert-only jobs; timestamps. Salary currency/range representation and closing-date timezone TBD.
- **Recruitment authority:** job/employer association, confirmation metadata and revocation state; exact evidence and retention TBD. No invented legal agreement.
- **Application:** delegated job reference, name, email, optional phone, consent version/time, submission time, agreed status, retention deadline; identity link optional/TBD. No records implying external completion.
- **Interview:** application reference plus approved stage/date/outcome fields. Detailed schema and permitted note content TBD.
- **Audit event:** actor, action, target, timestamp, minimal metadata for sensitive admin actions; avoid duplicating applicant personal data. Retention TBD.

Use foreign keys, validated states, server-generated timestamps, and transactional changes where needed. Restrict applicant records to authorized recruitment staff; employer visibility and tenant boundaries require an explicit decision.

## Expected Files
Current deliverables: `tasks/specs/TASK-001.md` and `tasks/specs/TASK-001-log.md` only. Preserve the six existing workflow files and README.
Future application roots are `web/` and `api/`. Proposed areas: `web/app/`, UI/styles/tests; `api/cmd/`, `api/internal/`, `api/migrations/`, `api/queries/`, `api/sqlc.yaml`, `api/go.mod`, `api/go.sum`, and development documentation. These paths do not exist yet. Approve exact files in each implementation specification before creating them.

## Database Impact
No database change now. Future implementation introduces the entities above, constraints, migrations, access controls, and retention operations. Data deletion must include associated interview personal data and avoid retention through logs; backup deletion lifecycle requires owner/provider policy.

## API Impact
No API exists or changes now. Go REST endpoints will serve Next.js: public reads and protected account/session/MFA, job/application/recruitment operations require validated contracts and Go/TypeScript contract checks. Endpoint names, pagination, error formats and versioning remain TBD; no external integration is assumed.

## Security Impact
Personal applicant data introduces access-control and privacy obligations. Enforce admin MFA, deny-by-default server authorization, safe role provisioning, TLS, secure sessions, CSRF protection where applicable, rate limits, input validation, and safe rendering of job descriptions. Validate outbound schemes and email destinations to avoid script injection; do not fetch arbitrary provider URLs server-side. Never log credentials or application contents. Provide an agreed account/data deletion process and auditable retention behavior. Consent wording, privacy notice, lawful basis, applicable jurisdiction, and incident ownership need owner/legal review.

## Tenant Impact
UNKNOWN until employer account permissions are settled. Treat employer separation as a required threat-model question. If employers receive access, tests must prove employer A cannot read or change employer B's jobs or applicants. Public job visibility never grants applicant visibility.

## Edge Cases
- Missing/invalid application destination; authority missing or revoked; changing recruitment mode after applications exist.
- Expired/archived/draft jobs, closing-date boundary and timezone; direct URLs and form submission must obey the same rules as the UI.
- Duplicate submissions, repeated clicks, validation failures, concurrency, and submission retries; duplicate policy TBD.
- Applicant requests deletion; retention deadline reached; associated interview records and audit metadata contain personal data.
- Employer replaces a link or withdraws authority; preserve valid retention obligations and prevent unauthorized new collection.
- Email apply requires the visitor's email client and does not confirm delivery. External destination failures are outside Dalka Jobs' completion visibility.

## Test Plan
Current specification: verify required fields, decision labels, evidence paths, file scope and whitespace. Working directory: `D:\Dalka jobs Project\Dalka-Jobs`; `git status --short`, `git diff --check`, and inspection of the complete diff including any untracked files.
Future required checks, commands TBD until tooling exists in `web/` and `api/`: isolated PostgreSQL migration/query/constraint/retention integration tests; Go authorization/validation tests; browser tests for browsing, admin management, both application modes and privacy consent; accessibility and manual keyboard review; both builds and frontend type checks. Cover account/session expiry, rotation, logout/revocation, disabled users, CSRF, cookies through Next.js and private caching; TOTP enrollment/challenge/replay/recovery/reset and bypass denial; cross-role/organization isolation. Services, TOTP keys and secure configuration are BLOCKED until their specifications exist; do not invent commands or report application checks passed.

## Acceptance Criteria
### Specification deliverable
1. Confirmed requirements and TBD decisions are distinguishable; both recruitment modes and external tracking limits are explicit.
2. Architecture proposal, data model, impacts, test plan, risks, and ordered tasks are documented.
3. Only specification/log files are updated; the revised stack, ownership boundaries and D1/D2/D3 dependencies are explicit; no implementation, commit, or push occurs.
### Proposed application acceptance (pending scope approval)
1. Anonymous visitors can search and filter published jobs, open details, and use the mode-appropriate apply action in English on mobile and desktop.
2. Draft/archived jobs are not publicly listed; expired jobs reject on-site submissions and do not present an active apply action.
3. Authorized admins can create/edit/draft/publish/archive jobs and set closing dates; unauthenticated and unauthorized operations are rejected server-side.
4. Delegated jobs accept valid, consented name/email/optional-phone submissions only under verified authority. The record is associated with the correct job and visible only to authorized staff.
5. Advert-only jobs use the validated employer URL/email and never create a record claiming an identified or completed application.
6. Approved interview workflow is testable per job/application; detailed criteria remain TBD until stages and permissions are decided.
7. Go-owned sessions, admin TOTP MFA and the approved role/organization matrix are enforced; password-only admin sessions cannot access privileged business operations; cross-role and applicable cross-employer access tests pass.
8. Applicant personal data and related interview personal data are deleted at the approved six-month deadline; automated tests cover boundary dates and deletion consistency. Retention anchor is a decision gate.
9. Critical journeys pass automated checks and manual keyboard review against the stated WCAG target; known exceptions are documented and resolved before declaring acceptance.
10. Relevant tests execute with nonzero coverage of the required journeys; build/type checks pass; required independent review findings are resolved. Deployment acceptance is TBD and separate.

## Risks and Open Questions
- What does “all” mean for account roles, registration, employer access, and job-seeker accounts?
- Which country/market and privacy jurisdiction apply? English alone does not settle these.
- What proves employer authority, how is it revoked, and who may interview/view candidates?
- Which interview stages, scheduling fields, and outcomes are essential? Are acknowledgements or notifications required?
- Should applicants see status or withdraw an application? Are duplicates allowed?
- Applicant export is TBD; adding it increases data-exfiltration risk.
- Is the accepted six-month retention measured from submission, closure, or last recruitment activity? Define audit/backup retention and account deletion behavior.
- Decide salary format/currency, job closing timezone, destination rules, branding, and data deletion contact.
- Revised stack selected for planning; maintained versions, API contracts, cookie/origin routing, provisioning/recovery policy, TOTP key custody and session/MFA lifetimes remain decision gates. Owned authentication increases security maintenance obligations.
- Provider, domain, region, budget, and deployment plan remain owner-researched TBD. No deployment research performed.

## Dependencies
Owner approval and closure of decisions for each implementation task; supported Go and Node/TypeScript toolchains with pinned frontend/backend/database tools; isolated PostgreSQL; approved Go session/TOTP policy and secure credential/key configuration; agreed privacy/authority policies. Production dependencies await the owner's infrastructure research.

## Estimated Complexity
Medium-to-large new application; time estimate TBD after account and interview scope decisions. Security, applicant privacy, and retention require dedicated verification.

## Proposed Small Task Breakdown
All tasks are PENDING and unapproved for implementation. Verification commands and exact application paths are TBD until tooling/path specifications are approved; each task needs its own completed specification and approval before implementation.

| ID | Objective and exact scope | Dependencies | Expected files | Implementation steps | Verification | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- |
| 001-A | Resolve role/organization matrix, authority, interview, retention, account/provisioning/recovery and MFA policies; define API/cookie/origin boundaries | Owner decisions; revised stack selected for planning | Task specifications only | Record decisions, contracts and measurable security gates without assuming employer applicant access | Document inspection; application checks BLOCKED until tooling exists | Blocking decisions explicit and approved |
| 001-B | Establish Next.js/TypeScript/Tailwind frontend and Go net/http/chi API toolchains, local routing and contract baseline | A | `web/` manifests/lockfile/shell/styles/config; `api/go.mod`, `api/go.sum`, API shell; development/contract docs; exact files TBD | Pin compatible tools; scaffold both roots; establish routing and separate build/test/contract checks | Actual frontend build/type/test and backend build/test commands established and run; currently BLOCKED | Both runtimes reproducible; web reaches Go; no duplicate session/backend ownership |
| 001-C | Implement PostgreSQL schema, golang-migrate migrations, pgx/sqlc queries and isolated test data | B; A's account/organization policy | `api/migrations/`, `api/queries/`, `api/sqlc.yaml`, `api/internal/db/`, integration tests; exact files TBD | Model accounts/sessions/MFA/memberships and product entities; generate query code; define transactions and safe recovery/rollback/forward repair | Migration, generated-code consistency and database integration checks; commands BLOCKED until established | Approved schema applies cleanly; constraints/scoped queries work; recovery verified on disposable data |
| 001-D1 | Accounts and Go-owned sessions: approved credential/provisioning/recovery flows, secure cookies and CSRF | C; A's identity/routing policy | `api/internal/` account/session handlers/services/queries/tests; `web/` account/login UI/tests; exact files TBD | Reviewed password hashing; opaque hashed-token sessions; expiry/rotation/revocation; disabled users; CSRF; login rate limits and minimal auth audit; reserve pre-MFA state | Account/session integration/browser checks, CSRF/expiry/logout/revocation/private-cache tests; commands BLOCKED until established | Valid accounts authenticate; invalid/disabled accounts fail; sessions expire/revoke; client cannot set roles/MFA state; password-only admins lack business access |
| 001-D2 | Admin TOTP MFA enrollment, challenge and controlled recovery/reset | D1; C's MFA schema; A's MFA/key/recovery policy | `api/internal/` MFA handlers/services/tests; MFA queries/migrations as needed; `web/` MFA UI/tests; exact files TBD | Confirm enrollment; encrypt secrets with separately configured keys; enforce time/replay/rate limits; rotate/elevate session; hash single-use recovery codes; audit sensitive actions | Enrollment/challenge/replay/recovery/reset and direct-API bypass tests; commands BLOCKED until established | Pre-MFA admins limited to approved enrollment/challenge/recovery/logout flows; business access requires MFA; recovery/reset obey approved assurance policy |
| 001-D3 | Approved role and organization access control in Go | D1, D2; C's memberships; A's permission matrix | `api/internal/` authorization/scoped queries/tests; `web/` permission-aware UI/tests; exact files TBD | Deny by default; enforce role, active membership, resource scope and MFA gate on protected operations; test revoked membership and forged identifiers | Cross-role/organization and object-access integration checks; commands BLOCKED until established | Org A cannot read/change org B private resources; unauthorized/revoked memberships denied; employer applicant access only if approved; public jobs expose no private data |
| 001-E | Implement admin job and authority management | D1, D2, D3 | `web/` admin UI; `api/` job/authority operations/queries/tests; exact files TBD | Validate fields; enforce publication/authority rules in Go | Admin browser/API integration checks; commands BLOCKED until established | Agreed admin CRUD/lifecycle and authority gates pass |
| 001-F | Implement English public browsing and advert-only apply actions | E | `web/` public UI; `api/` public search/read queries/tests; exact files TBD | List/search/filter/detail; validate outbound actions | Public browser/API and accessibility checks; commands BLOCKED until established | Public discovery and external/email behavior pass |
| 001-G | Implement delegated intake, applicant views and agreed interviews | F; D3 authorization | `web/` intake/recruitment UI; `api/` intake/recruitment operations/queries/tests; exact files TBD | Consent/validation; job-scoped records; agreed interview states | Intake/privacy/permission checks; commands BLOCKED until established | Correct job association, authorized visibility and agreed tracking |
| 001-H | Implement retention/deletion, remaining minimal audit and intake abuse controls | G; A's retention policy | `api/` retention/deletion/security operations/tests; exact files TBD | Enforce deadlines/deletion scope; complete audit and abuse controls; preserve D1/D2 security gates | Date-boundary/security integration checks; commands BLOCKED until established | Retention/deletion pass without leakage; auth protections already delivered in D1/D2 |
| 001-I | Verify integrated product and obtain independent review | H | `web/` and `api/` tests/docs and finding fixes; exact files TBD | Verify browser/API contracts, sessions/MFA/organization isolation, accessibility and both builds; resolve findings | Established complete required checks; currently BLOCKED until application/tooling exists | Approved acceptance verified; independent review approved |
| 001-J | Define deployment after owner research; separately authorize release | I plus owner infrastructure decisions | Release/config docs; exact files TBD | Specify Next.js/Go runtimes, routing/cookies, PostgreSQL migrations, TOTP keys, retention scheduler and rollback; seek release authorization | Provider-specific readiness/post-release checks BLOCKED pending infrastructure decisions | Release only after explicit authorization and verification |

Completion status for every row: **PENDING**. Application verification is **BLOCKED** by absent tooling and unapproved implementation specifications; no application check above has been executed. D1/D2/D3 replace D; E-J retain their IDs. Later schema amendments require versioned migrations and the same recovery checks as C.

## Approval and Lifecycle
- REQUEST / REPOSITORY INVESTIGATION: COMPLETE for specification scope.
- TASK SPECIFICATION: COMPLETE; owner approved TASK-001 in the conversation.
- TASK APPROVAL (original baseline): APPROVED by the owner’s explicit “approved” reply to TASK-001. Approval covers the documented proposed baseline; TBD choices remain unresolved and do not acquire assumed values. Each implementation task still requires its concrete specification and approval as stated in the breakdown.
- STACK REVISION (2026-11-03): owner explicitly requested this stack and D1/D2/D3 documentation revision. It supersedes the previous stack proposal and authorizes specification/breakdown edits only, not implementation.
- SMALL TASK BREAKDOWN: revised above; implementation details PENDING.
- IMPLEMENTATION / TESTING (application) / INDEPENDENT PR REVIEW (application) / ISSUE RESOLUTION / FINAL APPROVAL / AUTHORIZED MERGE / POST-MERGE VERIFICATION: PENDING.
- Document revision checks and independent document review: see execution log; these do not approve application implementation.
- Specification self-check does not count as independent application review. No application or release readiness claimed.

Owner approval recorded. Unresolved decisions remain TBD and block dependent work; next step is task 001-A decision closure and concrete implementation specifications. No commit, push, merge, or deployment is authorized.
