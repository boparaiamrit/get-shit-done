---
name: gsd:loop
description: Run a repetitive task across multiple targets with safety bounds
argument-hint: "<task description> [--limit N] [--parallel]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
---
<objective>
Execute a repetitive task across multiple targets with built-in safety bounds.

Patterns:
- **sequential** (default) — One target at a time, verify between each
- **parallel** — Multiple targets via subagents (use --parallel flag)

Safety features:
- Max iterations (default 10, override with --limit N)
- Mandatory test pass between iterations
- Stall detection (no progress after 2 iterations = auto-stop)
- Each iteration: execute task -> verify -> commit -> next

Tracks progress in `.planning/loop-state.json`. Auto-stops on: all targets done, iteration limit reached, test failure, or stall detected.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/loop.md
</execution_context>

<context>
$ARGUMENTS — parsed for:
- Task description (required)
- `--limit N` flag (optional, default 10)
- `--parallel` flag (optional, default sequential)

Context files are resolved inside the workflow.
</context>

<process>
Execute the loop workflow from @~/.claude/get-shit-done/workflows/loop.md end-to-end.
Preserve all workflow gates (target discovery, iteration execution, verification, stall detection, structured reporting).
</process>
