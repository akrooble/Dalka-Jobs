# Continuation independent review — 11 November 2026

Reviewer: independent read-only agent `review_fe07_completion`, distinct from root implementation agent. Reviewed bounded [approved continuation scope](TASK-001-CONTINUE-08-12.md), actual integration harness correction, [five specs](TASK-001-FE-08.md) through FE-12, [shared proposal](../../docs/api/applicant-next-five-proposal.md), [panel design](../../docs/design/admin/remaining-panels.md), original requirements/roadmap and execution evidence. This approves preparation and source inspection, not applicant implementation, policy decisions or runtime acceptance.

## Findings and resolution

| ID / severity | File / evidence | Problem / expected behavior / fix | Result |
| --- | --- | --- | --- |
| FE07-R1 / MAJOR | integration_test.go, original43/51/77; corrected45/53/73–84 | Function defers preceded fixture cleanup, closing DB/releasing lock too early; cleanup registered after inserts. Register close/unlock/fixtures in testing LIFO order, after safety guards and before inserts. | RESOLVED, independently re-inspected; actual DB execution remains owner-run. |
| DOC-R1 / MINOR | remaining-panels.md:41 | Issue-time invoice allocation read as decided despite open allocation policy. Explicitly label recommendation proposed for owner review. | RESOLVED, reviewer confirmed final text. |
| DOC-R2 / MINOR | continuation spec scope/expected files; log's unsaved-buffer evidence | Spec expected guide edits while log preserves active unsaved guide. Align scope to task-board/roadmap navigation and leave guide untouched. | RESOLVED, reviewer confirmed. |

## Coverage and verification

Five specifications include all required fields, bounded small tasks, measurable acceptance, dependencies, risks and truthful lifecycle states. Proposals A–H are concrete and explicitly unapproved. Known email-only/terminal-development exception, private PDF/.docx cap, retention/backup requirements retained; no provider/dependency/migration silently approved. FE-10 hard-gated on accepted FE-14 authority administration plus privacy services. Session privilege separation, own-data/assigned/company projections, Submitted hiding, rejected/sharing/note gates and financial applicant exclusion preserved. No applicant runtime source changes in this batch; implementation-specific race/performance/runtime tests for proposed services NOT APPLICABLE to this document deliverable and remain future gates.

Independent affected API tests/vet/integration compile PASS, frontend API-client 9/9 PASS;21/21 local document targets then present resolved; whitespace PASS with existing CRLF notices. Root's broader frontend50/50/lint/build/typecheck and three HTTP suites are separately reported in log. Full Go offline suite FAILS at sandbox current-user lookup in synthetic Windows key ACL test; no guard weakened. No DB/setup/credential/service/migration operation executed.

Reviewed authentication/authorization/data leakage/tenant projection, mutation lifecycle, transactional cleanup/concurrency, migration compatibility boundaries, input/error constraints, test meaning and unnecessary scope against source and docs. No remaining actionable finding in this bounded delivery. DB cleanup itself, real migration/recovery/persistence/browser acceptance remain BLOCKED; contract/design owner approval, future implementation/review and release remain PENDING. Source/document review approval cannot close those gates.

APPROVED
