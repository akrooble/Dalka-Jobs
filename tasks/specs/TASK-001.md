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
`README.md` contains only the project name. No application, dependencies, tests, database, authentication, or deployment configuration exists. The six root workflow documents are present as untracked files from the preceding authorized setup.

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
- Managed admin authentication with MFA; restricted applicant access; clear consent before collection; automatic deletion of applicant personal data after six months. Retention trigger and legal applicability remain TBD.
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
**Proposal only; selection and exact versions TBD pending approval.**
- Next.js with TypeScript: one web application for public pages, admin UI, and server-side operations; server rendering supports discoverable job listings while shared types reduce duplication.
- PostgreSQL with Prisma migrations: relational job/employer/application associations, database constraints, and reviewable schema changes. Migration compatibility and backup/recovery procedures must be specified before production use.
- Supabase Auth as a candidate managed authentication service, subject to verifying admin MFA, data handling, and deployment compatibility. Keep privileged database/service credentials server-side; validate identity and authorization on every protected operation. Provider selection remains TBD.
- Server-only data access with explicit role and job/employer scope checks. Database row-level controls where supported provide additional protection, not a substitute for tested application authorization.
- A scheduled server-side retention operation deletes expired applicant personal data. Scheduler/provider and retention anchor TBD; no infrastructure choice is authorized here.
- Proposed tests: Vitest for domain/validation/authorization tests and Playwright for critical browser workflows and accessibility checks. These are future dependencies, not installed tools or verified commands.

A single application is proportionate to the initial scope. No microservices or uploads/object storage are proposed. Verify maintained versions, compatibility, licenses, MFA capabilities, and required credentials before adopting dependencies. Do not select a hosting provider as part of this task.

## Data Model (high level)
- **User / role assignment:** managed identity reference, agreed role(s), account state, relevant consent/deletion metadata. Registration and role grants TBD; never trust client-supplied roles.
- **Employer:** name and agreed organization/contact details. Employer-account membership and multi-user organizations TBD.
- **Job:** employer reference; agreed job fields; recruitment mode; publication state; closing date; validated URL/email for advert-only jobs; timestamps. Salary currency/range representation and closing-date timezone TBD.
- **Recruitment authority:** job/employer association, confirmation metadata and revocation state; exact evidence and retention TBD. No invented legal agreement.
- **Application:** delegated job reference, name, email, optional phone, consent version/time, submission time, agreed status, retention deadline; identity link optional/TBD. No records implying external completion.
- **Interview:** application reference plus approved stage/date/outcome fields. Detailed schema and permitted note content TBD.
- **Audit event:** actor, action, target, timestamp, minimal metadata for sensitive admin actions; avoid duplicating applicant personal data. Retention TBD.

Use foreign keys, validated states, server-generated timestamps, and transactional changes where needed. Restrict applicant records to authorized recruitment staff; employer visibility and tenant boundaries require an explicit decision.

## Expected Files
Current deliverables: `tasks/specs/TASK-001.md` and `tasks/specs/TASK-001-log.md` only. Preserve the six existing workflow files and README.
Future application paths are TBD after stack approval; proposed areas are application routes, server data access, schema/migrations, domain validation, tests, and development documentation. Approve concrete paths in each implementation task before editing.

## Database Impact
No database change now. Future implementation introduces the entities above, constraints, migrations, access controls, and retention operations. Data deletion must include associated interview personal data and avoid retention through logs; backup deletion lifecycle requires owner/provider policy.

## API Impact
No API exists or changes now. Future public read operations and protected job/application/recruitment operations require validated contracts. Endpoint names, pagination, error formats, and versioning are TBD; no external integration is assumed.

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
Current specification: verify required fields, decision labels, relative evidence paths, file scope, and whitespace. Working directory: `/workspace/Dalka-Jobs`; `git status --short` and `git diff --check`, plus direct inspection of new untracked files.
Future required checks, commands TBD until tooling exists: schema/constraint and retention integration tests against an isolated test database; authorization/validation unit tests; browser tests for browsing, admin management, both application modes, and privacy consent; accessibility checks plus manual keyboard review; production build and type checks. Test MFA integration with a supported non-production configuration. Required credentials/services are BLOCKED until provider decisions and secure configuration; do not invent test commands or report these checks passed.

