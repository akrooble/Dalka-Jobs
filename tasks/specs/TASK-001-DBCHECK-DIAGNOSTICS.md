# App-role database verification diagnostics

## Task ID / Title / Type / Priority
TASK-001-DBCHECK-DIAGNOSTICS. Explain the owner-reported check-db.ps1 failure with safe actionable diagnostics. Bug fix, current owner blocker.

## Problem Statement / Current Behavior
Owner reports `dalka_dev database verification failed` from check-db.ps1. Wrapper uses go run and maps every failure to one exception. dbcheck collapses configuration, connection, metadata and combined role/permission checks into exit1. The pasted message cannot identify a root cause.

## Expected Behavior / Root Cause
The wrapper builds before running, preserves helper exit codes and maps only fixed allowlisted reasons, including which fixed project database failed. Split the read-only combined checks without weakening any predicate. Actual environment/server cause remains UNKNOWN until an owner-run diagnostic result. The confirmed reporting defect is generic exit/error collapse.

## Repository Evidence
scripts/check-db.ps1; api/cmd/dbcheck/main.go; api/internal/localdb/; existing localsetup refusal-code pattern; TASK-001-03.md and Windows notes; AGENTS.md/TASK_SPEC.md/PR_REVIEW.md. Existing branch/work preserved.

## Scope / Implementation Approach / Affected Components / Expected Files
Only dbcheck main.go and new diagnostics/tests, check-db.ps1, Windows/live-first-five notes, this spec/log. Preserve strict dotenv parsing, fixed loopback role/DB/version guards and all role/ownership/membership/PUBLIC CONNECT checks. Classify connection failures via SQLSTATE/network types into fixed strings; never echo arbitrary errors. Wrapper compiles to ignored .local output, captures child/build output and maps true exit codes; no secrets in argv/output.

## Out of Scope / Database Impact / API Impact / Security Impact / Tenant Impact
No database/service/configuration mutation or agent-run database connection/check/setup, no actual .env/key/credential reading, no password reset/resource deletion, no version/permission bypass, no dependency/API/tenant behavior change, no release. User-run verifier remains read-only. Sanitized diagnostics reduce credential disclosure risk.

## Edge Cases / Risks / Dependencies / Estimated Complexity
Missing/invalid .env, unavailable tool/build/cache, wrong password/missing database, network refusal/timeout, unsupported server, role/owner/membership/ACL mismatch, failed metadata/SELECT1. Fail closed with static messages for unknown errors. Existing pinned Go/PowerShell required. Small bounded reporting fix; actual server state cannot be inferred from code tests.

## Test Plan / Acceptance Criteria
Offline Go tests/vet/build of dbcheck only, synthetic SQLSTATE/network/redaction/guard cases and PowerShell parser/message parity. git diff --check and direct new-file review; independent source review. Do not execute check-db/helper/setup or read actual credentials. Each retained guard has a distinct safe diagnostic; both fixed database phases distinguishable; unknown exit maps to generic safe refusal. Owner rerun supplies exact code, never secret contents. Runtime root cause/acceptance BLOCKED until owner run.

## Approval / Small Task / Lifecycle
Owner reported this failure while following the approved first-five setup; this authorises bounded diagnosis/reporting repair, no service or security-policy changes. DB-DIAG-01: inspect code; implement fixed codes and true-exit wrapper; offline test/parser/build; docs/review. REQUEST/INVESTIGATION/SPECIFICATION/TASK APPROVAL/BREAKDOWN/DIAGNOSTIC IMPLEMENTATION/OFFLINE TESTING COMPLETE. Independent source review APPROVED; no actionable findings. Runtime diagnosis BLOCKED owner-run; no DB connection/check executed by agent. Final owner acceptance and all releases PENDING/unauthorised.
