# Release control

Apply [AGENTS.md](AGENTS.md). Task approval and local completion do not authorize release.

Before merging, verify intended base and source branches, PR description, actual final diff, absence of unrelated changes, independent review status, resolution of blockers, required CI checks, merge conflicts, and applicable migration safety. Use actual evidence; do not assume branch names or treat missing CI as successful.

Do not merge with failed required tests, unresolved critical security issues, unverified applicable tenant isolation, missing required reviews, remaining blockers, or unsafe migrations. Mark checks NOT APPLICABLE only with evidence. This repository has no evidenced CI, migration, deployment, or rollback configuration; establish applicable gates and rollback procedures before release rather than inventing commands. Database changes require compatibility, data preservation, rollout ordering, and recovery evidence.

Require explicit user authorization scoped to the operation, branches, and environment before commits, pushes, destructive actions, deployments, or merges. Never merge to main, staging, or production without explicit authorization. Keep final approval, merge, and release phases PENDING when authorization is absent.

After an authorized merge, verify destination branch and resulting commit, run applicable post-merge checks, and report exact outcome plus outstanding rollout checks. Never imply deployment or production readiness from documentation or tests alone.
