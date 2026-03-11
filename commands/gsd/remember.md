---
name: gsd:remember
description: Save weighted memories from current session to persistent MEMORY.md
argument-hint: [optional: what to remember]
allowed-tools:
  - Read
  - Write
  - Edit
---

<objective>
Explicitly capture learnings from the current session into the project's weighted memory file (MEMORY.md in the auto memory directory).

Use this when:
- You want to save something specific mid-session (don't wait for context compression)
- The session was short but had an important insight
- You want to promote an observation [W1] to a confirmed pattern [W3+]
- You want to correct or remove a wrong memory
</objective>

<context>
Arguments: $ARGUMENTS (optional — what specifically to remember)

Memory file location: The auto memory directory's MEMORY.md (path provided by system context).
</context>

<process>

## 1. Read Current Memory

Read MEMORY.md from the auto memory directory. If it doesn't exist, create it with the weight system header.

## 2. Determine What to Save

**If arguments provided:** Save the specified item. Infer the appropriate weight:
- User says "always do X" or "never do Y" → [W5] CRITICAL
- User says "this pattern works" or "confirmed: X" → [W4] IMPORTANT
- User says "X worked" or "use Y for Z" → [W3] USEFUL
- General context or state → [W2] CONTEXT
- First-time observation → [W1] OBSERVED

**If no arguments:** Reflect on the current session and identify anything worth saving. Ask the user:

```
AskUserQuestion:
  header: "Memory"
  question: "What should I remember from this session?"
  options:
    - "Auto-detect" — I'll review the session and suggest memories
    - "I'll tell you" — Let me specify what to save
```

**If "Auto-detect":** Review the session for:
- Decisions made (architecture, preferences, tool choices)
- Patterns discovered (what worked, what didn't)
- User corrections (they told you something was wrong)
- Environment quirks (workarounds, configs)

Present candidates with suggested weights. Let user approve/adjust.

**If "I'll tell you":** Wait for user input, then classify and save.

## 3. Update MEMORY.md

Apply changes using Edit tool:
- **New memory:** Add under the appropriate weight section
- **Promotion:** Move existing item to higher weight section, update text
- **Correction:** Edit or remove the wrong memory
- **Prune:** If over 200 lines, remove lowest-weight items first

## 4. Confirm

Report what was saved:

```
Memory updated:
- [W4] Added: "Prisma requires explicit disconnect in test teardown"
- [W1→W3] Promoted: "TanStack Query v5 requires suspense: true for Suspense boundaries"
- [W1] Pruned: 2 stale observations removed
```

</process>
