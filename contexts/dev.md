# Context Mode: Dev

> Focus: "Write code first, explain after"

## Behavior Overrides

When this context is active, GSD workflows operate in implementation-first mode.

### Planning Phase
- Keep plans short and action-oriented (bullet points, not paragraphs)
- Skip optional research phases unless the task involves unfamiliar APIs or libraries
- Accept the first viable approach instead of comparing alternatives
- Time-box discussion to one round of clarifying questions maximum

### Execution Phase
- Start writing code immediately after plan approval
- Prefer working code over perfect code -- fix forward on minor issues
- Batch small fixes into single commits rather than deliberating each one
- Skip optional documentation unless it is a public API or config change
- Run tests after implementation, not before (unless TDD is explicitly requested)

### Communication
- Lead with code output, follow with explanation only if non-obvious
- Keep status updates to one line: what was done, what is next
- Do not ask permission for standard refactors (renames, extractions, dead code removal)
- Surface blockers immediately instead of researching workarounds silently

### Verification
- Run the test suite once at the end rather than after every change
- Treat lint warnings as non-blocking unless they indicate actual bugs
- Commit when tests pass -- do not gold-plate

### When to Break These Rules
- Security-sensitive code: always review carefully regardless of speed
- Data migrations: always plan thoroughly before executing
- Public API changes: always document before shipping
