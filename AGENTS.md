# Engineering entry point

## Verified repository evidence
- Product name: Dalka-Jobs (`README.md`). Product mission and requirements: UNKNOWN.
- At initial discovery, `README.md` was the only tracked file; no application code, package manifests, lockfiles, CI, tests, or deployment configuration existed.
- Stack, versions, frontend/backend boundaries, database, migrations, API contracts, authentication, authorization, validation, and coding conventions: UNKNOWN. Do not choose a stack or scaffold code without an approved task.
- Tenant model and isolation: UNKNOWN, not established as NOT APPLICABLE.

## Workflow documents
- [TASK_SPEC.md](TASK_SPEC.md): evidence, scope, acceptance criteria, and task approval.
- [TASK_EXECUTOR.md](TASK_EXECUTOR.md): controlled implementation and execution evidence.
- [SMALL_TASKS.md](SMALL_TASKS.md): proportionate decomposition and dependencies.
- [PR_REVIEW.md](PR_REVIEW.md): independent review and findings.
- [PR_MERGE.md](PR_MERGE.md): release gates and explicit authorization.

Follow REQUEST → REPOSITORY INVESTIGATION → TASK SPECIFICATION → TASK APPROVAL → SMALL TASK BREAKDOWN → IMPLEMENTATION → TESTING → INDEPENDENT PR REVIEW → ISSUE RESOLUTION → FINAL APPROVAL → AUTHORIZED MERGE → POST-MERGE VERIFICATION. Record future phases PENDING, unavailable phases BLOCKED, and inapplicable phases NOT APPLICABLE with a reason.

## Shared engineering rules
Inspect Git root, branch, status, applicable instructions, and relevant evidence before changes. Use targeted `rg --files` and `rg` searches; reuse valid discovery. Preserve user work. Keep changes small; avoid unrelated refactoring or deletion. Justify new dependencies and reuse established patterns once discovered. Update documentation with verified architecture and commands as they emerge; distinguish declared and resolved versions.

Never expose secrets, change production data, disable security checks, or silently change API/database contracts. Investigate authentication, authorization, input validation, error handling, data integrity, and tenant scoping before affected changes. Define migration and rollback conventions from evidence before database work.

Require explicit user authorization for commits, pushes, destructive operations, deployments, and merges, including main, staging, and production. Task approval does not authorize release. Use the existing isolated checkout; do not create worktrees unless the user explicitly requests them. Use one implementation agent and an independent reviewer when supported and warranted; avoid delegation for trivial work. Parallel scopes must use isolated files and never edit the same files concurrently.

## Available verification
From `/workspace/Dalka-Jobs`: `git status --short`, `git diff --check`, and `git diff` inspect local changes. For new untracked documents, inspect their contents directly; ordinary `git diff` omits them. These are inspection checks, not application tests.
No evidenced build, test, lint, type-check, application startup, or migration command exists. Report these as unavailable, never passed. No services or credentials are evidenced as required yet.

## Definition of Done
Verify acceptance criteria; execute and report relevant checks and limitations; inspect the final diff including untracked files; update documentation; obtain independent review or explicitly mark it BLOCKED; resolve findings; obtain required approvals. Local completion does not imply release completion.
