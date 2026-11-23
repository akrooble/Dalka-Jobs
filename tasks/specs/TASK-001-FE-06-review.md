# FE-06 independent review — 10 November 2026

Reviewer: independent read-only `review_fe06` agent. This document records its final report; parent self-inspection is not treated as independent approval. Reviewed the approved specification, actual implementation including untracked files, migration/query/generated source, API contract, final documentation and verification evidence.

## Findings — all resolved

| ID / severity | File and line | Problem / reproduction evidence | Expected behavior / recommended fix / verified resolution |
| --- | --- | --- | --- |
| FE06-R1 / MAJOR | `web/components/jobs/job-manager.tsx:61`, 71, 91, 98 | A new draft saved on the ID-less editor could lose persisted identity when a later error triggered reload; the original load still used null route ID. | Reload saved ID, retain identity and navigate to stable editor URL. Verified router replacement and explicit saved-ID reload state; browser regression remains unobserved. |
| FE06-R2 / MAJOR | `api/internal/httpapi/jobs.go:61` | Go's IP parser rejected shortened/hex IPv4 strings as IPs, allowing the URL guard to accept destinations browsers normalize to loopback; trailing-dot private hosts also passed. | Reject ambiguous IP/private-host conventions. Verified DNS-label/TLD/trailing-dot guards and independent affected Go regression tests. |
| FE06-R3 / MINOR | `web/components/jobs/job-manager.tsx:65`, 81, 104 | Company-search retry reused whole-editor revision, clearing unrelated unsaved title/description. | Retry company query only. Verified independent companyRevision refresh state; browser regression remains unobserved. |
| FE06-R4 / MINOR | `tasks/specs/TASK-001-FE-06.md:24` | Database impact omitted added first_published_at column/backfill. | Document actual schema, conservative archived backfill and ordering semantics. Verified specification matches migration. |
| FE06-R5 / MINOR | `docs/qa/manual-acceptance.md:10`, 12; `docs/development/task-board.md:48` | Track B still excluded authoring/listed old entry points; checklist said browser availability had not been retested after the fresh failure. | Include FE-06/schema-2/entry points and current browser evidence. Verified corrected scope/status. |
| FE06-R6 / MAJOR | `web/app/page.tsx:12`, 27; `web/components/live-job-detail.tsx:18`, 20 | Publishing and opening live public pages inherited banners claiming jobs were fictional and reset on refresh. | Pass live presentation through public home/detail/error paths. Verified corrected copy and extended synthetic public-page assertions; sample defaults retained. |

No remaining actionable source or documentation findings reported in the final independent review.

## Coverage and checks

Covered functional/business rules, authorization/MFA/CSRF, tenant boundaries (only super-admin global authoring; no candidate services), reference integrity and locks, transactions/concurrent version updates, validation/error handling, stable URLs/publication ordering/expiry, protected previews, UI recovery, API compatibility, sample/live separation, test quality and maintainability. Job queries are parameterized and lists bounded; production load/performance and real DB races were not measured. Existing public wire shape is preserved despite regenerated query metadata. Applicant/CV/finance retention services are outside this increment and no real applicant intake is enabled.

Reviewer independently passed affected Go tests/vet, integration compilation only, 49 frontend unit tests and whitespace inspection. Parent supplied final passing lint/build/types, preview HTTP (39 pages / 69 destinations / six expected 404s), prototype HTTP (50 / 57 / five), synthetic live HTTP after final corrections and byte-for-byte sqlc regeneration. Exact commands/limits are in the [execution log](TASK-001-FE-06-log.md); tested source hashes are in the [snapshot manifest](TASK-001-FE-06-source-sha256.txt).

Reviewer performed no DB/credential/migration/service operation or integration execution. Parent also performed no DB setup/migration/key/bootstrap/real integration operation. Real schema-2 migration, persistence, recovery and browser/mobile/keyboard workflows remain unverified. Fresh browser inventory reports host unavailable; synthetic checks cannot satisfy runtime acceptance. Final owner/release approval remains pending.

BLOCKED
