# Small task decomposition

Decompose approved specifications in dependency order, only as much as useful. A trivial change needs one small task. Record the breakdown with its task artifact, not in this reusable file.

Each small task requires:
- Small Task ID
- Objective
- Dependencies
- Exact scope
- Expected files
- Implementation steps
- Verification command
- Acceptance criteria
- Completion status

Use evidenced verification commands with working directories and prerequisites. If unavailable, record BLOCKED and what must be established. Do not invent application commands for this currently documentation-only repository.

Parallelize only genuinely independent scopes with isolated files; never let concurrent agents edit the same files. Existing cloud checkouts are isolated: create a worktree only on explicit user request. Reconcile dependencies and verify the combined result before final review. Apply [AGENTS.md](AGENTS.md) safety and lifecycle rules.
