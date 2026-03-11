---
name: gsd:checkpoint
description: Create or verify named progress checkpoints within a phase
argument-hint: "[create|verify] <checkpoint-name>"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---
<objective>
Create or verify named progress checkpoints that capture a known-good state during development.

Two modes:
- **CREATE** — Snapshot current state: commit or stash, record files changed + test status, tag the checkpoint
- **VERIFY** — Compare current state against a named checkpoint to see what drifted

Checkpoints are stored in `.planning/checkpoints/` as JSON files. Typical flow:
feature-start -> core-done -> tests-pass -> refactored -> pr-ready

Use checkpoints to mark progress milestones within a phase, create rollback points, or verify that refactoring did not regress a known-good state.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/checkpoint.md
</execution_context>

<context>
$ARGUMENTS — parsed as: [mode] [checkpoint-name]
- If one word provided: treated as checkpoint name, mode defaults to CREATE
- If two words: first is mode (create/verify), second is checkpoint name
- If empty: list existing checkpoints

Context files are resolved inside the workflow.
</context>

<process>
Execute the checkpoint workflow from @~/.claude/get-shit-done/workflows/checkpoint.md end-to-end.
Preserve all workflow gates (mode detection, state capture, comparison, structured reporting).
</process>
