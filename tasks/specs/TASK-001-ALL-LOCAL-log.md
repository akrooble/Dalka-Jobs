# Local roadmap execution — 23 November 2026

Approval: owner “do it all” following the twenty-task status list. See `TASK-001-ALL-LOCAL.md`. Existing modified/untracked work preserved. No new worktree, release or DB/credential operation.

| Slice | Dependencies / expected files | Verification / acceptance | Status |
| --- | --- | --- | --- |
| ALL-1 Applicant sign-in | FE-08, local A/B; auth/schema/query/session/client/account files | Offline security/regression checks passed; owner DB/browser and real provider/policy unverified | SOURCE IMPLEMENTED; runtime acceptance BLOCKED |
| ALL-2 Profile and private-file lifecycle | ALL-1, C/D/E; profile/file/retention services and UI | Profile/version and fresh-code profile/identity/session deletion source reviewed; CV/intake unavailable | PARTIAL; file/scanner/storage/restore prerequisites BLOCKED |
| ALL-3 Authority, intake and updates | ALL-2, FE-14, F/G/H; authority/application/events/notifications | Required privacy/private files, employer-authority and event contracts not available | UNIMPLEMENTED; prerequisites/decisions BLOCKED |
| ALL-4 Remaining team/company/recruitment services | FE-12–17; role/projection/assignment/audit APIs and UI | Team directory/state, assignment source and scoped job reads reviewed; no candidate writers/projections | PARTIAL; recruitment/membership/sharing decisions PENDING |
| ALL-5 Finance/settings | FE-18/19; ledger/PDF/settings/audit APIs and UI | Actual overview counts/minimal activity source; finance/PDF/settings source absent | PARTIAL; remaining product decisions PENDING |
| ALL-6 Integrated acceptance | All above, FE-01–07/20 checks | Offline/source checks passed, browser unavailable and DB owner-run; all20 not accepted | PARTIAL; full acceptance BLOCKED |

Initial read-only independent review identified session-subject constraints, lock order, anonymous/challenge TTL mismatch, persisted rejected attempts, strict email syntax and every account route's sample fallback. These are implementation requirements, not completed checks.

## Implemented source and review

Added migrations000004–000006 without executing them: separate applicant identities and exclusive session subject; keyed purpose/session/identity challenge digests; persisted challenge/identity/peer limits, resend invalidation and rotation; own profile/version/location checks and fresh-code deletion for the current service without accepted files/applications; account version/state revocation, recruiter assignments, scoped job reads and minimal ID/time activity. Regenerated sqlc after SQL changes. New server refuses schema other than clean6; recovery/down risks documented. No new dependency selected.

All live account/admin/role routes dynamically use verified sessions and role guards. Actual missing services show unavailable state; they never perform sample transactions in live mode. Sample mode still renders fictional journeys separately. Profile and deletion challenges survive a focus round trip to the operator terminal. SessionCoordinator abort/generation tests protect successful sign-in/logout/deletion from late reads. Workspace access revalidation remounts protected data even if token/role stay unchanged, fetching current assignment scope again.

Independent reviewer reported AUTH-R1 focus challenge loss, AUTH-R2 missing hourly limiter cases, AUTH-R3 stale session read race, PROFILE-R1 lost save notice and OPS-R1 retained revoked job rows. All resolved in source, with deferred unit cases and owner-only DB integration source expanded. [Review](TASK-001-ALL-LOCAL-review.md) ends BLOCKED for full roadmap acceptance, not because a concrete bounded-source finding remains. A later reviewer follow-up hit the service usage limit; final HTTP/header/404 regression fixes and documentation updates therefore have implementation-agent checks only, not additional independent approval.

HTTP regression initially found dynamic unknown admin/account routes streaming200 before `notFound`, and live applicant header/footer using sample labels. Added shared route inventory validation in the Next proxy before streaming and route-inventory unit assertions; corrected live account/team header/footer mode and live header text. Reran affected production build and HTTP checks. Existing source inventories still validate routes in page modules; no role/header trust was introduced.

## Actual verification

