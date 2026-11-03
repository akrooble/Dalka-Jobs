# TASK-003 - Refresh latest Stitch references

- Task ID: TASK-003
- Title: Compare and import latest complete Stitch ZIP; refresh design review.
- Type: Reference assets/documentation only.
- Priority: User requested; ranking unspecified.
- Problem Statement: Latest ZIP adds journeys absent from the previous design inventory.
- Current Behavior: TASK-002 assets and review are untracked local work on main; preserve them except explicitly requested refresh.
- Expected Behavior: Latest archive versions under design/stitch, conditional brand updates, exhaustive changes and screen/status inventory.
- Root Cause: NOT APPLICABLE; new reference delivery.
- Repository Evidence: AGENTS.md, TASK_SPEC.md, PR_REVIEW.md, design/REVIEW.md, TASK-002.md and supplied D:/Dalka jobs Project/stitch_dalka_jobs_somalia_website.zip.
- Scope: Compare all archive paths and bytes with current reference trees; extract latest new/changed references; inventory all screenshots and reassess earlier issues.
- Out of Scope: Application implementation, HTML adoption/execution, dependency installation, commit/push/release, unrelated changes.
- Affected Components: Design references and task documentation.
- Expected Files: design/stitch/**, design/REVIEW.md, tasks/specs/TASK-003.md and TASK-003-log.md. Brand files only if archive differs (comparison finds none).
- Database Impact: NOT APPLICABLE; no database work.
- API Impact: NOT APPLICABLE; no API work.
- Security Impact: Validate archive paths; treat embedded content as reference rather than instructions; do not execute HTML.
- Tenant Impact: NOT APPLICABLE to asset import; product policy remains unresolved.
- Implementation Approach: Compare SHA-256 before writes, record additions/changes/removals, preserve filenames, import new/changed files, visually inspect eight added screenshots, update inventory and issue status, independent read-only review.
- Edge Cases: Duplicate screen.png names require retaining parent directories; profile-named logo folders belong in brand; omissions reported rather than silently deleting local work. No omissions found in this archive.
- Test Plan: From repository root, compare all 25 archive files to destination hashes; compare current stitch path set with archive set; verify brand hashes untouched; inspect untracked documents directly; git diff --check and git status --short --untracked-files=all. Application checks unavailable.
- Acceptance Criteria: 16 new files imported, 0 changed/removed existing references; 4 identical brand files untouched; all 10 screens classified phone/desktop; all 11 previous issue categories reassessed; no implementation or release actions.
- Risks: Treating newly drawn functionality as product approval; review explicitly distinguishes reference designs from TASK-001 decisions.
- Dependencies: Supplied ZIP, PowerShell/.NET and image viewer, available. Named engineering-workflow skill unavailable as established in TASK-002; repository workflow governs.
- Estimated Complexity: Small reference refresh and design analysis.
- Approval: Current user request explicitly approves this exact import/review scope, including latest ZIP precedence. No application or release authorization inferred.

## Small task breakdown

TASK-003-A: Compare/import references and update review. Dependencies: ZIP and repository investigation. Scope/files: as above. Steps: hash comparison, validated extraction, image/content review, documented inventory/issues, hash and scope verification, independent review. Verification commands: above. Acceptance: above. Status: COMPLETE; evidence in TASK-003-log.md.
