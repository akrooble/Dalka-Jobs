# Independent local roadmap review - 23 November 2026

## Scope and authority

Independent reviewer: `/root/independent_review`; implementation agent: `/root`. Reviewed under `AGENTS.md` and `PR_REVIEW.md`, against [ALL-LOCAL](TASK-001-ALL-LOCAL.md), [OPERATIONS](TASK-001-OPERATIONS.md), FE-08/09 specifications, the shared applicant proposal and the current API contracts. The owner's "do it all" authorizes local implementation; it does not authorize release, owner-only database operations or real applicant intake with missing prerequisites.

This review covers the implemented local applicant authentication, profile/deletion and team/workspace foundation. It does not certify completion of all twenty frontend tasks. Source was read directly, including untracked files that ordinary `git diff` omits. Existing unrelated modified/untracked work was preserved. The reviewer performed no database, setup, migration, key, credential, browser or external delivery operation and edited only this review document.

## Reviewed evidence

- API credential/source: `api/internal/auth/applicant.go`, `applicant_test.go`; existing `crypto.go` and configuration/session conventions.
- API handlers/guards: `api/internal/httpapi/api.go`, `sessions.go`, `applicant_auth.go`, `applicant_auth_test.go`, `applicant_profile.go`, `applicant_profile_test.go`, `team_operations.go`.
- Owner-only integration source: `api/internal/httpapi/integration_test.go` and `applicant_integration_test.go`, including disposable-target/empty-state guards, advisory-lock lifetime, fixture cleanup ordering and the added applicant/team cases.
- Schema: migration `000004_applicant_identity`, `000005_applicant_profile` and `000006_team_operations`, each up/down source; existing session/account/job/list schema used as compatibility evidence.
- Queries/generated store: `api/queries/applicants.sql`, `profiles.sql`, relevant `first_five.sql`; generated `api/internal/store/models.go`, `applicants.sql.go`, `profiles.sql.go`, session/account query integration and `db.go` conventions. Generated source was inspected; regeneration was performed by the implementation agent, not independently rerun by this reviewer.
- Startup: `api/cmd/server/main.go`, explicit synthetic development sender selection and schema-version refusal.
- Browser API/session boundary: `web/lib/api/client.ts`, `web/lib/session/client.ts`, `coordinator.ts`, existing Next API forwarding boundary, `web/tests/api-client.test.ts`, `session-coordinator.test.ts` and the package unit-test command.
- UI/routes: `web/components/applicant/account.tsx`, `profile.tsx`, `web/components/privileged-auth/sign-in.tsx`, `web/components/workspace/live-workspace.tsx`; account root/section, admin root/catchall and company/recruiter workspace route files.
- Contracts: `docs/api/applicant-auth.md`, `applicant-profile.md`, `team-operations.md`, `applicant-next-five-proposal.md`; remaining-panel design and prior task-board/execution evidence for dependency boundaries. Final implementation-agent documentation updates remain that agent's responsibility.

## Findings and resolution

### AUTH-R1 - MAJOR - resolved in source

Original location: `web/components/applicant/account.tsx:25` in the first reviewed revision. Focus/visibility refresh cleared the session, unmounting the sign-in component and losing its challenge. Reproduction: request a local code, switch to the operator terminal, return to the browser; verification returned to the email form. Expected: retain the anonymous challenge while checking the same session, and clear it if subject/CSRF changes. The implementation keeps the sign-in component mounted and keys it by CSRF; private applicant children are hidden/inert during revalidation. Current integration is at lines 26-47 and the account rendering branch. Resolved by source reinspection; actual focus/browser acceptance remains outstanding.

### AUTH-R2 - MINOR - resolved in test source

Original location: `api/internal/httpapi/applicant_integration_test.go:132` onward in the first reviewed revision. Tests covered challenge attempts/resend floor but omitted the claimed hourly identity/peer caps and reset/concurrent cases. Expected: meaningful owner-only assertions for these persisted security boundaries. Added cases cover identity send/verify budgets, time-window reset, peer send/verify budgets across browsers and concurrent resend serialization. Integration compilation passed. These database tests have not been executed, so their runtime outcomes remain unverified.

### AUTH-R3 - MAJOR - resolved in source and offline tests

Original location: `web/components/applicant/account.tsx:29` in the second reviewed revision. Focus reads could complete after verification/logout/deletion and overwrite newer session state. Reproduction: hold an old session response, complete the session-changing action, then release the old response. Expected: stale responses cannot restore or replace current authority. `web/lib/session/coordinator.ts` now combines abort with generation checks, excludes refreshes during mutations and prevents updates after disposal. Account verification/logout/deletion/retry use that coordinator. Four independently executed deferred-promise tests cover the reported stale-read paths, write exclusion, failed-read clearing and disposal. No remaining defect identified in the reviewed integration.

### PROFILE-R1 - MINOR - resolved in source

Original location: `web/components/applicant/profile.tsx:18,24` in the first profile revision. Saving incremented the editor key and remounted it, immediately clearing its local success notice. Expected: a persistent accessible save confirmation. The notice now lives above the keyed editor in `LiveApplicantProfile` at current lines 16-20. Source reinspection confirms that remounting the editor no longer discards the notice. Browser announcement acceptance remains outstanding.

### OPS-R1 - MAJOR - resolved in source