| Command / context | Actual result | Limit |
| --- | --- | --- |
| `go test ./...` / api, sandbox | FAIL only `TestSyntheticKeyWithSpacesAndPunctuation`: Windows current-user lookup unavailable | Initial failure preserved; no ACL weakening |
| `go test -count=1 ./internal/config` / api, auto-approved normal Windows user execution | PASS | Inspected test first: temporary synthetic key files/ACLs only; no real credentials/DB |
| `go test -count=1 ./...` / api, same normal Windows execution | PASS all offline packages | Separate actual uncached run; integration build tag excluded; not a relabelled sandbox pass |
| `go vet ./...` / api | PASS | Static/offline only |
| `go test -tags=integration -run '^$' ./internal/httpapi` / api | PASS | Compilation only; zero database tests executed |
| sqlc regeneration twice / root | PASS; generated files unchanged on regeneration | No database connection |
| `npm.cmd run test:unit` / web | PASS60/60 | Includes four deferred session race tests and workspace route inventory; existing nonfatal Node module-type warnings |
| `npm.cmd run lint` / web | PASS | Current source; final routine check recorded below |
| `npm.cmd run build` / web | PASS |52 static pages plus dynamic account/admin/role/public routes; no deployed service |
| `npm.cmd run typecheck` / web | PASS | Uses generated Next type files |
| `npm.cmd run test:frontend-http` / web, owned sample server3100 | PASS39 pages/71 internal destinations/six expected404s | SSR/HTTP and fictional projection regression, no API/DB |
| `npm.cmd run test:live-http` / web, owned live shell3101 + temporary synthetic upstream8081 | PASS | Public and all account/admin/role shells without fixture fallback; origin/body/cookie/identity checks. No Go/DB or hydrated browser |
| `npm.cmd run test:prototype-http` / web | PASS50 pages/57 destinations/five expected404s | SSR/HTTP only; no API/DB |
| CUA browser inventory | BLOCKED: browser access host unavailable; no browser surfaces | No UI, viewport, keyboard, visual acceptance or hydration pass claimed |
| Publish-candidate filename/token scan | PASS248 candidate files, no sensitive paths/private-key/GitHub/AWS token patterns | Pattern scan, not a guarantee against every possible secret; actual `.env`/keys not opened |

The initial staged whitespace check also exposed pre-existing trailing whitespace in two vendored OFL text files and an extra final blank line in a historical log; normalized whitespace only for publication. License wording preserved. Local screenshots, PDF and earlier QA backup snapshots remain unstaged; existing user work is preserved.

Final routine frontend lint/typecheck/build checks PASS. The source snapshot helper initially used a .NET API unavailable in Windows PowerShell; its first output was discarded and regenerated with the compatible byte-to-hex conversion and strict64-character digest validation. Final162 source digests use UTF-8/LF normalization;144 relative Markdown targets resolve in the publishable Git tree. No failing helper result is counted as a pass.

## Remaining dependencies and authorization

Owner was asked asynchronously for production email provider, private CV storage/scanner and approved policy/controller/contact text. No response supplying those prerequisites is evidenced. [Remaining decision register](../../docs/api/remaining-contracts-proposal.md) makes additional authority, membership, notes/sharing/rejection, finance and audit/settings rules concrete. These remaining services are unimplemented; no all20 completion claim. Actual schema/migration/recovery/integration remain owner-run; no database, setup, dbcheck, key creation, bootstrap, real intake or external delivery executed.

The later owner request **“complete the taska and also update my githup repo”** authorizes normal commit/push of the current source to `task/001-03b-local-database` and a draft PR in `akrooble/Dalka-Jobs`; see [publication specification](TASK-001-GITHUB-UPDATE.md). This supersedes earlier commit/push restrictions for that task-branch update only. Main merge/deployment remain unauthorized. GitHub connector verified main at6f521c7, push permission, no current task branch and no open PR before publishing. Staging found an inactive index.lock dated3November with no Git process running; its bytes were preserved in ignored `.local/github-update/index-lock-2026-11-03.backup` before normal staging, without deleting the index or source.

Lifecycle: approved local source slices implemented and reviewed with findings resolved; offline tests/checks recorded above. Full roadmap implementation/DB/browser/owner final acceptance BLOCKED/PENDING. Commit/push/draft publication IN PROGRESS under the later authorization; merge/deploy PENDING and unauthorized; post-merge NOT APPLICABLE because no merge requested. Final publication readback evidence belongs in the publication log/PR and user report.
