---
name: gsd:security-scan
description: Scan codebase and GSD configuration for security issues
argument-hint: "[mode: code|config|full]"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Write
  - Edit
  - Task
---

<objective>
Scan application code and GSD configuration files for security vulnerabilities.

Three modes: `code` (application source), `config` (GSD workflows, agents, templates), `full` (both). Produces a structured report with severity levels and actionable fix recommendations. CRITICAL findings block deployment.

Output: `.planning/security-report.md` with findings, severity, and remediation steps.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/security-scan.md
</execution_context>

<context>
Mode: $ARGUMENTS (defaults to `full` if not specified)

- `code` — Scan application source code only
- `config` — Scan GSD configuration files only (workflows, agents, templates, hooks)
- `full` — Scan both application code and GSD configuration
</context>

<process>
Execute the security-scan workflow from @~/.claude/get-shit-done/workflows/security-scan.md end-to-end.
Preserve all workflow gates (mode selection, scanning, severity classification, report generation).
</process>

<success_criteria>
- [ ] Scan mode resolved (code, config, or full)
- [ ] All relevant files scanned for security patterns
- [ ] Findings classified by severity (CRITICAL, HIGH, MEDIUM, LOW)
- [ ] Actionable fix recommendations for each finding
- [ ] Report written to `.planning/security-report.md`
- [ ] CRITICAL findings highlighted with blocking recommendation
</success_criteria>
