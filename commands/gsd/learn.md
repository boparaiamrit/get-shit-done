---
name: gsd:learn
description: Extract reusable patterns and learnings from current session
argument-hint: "[optional: specific topic to extract learnings about]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
---

<objective>
Extract reusable patterns and learnings from the current session and persist them to `.planning/LEARNINGS.md`.

Captures what broke, how it was fixed, architecture decisions, tool discoveries, and workflow optimizations. Learnings persist across sessions and inform future planning — reducing repeated mistakes and accelerating similar work.

This is NOT memory (cross-session user preferences). This is knowledge (reusable technical patterns).
</objective>

<context>
Arguments: $ARGUMENTS (optional — specific topic to focus learning extraction on)

Learnings file: `.planning/LEARNINGS.md`
</context>

<process>

## 0. Initialize Context

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state load)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Read `.planning/LEARNINGS.md` if it exists. Parse existing learnings to avoid duplicates.

## 1. Analyze Current Session

Review the conversation for extractable patterns across these categories:

**Error Resolution** — What broke, root cause, how it was fixed
- Stack traces and their actual causes
- Misleading error messages and what they really meant
- Environment-specific gotchas

**Debugging Techniques** — Approaches that successfully isolated issues
- Diagnostic commands that revealed the problem
- Investigation sequences that worked
- Red herrings that wasted time

**Architecture Decisions** — Choices made and their rationale
- Why one approach was chosen over alternatives
- Trade-offs considered
- Constraints that drove the decision

**Tool/Library Discoveries** — New tools, APIs, or configurations found
- Undocumented behavior discovered
- Version-specific quirks
- Configuration that solved a problem

**Workflow Optimizations** — Process improvements discovered
- Faster ways to accomplish tasks
- Automation opportunities identified
- Bottlenecks discovered and addressed

## 2. Present Candidates

**If $ARGUMENTS provided:** Focus extraction on that topic area. Present findings directly.

**If no $ARGUMENTS:**

```
AskUserQuestion:
  header: "Learnings"
  question: "How should I extract learnings from this session?"
  options:
    - "Auto-detect" — I'll review the session and suggest learnings
    - "I'll tell you" — Let me specify what to capture
```

**If "Auto-detect":** Present candidate learnings with categories:

```
## Session Learnings Found

1. **[Error Resolution]** Prisma P2002 on upsert — actually a race condition
   Context: Concurrent requests hitting upsert on unique constraint
   Solution: Wrap in transaction with retry logic

2. **[Architecture]** Chose event sourcing over CRUD for audit trail
   Context: Compliance requires full history of state changes
   Solution: Event store with projections for read models

3. **[Tool Discovery]** `tsx watch` faster than `ts-node-dev` for this project
   Context: ts-node-dev had 3s reload, tsx watch under 500ms
   Solution: Switched dev script to `tsx watch src/index.ts`

Accept all? Or specify numbers to keep/edit/remove.
```

Let user approve, edit, or filter.

**If "I'll tell you":** Wait for user input, then classify into categories.

## 3. Format Learnings

Each learning follows this structure:

```markdown
### [Category] Title
- **Pattern:** What happened / what was discovered
- **Context:** When/where this applies
- **Solution:** What to do about it
- **Added:** [ISO date]
```

Categories: `Error Resolution`, `Debugging`, `Architecture`, `Tool/Library`, `Workflow`, `Performance`, `Security`, `Testing`

## 4. Deduplicate

Compare each new learning against existing entries in LEARNINGS.md:
- **Exact match:** Skip (already captured)
- **Similar pattern, new context:** Merge — add new context to existing entry
- **Related but different:** Add as new entry, cross-reference existing

## 5. Write to LEARNINGS.md

If file doesn't exist, create with header:

```markdown
# Project Learnings

> Reusable patterns extracted from development sessions. Consulted during planning and debugging.

## Error Resolution

## Debugging

## Architecture

## Tool/Library

## Workflow

## Performance

## Security

## Testing
```

Add new learnings under their category sections using Edit tool.

If file exceeds 300 lines: archive oldest entries per category (keep most recent 10 per category).

## 6. Confirm

Report what was captured:

```
Learnings updated:
- [Error Resolution] Added: "Prisma P2002 on upsert is a race condition"
- [Architecture] Added: "Event sourcing for compliance audit trails"
- [Tool/Library] Merged with existing: "tsx watch performance" (added new context)
- 2 duplicates skipped

File: .planning/LEARNINGS.md ({N} total learnings)
```

</process>

<success_criteria>
- [ ] Session analyzed for extractable patterns
- [ ] Learnings categorized (Error Resolution, Debugging, Architecture, Tool/Library, Workflow, Performance, Security, Testing)
- [ ] Each learning has Pattern, Context, Solution fields
- [ ] Deduplicated against existing LEARNINGS.md entries
- [ ] LEARNINGS.md created or updated
- [ ] User confirmed which learnings to save
</success_criteria>