Original location: `web/components/workspace/live-workspace.tsx:23,32` before the final revision. Focus refresh checked session role/CSRF but retained previously fetched assigned-job rows; assignment revocation does not change a valid recruiter's CSRF. Reproduction: revoke assignment in another session, then refocus the recruiter workspace. Expected: current scope must be fetched again and revoked rows must disappear. The coordinator acceptance callback now increments `accessRevision`; the protected subtree key includes CSRF, access revision, area, section and selected job. The subtree stays hidden/inert during checking and remounts with fresh empty/loading state after successful revalidation. Current lines 22-32 were independently reinspected. Actual two-session hydrated-browser acceptance remains outstanding.

## Security and correctness assessment

No unresolved concrete source finding was identified within the reviewed bounded slices after these fixes. This statement is not full feature acceptance.

Applicant identities remain separate from privileged accounts, including matching emails. Exclusive schema/session subject checks, privileged password/TOTP guards, strict client session shapes and explicit account switching preserve the privilege boundary. OTPs use cryptographic randomness and keyed purpose/identity/session/challenge binding; expiry, resend invalidation, one-use rotation and persisted rejected-attempt counters are explicit. The anonymous lifetime extension resolves the original five-minute session versus ten-minute challenge mismatch. Default delivery is disabled; the explicit terminal adapter accepts synthetic `.invalid` addresses only and never sends external email.

Profile queries derive ownership from the server session, version stale writes, validate bounded plain text/contact data and require an active location reference. Deletion obtains identity before applicant/session/challenge locks, verifies a fresh purpose-bound code, then atomically removes profile/contact identity, revokes applicant sessions/challenges and records an ID/time receipt. Receipt completion is valid only for the current service without accepted files/applications; future file/intake work must extend purge/recovery before claiming completion. Existing matching privileged accounts are independent.

Team operations require a fully verified super admin, preserve owner/self protection, use version checks and revoke target sessions/assignments on deactivation. Account-before-session and account-before-assignment ordering was inspected. Recruiter and company job DTOs use server-selected role plus current assignment/own-company predicates; direct foreign/missing selections have the same missing response. No candidate contact/CV/private notes enter those DTOs. Activity allowlists IDs/action/times; the local 30-day read expiry is explicitly a development convention, not approved production audit retention.

Migrations are additive source only, preserve earlier identities/accounts/jobs/lists and document schema refusal/recovery risks. Down source is destructive, untested and unauthorized. Concurrency/persistence/migration behavior remains unproven without actual disposable database execution. No new dependency was introduced in these slices. Public contracts and privileged regressions were inspected only where affected; this is not a fresh audit of every pre-existing feature.

## Independently executed checks

All Go commands below ran from `api/` with an ignored workspace-local `GOCACHE`; none connected to a database.

| Check | Actual reviewer result | Limit |
| --- | --- | --- |
| `go test -count=1 ./internal/auth ./internal/httpapi` | PASS on applicant-auth and updated profile snapshots | Offline tests only |
| `go vet ./internal/auth ./internal/httpapi` | PASS on those snapshots | Static analysis only |
| `go test -count=1 ./internal/httpapi` | PASS on team-operations snapshot | Offline HTTP/source boundary tests |
| `go vet ./internal/httpapi` | PASS on team-operations snapshot | Static analysis only |
| `go test -tags=integration -run '^$' ./internal/httpapi` | PASS after relevant source additions | Compilation only; zero DB tests executed |
| `node --experimental-strip-types --test tests/session-coordinator.test.ts` from `web/` | PASS 4/4 | Deferred asynchronous unit cases; existing nonfatal module-type warning |
| `git diff --check` from root | PASS at final source reinspection | Existing CRLF notices; does not inspect new untracked file contents |

The reviewer did not independently rerun the entire Go suite or frontend build/lint/typecheck/HTTP suites. Their actual implementation-agent outcomes belong in the execution log. The initial sandbox full-suite attempt failed on current-user/SID ACL lookup and remains recorded as that failed attempt. The implementation agent subsequently reported an auto-reviewed escalation using normal Windows user access: the isolated configuration test and a separate uncached `go test -count=1 ./...` both actually passed, without source/security weakening, integration tags, database execution or real credential access. That later full-suite pass is separate evidence; the reviewer has not independently rerun it. Source inspection and compiled integration cases do not establish migration success, persisted MFA/deletion/tenant behavior, browser hydration, focus, accessibility or responsive layout.

## Outstanding acceptance and lifecycle

- Full roadmap source remains incomplete: private CV validation/quarantine/scanning/storage and crash/restore lifecycle; employer authority and on-site intake; persistent application/stage/interview/notification services; later recruitment/company projections; finance/PDF/settings and complete integration/QA still need their scoped implementation and acceptance.
- Real applicant intake/external delivery requires the owner's approved privacy/terms/consent/controller/contact details, provider/sender configuration, private storage/scanner decisions and verified retention/backup/restore safeguards. Local synthetic contracts do not supply those missing prerequisites.
- Actual owner-run schema/migration/integration/recovery/persistence tests remain unexecuted. Browser acceptance at 375/768/1440, keyboard/focus, visual design acceptance and two-session revocation flows lack observed evidence in this review.
- Independent source review and issue-resolution work is recorded above; final owner acceptance is PENDING. Commit, push, deployment, merge and post-merge verification are PENDING and unauthorized. Local source progress does not imply release completion.

BLOCKED