## Acceptance Criteria
### Specification deliverable
1. Confirmed requirements and TBD decisions are distinguishable; both recruitment modes and external tracking limits are explicit.
2. Architecture proposal, data model, impacts, test plan, risks, and ordered tasks are documented.
3. Only specification/log files are added; no implementation, commit, or push occurs.
### Proposed application acceptance (pending scope approval)
1. Anonymous visitors can search and filter published jobs, open details, and use the mode-appropriate apply action in English on mobile and desktop.
2. Draft/archived jobs are not publicly listed; expired jobs reject on-site submissions and do not present an active apply action.
3. Authorized admins can create/edit/draft/publish/archive jobs and set closing dates; unauthenticated and unauthorized operations are rejected server-side.
4. Delegated jobs accept valid, consented name/email/optional-phone submissions only under verified authority. The record is associated with the correct job and visible only to authorized staff.
5. Advert-only jobs use the validated employer URL/email and never create a record claiming an identified or completed application.
6. Approved interview workflow is testable per job/application; detailed criteria remain TBD until stages and permissions are decided.
7. Admin MFA and the approved role matrix are enforced; cross-role and applicable cross-employer access tests pass.
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
- Proposed stack/auth provider and exact maintained versions require approval and capability validation.
- Provider, domain, region, budget, and deployment plan remain owner-researched TBD. No deployment research performed.

## Dependencies
Owner approval and closure of decisions needed for each implementation task; supported Node/toolchain after stack selection; isolated development database; chosen auth service with MFA; secure configuration of required credentials; agreed privacy/authority policies. Production dependencies await the owner's infrastructure research.

## Estimated Complexity
Medium-to-large new application; time estimate TBD after account and interview scope decisions. Security, applicant privacy, and retention require dedicated verification.

## Proposed Small Task Breakdown
All tasks are PENDING and unapproved for implementation. Verification commands and exact application paths are TBD until tooling/path specifications are approved; each task needs its own completed specification and approval before implementation.

| ID | Objective and exact scope | Dependencies | Expected files | Implementation steps | Verification | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- |
| 001-A | Resolve role matrix, authority, interview and retention decisions; approve stack | Owner decisions | Task specifications only | Record decisions and measurable gates | Document checks; commands TBD | Blocking product decisions are explicit and approved |
| 001-B | Establish approved application/toolchain and local checks | A | Manifests, lockfile, app shell, config, docs; paths TBD | Pin tools, scaffold approved stack, document development | Actual build/type/test commands established and run | Reproducible local application and meaningful test runner |
| 001-C | Implement schema, migrations, constraints and isolated test data | B | Schema/migrations and integration tests; paths TBD | Model approved entities; test associations/states | Database integration suite; command TBD | Approved schema applies cleanly and enforces integrity |
| 001-D | Implement identity, MFA and approved authorization boundaries | C | Auth/server access layer and security tests; paths TBD | Integrate provider; enforce/test role and employer boundaries | Auth/integration checks; commands TBD | Unauthorized access denied; approved MFA works |
| 001-E | Implement admin job and authority management | D | Admin UI/server operations/tests; paths TBD | Validate fields; enforce publication and authority rules | Admin browser/integration checks; commands TBD | Agreed admin CRUD/lifecycle and authority gates pass |
| 001-F | Implement English public browsing and advert-only application actions | E | Public UI/search/action tests; paths TBD | List/search/filter/detail; validate outbound actions | Public browser and accessibility checks; commands TBD | Public discovery and external/email behavior pass |
| 001-G | Implement delegated intake, applicant views and agreed interviews | F | Forms/recruitment operations/tests; paths TBD | Consent/validation; per-job records; agreed interview states | Intake, privacy and permission checks; commands TBD | Correct job association, authorized visibility, agreed tracking |
| 001-H | Implement retention, deletion, minimal audit and abuse controls | G | Retention/deletion/security operations/tests; paths TBD | Enforce agreed deadlines and deletion scope; limit misuse | Date-boundary/security integration checks; commands TBD | Retention and deletion gates pass without data leakage |
| 001-I | Verify integrated product and obtain independent review | H | Tests/docs and finding fixes; paths TBD | Run critical journeys, accessibility/build checks; resolve findings | Established complete required checks | Approved acceptance criteria verified; review approved |
| 001-J | Define deployment after owner research; separately authorize release | I plus owner infrastructure decisions | Release/config docs; paths TBD | Specify provider-specific gates and rollback; seek release authorization | Provider-specific readiness/post-release checks TBD | Release only after explicit authorization and verification |

## Approval and Lifecycle
- REQUEST / REPOSITORY INVESTIGATION: COMPLETE for specification scope.
- TASK SPECIFICATION: COMPLETE; owner approved TASK-001 in the conversation.
- TASK APPROVAL: APPROVED by the owner’s explicit “approved” reply to TASK-001. Approval covers the documented proposed baseline; TBD choices remain unresolved and do not acquire assumed values. Each implementation task still requires its concrete specification and approval as stated in the breakdown.
- SMALL TASK BREAKDOWN: proposed above; implementation details PENDING.
- IMPLEMENTATION / TESTING (application) / INDEPENDENT PR REVIEW / ISSUE RESOLUTION / FINAL APPROVAL / AUTHORIZED MERGE / POST-MERGE VERIFICATION: PENDING.
- Specification self-check does not count as independent application review. No application or release readiness claimed.

Owner approval recorded. Unresolved decisions remain TBD and block dependent work; next step is task 001-A decision closure and concrete implementation specifications. No commit, push, merge, or deployment is authorized.
