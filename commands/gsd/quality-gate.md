---
name: gsd:quality-gate
description: Run technical quality checks (build, lint, test, security) before committing or creating PRs
argument-hint: "[quick|full|pre-commit|pre-pr]"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
---
<objective>
Run a structured quality gate pipeline that validates code health before commits or PRs.

Modes determine which checks run:
- **quick** — Build + test only (fast feedback loop)
- **full** — All 6 steps: build, type check, lint, test suite, security scan, git diff review
- **pre-commit** — Build + lint + test (default if no mode specified)
- **pre-pr** — All 6 steps + coverage check (strictest gate)

Auto-detects project type from manifest files (package.json, Cargo.toml, pyproject.toml, go.mod, etc.) and runs the appropriate toolchain commands.

Output: Structured PASS/FAIL report. Fails fast — stops on first failure with diagnostic details.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/quality-gate.md
</execution_context>

<context>
Mode: $ARGUMENTS (optional — defaults to "pre-commit")

Context files are resolved inside the workflow.
</context>

<process>
Execute the quality-gate workflow from @~/.claude/get-shit-done/workflows/quality-gate.md end-to-end.
Preserve all workflow gates (project detection, pipeline execution, fail-fast, structured reporting).
</process>
