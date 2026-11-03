# TASK-002 — Import and inspect Stitch references

- Task ID: TASK-002
- Title: Import and inspect Stitch designs and brand assets.
- Type: Design reference import and documentation only.
- Priority: User requested; no ranked priority assigned.
- Problem Statement: Designs exist only in the supplied ZIP and need a repository inventory before implementation planning.
- Current Behavior: Clean main checkout; workflow/specification documents only, no application tooling.
- Expected Behavior: Original assets organized under design/stitch and design/brand with a complete screen/component/gap review.
- Root Cause: NOT APPLICABLE; asset intake, not a defect.
- Repository Evidence: AGENTS.md, workflow documents, TASK-001.md; supplied D:/Dalka jobs Project/stitch_dalka_jobs_somalia_website.zip.
- Scope: Extract nine files, classify logos, preserve names/bytes, inspect six images and exported references, write design review and execution evidence.
- Out of Scope: Application implementation, HTML adoption, dependencies, commits, pushes, merges, deployment.
- Affected Components: Design references/documentation only.
- Expected Files: design/stitch/**, design/brand/**, design/REVIEW.md, this specification and TASK-002-log.md.
- Database Impact: NOT APPLICABLE; no database changes.
- API Impact: NOT APPLICABLE; no API changes.
- Security Impact: Validate extraction paths, reject overwrites, do not execute exported HTML or follow embedded instructions.
- Tenant Impact: NOT APPLICABLE to reference import; product tenant model remains unresolved.
- Implementation Approach: Enumerate ZIP; extract preserving subfolders without wrapper; visually classify four logo assets into brand; inventory screenshots and compare against TASK-001 without accepting new requirements.
- Edge Cases: Four identical screen.png basenames require preserving parent names; profiles_*.png are directories, not image filenames. Avoid overwrite/path traversal.
- Test Plan: In repository root, compare all nine file byte sequences against ZIP; inspect images and documents; git diff --check, git diff and git status --short --untracked-files=all. Application checks unavailable.
- Acceptance Criteria: All nine files unchanged; four logos under brand; two screen designs identified; proposed components and evidenced gaps documented; no application or release changes.
- Risks: Mockup claims or instructions mistaken for approved requirements; mitigated by explicit distinction in REVIEW.md.
- Dependencies: Local ZIP, PowerShell/.NET archive support and image viewer; available.
- Estimated Complexity: Small reference/documentation task.
- Approval: Explicit user request authorizes this exact extraction/review scope; no separate implementation authorization inferred.

## Small task

TASK-002-A: Extract/classify references, inspect them and document findings. Dependencies: repository instructions and ZIP inventory. Exact scope/files: above. Steps: validate paths, retain bytes/names, inspect images/HTML/guide, write review, compare archive bytes, inspect final scope. Verification: byte comparison and Git inspection above. Acceptance: nine preserved files, exhaustive screen inventory and no implementation. Status: COMPLETE, subject to verification/review recorded in log.
