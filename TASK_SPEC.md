# Task specification

For each subsequent feature, fix, refactor, or technical change, save a completed specification at `tasks/specs/<task-id>.md` before implementation. Initial six-file workflow setup is authorized directly by skill invocation and needs no task artifact.

Include every field:
- Task ID
- Title
- Type
- Priority
- Problem Statement
- Current Behavior
- Expected Behavior
- Root Cause (if known)
- Repository Evidence
- Scope
- Out of Scope
- Affected Components
- Expected Files
- Database Impact
- API Impact
- Security Impact
- Tenant Impact
- Implementation Approach
- Edge Cases
- Test Plan
- Acceptance Criteria
- Risks
- Dependencies
- Estimated Complexity

Cite actual evidence paths. Mark unsupported root causes UNKNOWN and investigate. Use NOT APPLICABLE only with a reason. Make acceptance criteria measurable and identify commands, working directories, prerequisites, and blocked checks. Currently the repository has no application tooling; do not invent commands or architecture.

Present the completed specification for explicit task approval before implementation. Existing explicit approval of that exact scope counts; record its evidence in the task artifact. Silence is not approval. Keep a short execution log alongside the specification, not in these reusable instructions. Follow shared safety and completion gates in [AGENTS.md](AGENTS.md).
