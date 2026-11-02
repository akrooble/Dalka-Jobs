# Independent PR review

An independent reviewer must inspect the approved specification, actual implementation, final diff including new files, and verification evidence. Self-review does not count as independent approval. Follow [AGENTS.md](AGENTS.md).

Cover functional correctness, business logic, security, authentication/authorization, tenant isolation and data leakage, database integrity, transactions/concurrency, API compatibility, input validation, error handling, performance, race conditions, regressions, test quality, maintainability, and unnecessary changes. Explain non-applicable areas with evidence; currently architecture and tenant requirements are UNKNOWN.

Each finding must include:
- Finding ID
- Severity: BLOCKER / CRITICAL / MAJOR / MINOR / INFO
- File and line
- Problem
- Reproduction or evidence
- Expected behavior
- Recommended fix

Use actual lines and reproducible evidence; do not invent findings. State coverage, executed checks, and unverified behavior. End with exactly one status: APPROVED, CHANGES REQUIRED, or BLOCKED. Essential missing evidence, unavailable independent review, or unverified required acceptance behavior prevents approval. Resolve findings and repeat affected review/checks before approval.
