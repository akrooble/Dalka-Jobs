# TASK-001-GITHUB-UPDATE — publish the current local source branch

## Task ID / Title / Type / Priority
TASK-001-GITHUB-UPDATE / Update the owner's GitHub repository / Repository publication / Owner requested23 November2026.

## Problem Statement / Current Behavior / Expected Behavior
Owner requested “complete the taska and also update my githup repo” while roadmap work was active. Local branch `task/001-03b-local-database` contains earlier uncommitted application/setup/frontend source plus the current applicant/team additions. GitHub `akrooble/Dalka-Jobs` currently has main at local base6f521c7 and no current task branch. Publish the tested local source/progress to this task branch and prepare a draft PR with honest incomplete acceptance/status.

## Root Cause / Repository Evidence
Unpublished local work, not an application defect. Evidence: Git root/branch/status/log/tracked/untracked inventory; GitHub connector confirms repository push permission, default main, main base6f521c7 and no open PR. Existing source needs its earlier untracked API/web/docs/scripts dependencies included for a coherent branch.

## Scope / Out of Scope
Commit/push reviewed publish candidates from `.gitignore`, `.env.example`, README, api/web/docs/scripts/tasks and tool-versions.json, preserving earlier source. Exclude local output snapshots, PDFs/screenshots, credentials, `.env`, `.local`, caches, installed tools/dependencies and runtime uploads. Create a draft PR to main for review. No force push, history rewrite, main merge, deployment, DB/setup/key/credential operation or claim that all twenty tasks are complete.

## Affected Components / Expected Files
Current source tree and task/API/development documentation; Git index/local commit/current task-branch remote ref; draft PR description. Original tracked design references unchanged. No application source added solely for GitHub publication.

## Database / API / Security / Tenant Impact
No database/API operation from publication itself. Migration4–6 source is owner-applied/unverified; CI/browser/DB/recovery and full tenant acceptance remain explicit gates. Public repository: inspect exact staged paths and scan publish candidates for sensitive filenames and private-key/GitHub/AWS token patterns without printing values; do not read real secrets. Local-only diagnostics/output remain unstaged.

## Implementation Approach / Edge Cases
Finish affected regression fixes/checks, reconcile status docs, stage exact allowed roots, inspect final staged diff/stat/new file content including untracked source, commit without disabling hooks and push normally to the current task branch. Reconcile unexpected remote changes without force; preserve unrelated work. Use Git for faithful local commit/binary source history and the GitHub connector for repository/PR verification. Verify remote head equals local commit after push. Draft PR records all missing acceptance.

## Test Plan / Acceptance Criteria
Offline Go tests/vet and integration compilation; frontend60 unit tests/lint/build/typecheck and sample/prototype/live synthetic HTTP checks; generated SQL determinism; staged whitespace/path/secret checks. Existing runtime caveats retained. Acceptance for this publication slice: intended source is committed on the current task branch, pushed to the correct remote and read back at matching SHA, with a reviewable draft PR. Full roadmap acceptance remains blocked independently.

## Risks / Dependencies / Estimated Complexity
Medium publication scope because earlier application source is untracked. Excluding local output and inspecting staged names avoids accidental publication of diagnostics or credentials. Requires current tests, remote access and Git index/commit write permission; no credentials are extracted from the connector.

## Approval / Lifecycle
The owner's23 November request to update GitHub authorizes the necessary local commit and normal task-branch push/draft PR. This supersedes earlier no-commit/no-push status for this operation only. Request/investigation/specification/task approval COMPLETE; final checks/index inspection/commit/push/readback/draft PR PENDING. Main merge/deployment remain unauthorized; post-merge NOT APPLICABLE because no merge is requested.
