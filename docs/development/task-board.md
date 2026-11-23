# Dalka Jobs task board — 23 November 2026

## Latest: full roadmap authorized; bounded source additions implemented

Owner requested **“do it all”** on23 November. See [current local source guide](local-roadmap-23-nov.md), [execution log](../../tasks/specs/TASK-001-ALL-LOCAL-log.md), [independent review](../../tasks/specs/TASK-001-ALL-LOCAL-review.md) and [remaining decisions](../api/remaining-contracts-proposal.md). The current server requires owner-applied schema6. No database/setup/key/bootstrap/merge/deployment operation was executed. All twenty tasks remain unaccepted; this work is not full roadmap completion.

Owner subsequently authorized a GitHub update. Source commit `3dd8829` is pushed to `task/001-03b-local-database` and verified remotely; [draft PR #4](https://github.com/akrooble/Dalka-Jobs/pull/4) records the incomplete scope/checks. See [publication evidence](../../tasks/specs/TASK-001-GITHUB-UPDATE-log.md). Commit/push authorization supersedes earlier historical no-push wording for this branch only; no main merge/deployment occurred.

| Area | New local deliverable | Remaining acceptance/source |
| --- | --- | --- |
| FE-08 | Synthetic-only applicant OTP, durable limits, isolated sessions and dynamic live account guards | Actual DB/browser; approved real privacy/provider; no external delivery |
| FE-09 | Own profile/version editing and purpose-bound fresh-code deletion of profile/identity/sessions | Private CV/parser/scanner/storage, submitted retention/restore, actual DB/browser |
| FE-13 | Existing team directory/state revocation and persisted recruiter assignment source | Actual DB/browser; invitations and membership transition contracts/source |
| FE-16/17 | Assigned/own-company job read source and role guards | Candidate/CV/recruitment/sharing services and actual tenant acceptance |
| FE-19 | Actual overview counts and minimal activity source | Live settings, production retention/purge policy and runtime acceptance |
| FE-20 boundary | All live account/admin/role routes avoid fictional operations; source review findings resolved | Remaining services, actual browser/DB, owner visual/final acceptance |

FE-10/11 intake/tracker/outbox and FE-14/15/18 trust/recruitment/finance services remain unimplemented, not passed by their existing sample screens. The 11 November board sections below are preserved as historical context; their preparation-only approval/schema3/current-build wording is superseded by this dated update.

## Latest continuation: previous-task fix and next five specifications

The owner selected **prepare FE-08–FE-12 specifications and recommended contracts for approval; finish safe pending fixes now**. The [shared contract proposal](../api/applicant-next-five-proposal.md) records choices A–H; no applicant service/schema or real intake was added. Specifications: [FE-08 sign-in](../../tasks/specs/TASK-001-FE-08.md), [FE-09 profile/CV/deletion](../../tasks/specs/TASK-001-FE-09.md), [FE-10 on-site applications](../../tasks/specs/TASK-001-FE-10.md), [FE-11 application updates](../../tasks/specs/TASK-001-FE-11.md), [FE-12 remaining-panel design](../../tasks/specs/TASK-001-FE-12.md). The expanded [panel design](../design/admin/remaining-panels.md) is drafted; owner acceptance and proposed contract approval remain PENDING. These five tasks have started investigation/specification/design; their live implementation is not complete.

Pending previous work: fixed the owner-run integration harness so fixture deletion runs before advisory unlock/connection close and covers partial fixture setup failures. Independent source review resolved the finding. Current [FE-07 review](../../tasks/specs/TASK-001-FE-07-review.md) and [continuation log](../../tasks/specs/TASK-001-CONTINUE-08-12-log.md) distinguish source checks from blocked DB/browser acceptance. Earlier references to absent FE-07 evidence are replaced by explicitly dated current artifacts, not a recreated historical pass. No database command executed.

Real schema3 migrations/integration/recovery, persistence and hydrated browser acceptance remain BLOCKED; fresh browser inventory reports the browser access host unavailable. Full offline Go tests hit the documented sandbox Windows user-identity limitation; affected API tests/vet/integration compilation and frontend50/50/lint/build/types pass. See the continuation log for final HTTP/document evidence. No commit/push/deploy/merge authorized.

✅ means the **stated deliverable is implemented locally**, based on source inspection and linked execution evidence. It does not mean the whole task is accepted, deployed or production-ready. Fresh FE-06/FE-07 offline and HTTP results are recorded in their logs; browser and real-database results remain unverified.

## Completed deliverables

- ✅ Public sample website: homepage, search/filter/sort, job details, closed/404 states and information pages.
- ✅ Shared UI components and responsive panel shells.
- ✅ Connected fictional applicant, admin, recruiter, company and finance journeys, using temporary React-memory data.
- ✅ Stitch-based public/applicant source corrections and local fonts; visual acceptance remains outstanding.
- ✅ Live public API/client, privileged password/TOTP/recovery and super-admin company-management source through FE-05; database/browser acceptance remains outstanding.
- ✅ FE-06 job authoring and FE-07 category/location-management source; real schema-3/persistence/browser acceptance remains outstanding. See [FE-06 log](../../tasks/specs/TASK-001-FE-06-log.md) and [FE-07 log](../../tasks/specs/TASK-001-FE-07-log.md).
- ✅ Local database setup/check helper source and sanitized diagnostics; actual setup/runtime verification remains owner-run.
- ✅ Manual QA checklist with separate sample and live acceptance tracks.

Evidence: [frontend implementation log](../../tasks/specs/TASK-001-FRONTEND-COMPLETE-log.md), [Stitch correction log](../../tasks/specs/TASK-001-STITCH-ALIGN-log.md), [first-five live log](../../tasks/specs/TASK-001-FE-01-05-LIVE-log.md), [setup log](../../tasks/specs/TASK-001-03-log.md), [diagnostics log](../../tasks/specs/TASK-001-DBCHECK-DIAGNOSTICS-log.md) and [QA documentation log](../../tasks/specs/TASK-001-QA-DOC-log.md).

## All 20 frontend tasks

These retain the IDs and dependencies in the [detailed roadmap](../../tasks/specs/TASK-001-FRONTEND-PLAN.md). Source through FE-07 connects live service workflows; actual persistence/browser acceptance remains outstanding. For FE-08 onward, checks refer to sample UI/design or stated automated evidence only. No row is marked fully accepted.

| Task | Built deliverable | Still needed for completion |
| --- | --- | --- |
| FE-01 Public website | ✅ Sample pages and automated/HTTP checks recorded | Responsive/browser/keyboard acceptance and owner design approval |
| FE-02 Shared UI | ✅ Components and panel shell | Browser interaction/accessibility acceptance |
| FE-03 Live public discovery | ✅ API/client and public source | Real database/integration/browser acceptance; remaining metadata eligibility work |
| FE-04 Team sign-in | ✅ Password, TOTP, recovery and session source | Real database/MFA/recovery/browser acceptance |
| FE-05 Companies | ✅ Live super-admin list/create/edit source | Real persistence, conflict and authorization acceptance |
| FE-06 Jobs | ✅ Sample workflow plus live authoring API/editor/preview source | Current schema-3 integration/persistence/browser acceptance; salary deferred by owner |
| FE-07 Categories and locations | ✅ Live create/rename/search/state API and management screen source | Real schema-3 migration/integration/recovery/browser acceptance; only unused entries may deactivate |
| FE-08 Applicant sign-in | ✅ Sample email-code screens | Real email OTP/session service, provider and abuse controls |
| FE-09 Profile, CV and deletion | ✅ Fictional profile/CV controls | Private uploads, content checks, retention/deletion services and policy decisions |
| FE-10 Apply on site | ✅ Sample application journey | Authorized intake, consent, expiry/duplicate enforcement and private CV snapshots |
| FE-11 Applications and updates | ✅ Sample tracker, stages and notifications | Own-data APIs, persistence and real notifications |
| FE-12 Remaining panel design | ✅ Prototype permission/state design matrix | Owner design acceptance and approved live contracts/policies |
| FE-13 Users and assignments | ✅ Sample management workflows | Live provisioning, membership/assignment rules and revocation |
| FE-14 Trust, reports and content | ✅ Sample management/public flows | Live authority/report/content services and approved public policies |
| FE-15 Recruitment oversight | ✅ Sample stages, interviews, notes and sharing | Live services, audit and approved sharing/rejection rules |
| FE-16 Recruiter workspace | ✅ Assigned-job sample workflows | Server-enforced assignment access and persistent recruitment |
| FE-17 Company portal | ✅ Read-only own-company sample projections | Real tenant/projection enforcement and approved rejected-list/sharing rules |
| FE-18 Finance | ✅ Sample invoices, payments, pricing and summaries | Real ledger/numbering/PDF service and approved financial rules |
| FE-19 Settings and activity | ✅ Sample settings, activity and overview | Live settings/audit/summary services |
| FE-20 Full integration and QA | ✅ Historical automated/sample HTTP regression evidence | Remaining service connections, all-role live tests, browser/accessibility/performance evidence, review and owner acceptance |

The 8 November [alignment log](../../tasks/specs/TASK-001-STITCH-ALIGN-log.md) records 47/47 unit tests, lint/build/type checks and both frontend HTTP suites passing. The 4 November live log records offline Go and synthetic live-contract checks. These are dated results, not checks run today. HTTP checks do not establish hydrated browser behavior, real login or database persistence.

## Do next

1. **Finish sample frontend acceptance.** Use [manual QA Track A and shared checks](../qa/manual-acceptance.md) at 375/768/1440 widths, including keyboard/dialog focus, connected journeys and print. A fresh 10 November browser inventory still reports the browser access host unavailable, as recorded in the FE-06 log. Resolve the access blocker/findings and obtain owner design acceptance.
2. **Verify the existing live first five.** Follow the [owner-run setup guide](live-first-five.md), preserve its database/credential restrictions, and record actual migrations/integration, MFA and company persistence outcomes. Real database/recovery and live browser acceptance are still outstanding. Do not treat compiled integration tests as executed tests.
3. **Accept FE-06/FE-07 in the configured local environment.** Owner authorized both source slices on 10 November. Current server requires owner-applied schema3. See [FE-07 spec](../../tasks/specs/TASK-001-FE-07.md), [execution log](../../tasks/specs/TASK-001-FE-07-log.md) and [managed-list contract](../api/managed-lists.md). Then prepare FE-08 applicant email sign-in with approved OTP/session/abuse/delivery contracts.

## Current build: FE-07 categories and locations

Source implements protected create/search/rename, version conflicts, usage counts and reversible active state. IDs/kind stay fixed. No deletion; any job reference prevents deactivation, including drafts/archives. Public filters and new job choices contain active values only. Renaming updates labels through existing joins. Canonical seed labels are unchanged by migrations. Source verification is recorded in the FE-07 log; runtime acceptance is still outstanding.

## Previous build: FE-06 live job management

**Goal:** A fully authenticated super admin can create a job for an existing company, save/edit a draft, preview it, publish it into live public results and archive it. This enables real job entry before later applicant/recruitment features.

**Dependencies:** Accepted live FE-03–FE-05 behavior; approved job payload/errors, deadline/salary/slug/concurrency rules and managed-list reference policy. Keep the existing Go API, query/migration conventions and Next client; no new dependency is proposed. The first task is a concrete specification under the existing 001-11a scope, including exact files and any schema/migration/rollback needs after investigation.

**Proposed scope, in order:**

1. Define super-admin job read/write/preview/publish/archive contracts and inspect existing schema/authorization. Document validation, conflicts and Africa/Mogadishu expiry behavior before code changes.
2. Implement persistent Go endpoints/queries with server-side role, company/list reference, input, destination and publication checks. Use existing Origin/CSRF/session protections.
3. Connect the existing sample job-editor design to live services, with draft/published/archived states and clear validation/loading/error/conflict feedback. Keep sample mode labelled and separate.
4. Verify API behavior, public list/detail consistency and browser journeys; obtain independent review and owner acceptance.

**Acceptance targets:**

- Anonymous, password-only, recruiter and company-admin requests cannot create, edit or publish jobs, including by changing IDs or client role headers.
- Draft/edit changes persist across reload; publishing a valid unexpired job exposes it through the existing live public search/detail; drafts, archived and expired jobs are excluded. Preview remains protected.
- All required fields and four application-method configurations validate on the server. External actions never imply a completed application. Live on-site recruitment remains unavailable until approved authority, intake and privacy safeguards exist.
- Stale edits and invalid references/destinations fail with clear recoverable errors; publishing has no unpaid-invoice gate.
- Meaningful API/integration tests, the established frontend checks and observed browser workflow pass on an identified snapshot. Missing database/browser prerequisites remain BLOCKED.

**Next five specifications now started:** FE-08 applicant email sign-in, FE-09 private profile/CV/deletion, FE-10 on-site applications, FE-11 application updates and FE-12 remaining-panel design. Live source work awaits proposed contract/policy approval and relevant prerequisites. FE-10 real intake additionally requires accepted live FE-14 employer-authority administration and privacy safeguards; it cannot activate merely by finishing FE-08/09. Finance, tenant portals and recruitment writers remain later roadmap work. Salary is explicitly deferred by the owner's 10 November reply.

The earlier checklist-only update lacked separate review; implementation source reviews are recorded in the feature task artifacts. Real database/browser acceptance and final owner approval remain outstanding. FE-06/FE-07 source implementation and the11 November safe test fix were authorized; FE-08–12 specification/contract preparation is authorized, while proposed contract and FE-08–11 implementation approval remain PENDING. Commit, push, deployment and merge authorization PENDING; no release operation performed.
