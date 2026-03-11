<purpose>
Run a structured quality gate pipeline that validates code health before commits or PRs. Auto-detects project type, runs the appropriate toolchain, and produces a structured PASS/FAIL report. Fails fast on first failure.
</purpose>

<process>

<step name="parse_mode" priority="first">
**Parse mode from $ARGUMENTS:**

- `quick` — Build + test only
- `full` — All 6 steps
- `pre-commit` — Build + lint + test (DEFAULT if no mode specified)
- `pre-pr` — All 6 steps + coverage check

```
MODE = $ARGUMENTS or "pre-commit"
```

Display banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD > QUALITY GATE (${MODE})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</step>

<step name="detect_project_type">
**Auto-detect project type from manifest files:**

Check for these files in order (first match wins):

| File | Type | Build | Type Check | Lint | Test | Security |
|------|------|-------|------------|------|------|----------|
| `package.json` | node | `npm run build` | `npx tsc --noEmit` | `npm run lint` | `npm test` | `npm audit` |
| `Cargo.toml` | rust | `cargo build` | (included in build) | `cargo clippy -- -D warnings` | `cargo test` | `cargo audit` |
| `pyproject.toml` | python | `python -m build` | `mypy .` | `ruff check .` | `pytest` | `pip-audit` |
| `setup.py` | python | `python setup.py build` | `mypy .` | `ruff check .` | `pytest` | `pip-audit` |
| `go.mod` | go | `go build ./...` | `go vet ./...` | `golangci-lint run` | `go test ./...` | `govulncheck ./...` |
| `Makefile` | make | `make build` | (skip) | `make lint` | `make test` | (skip) |
| `Gemfile` | ruby | `bundle exec rake build` | (skip) | `bundle exec rubocop` | `bundle exec rspec` | `bundle audit check` |

**Refinements for Node projects:**

Read `package.json` to refine commands:
- If `scripts.build` exists: use `npm run build`; otherwise skip build step
- If `scripts.typecheck` or `scripts.type-check` exists: use that; else if `tsconfig.json` exists: use `npx tsc --noEmit`; otherwise skip type check
- If `scripts.lint` exists: use `npm run lint`; otherwise skip lint step
- If `scripts.test` exists: use `npm test`; otherwise skip test step
- Coverage: if `scripts.test:coverage` exists: use `npm run test:coverage`; else append `-- --coverage` to test command for pre-pr mode

**If no manifest found:**
```
No project manifest detected. Cannot run quality gate.

Supported: package.json (Node), Cargo.toml (Rust), pyproject.toml (Python),
           go.mod (Go), Makefile, Gemfile (Ruby)
```
STOP.

Store detected commands as:
- `$CMD_BUILD`
- `$CMD_TYPECHECK`
- `$CMD_LINT`
- `$CMD_TEST`
- `$CMD_SECURITY`
- `$CMD_COVERAGE` (pre-pr mode only)

Report detection:
```
Project type: ${TYPE}
Manifest: ${MANIFEST_FILE}
```
</step>

<step name="determine_pipeline">
**Build pipeline based on mode:**

| Step | quick | pre-commit | full | pre-pr |
|------|-------|------------|------|--------|
| 1. Build | Y | Y | Y | Y |
| 2. Type check | - | - | Y | Y |
| 3. Lint | - | Y | Y | Y |
| 4. Test suite | Y | Y | Y | Y |
| 5. Security scan | - | - | Y | Y |
| 6. Git diff review | - | - | Y | Y |
| 7. Coverage check | - | - | - | Y |

Store active steps as `$PIPELINE` array.

Report:
```
Pipeline: ${active_step_names joined with " > "}
```
</step>

<step name="execute_pipeline">
**Execute each step in sequence. STOP on first failure.**

Initialize results tracker:
```
RESULTS = []
STARTED = timestamp
```

**For each step in $PIPELINE:**

1. **Announce step:**
```
[${step_number}/${total_steps}] ${step_name}...
```

2. **Check if command exists for this step:**
   - If command is empty/skipped for this project type: record as SKIP, continue
   - Otherwise: execute

3. **Execute command:**
```bash
${CMD} 2>&1
EXIT_CODE=$?
```

4. **Record result:**
```
RESULTS.push({
  step: step_name,
  command: CMD,
  exit_code: EXIT_CODE,
  status: EXIT_CODE == 0 ? "PASS" : "FAIL",
  duration: elapsed,
  output_tail: last 20 lines of output (for failures)
})
```

5. **On FAIL — stop immediately:**

```
[${step_number}/${total_steps}] ${step_name}... FAIL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 QUALITY GATE FAILED at step ${step_number}: ${step_name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Command: ${CMD}
Exit code: ${EXIT_CODE}

Output (last 20 lines):
${output_tail}

Steps completed before failure:
${passed_steps as table}

Steps not run:
${remaining_steps}
```

STOP. Do not continue to remaining steps.

6. **On PASS — continue:**
```
[${step_number}/${total_steps}] ${step_name}... PASS (${duration}s)
```
</step>

<step name="git_diff_review">
**Git diff review (full and pre-pr modes only):**

This step is different from the others — it is an analytical review, not a command execution.

```bash
git diff --cached --stat 2>/dev/null
git diff --cached 2>/dev/null
```

If no staged changes, check unstaged:
```bash
git diff --stat
git diff
```

Review the diff for:
1. **Accidental inclusions** — .env files, credentials, API keys, large binaries, node_modules
2. **Debug artifacts** — console.log, debugger statements, TODO/FIXME/HACK comments added in this diff
3. **Incomplete work** — commented-out code blocks, placeholder values, empty function bodies

Report findings:
```
Git Diff Review:
  Files changed: ${N}
  Additions: +${N} lines
  Deletions: -${N} lines
  Warnings: ${warnings_list or "None"}
```

If warnings found, status is WARN (not FAIL — informational only).
If no changes found, status is SKIP.
</step>

<step name="coverage_check">
**Coverage check (pre-pr mode only):**

Run coverage command:
```bash
${CMD_COVERAGE} 2>&1
```

Parse output for coverage percentage. Common patterns:
- Node/Jest: `All files | XX.XX |`
- Python/pytest: `TOTAL .* (\d+)%`
- Go: `total: (coverage: \d+\.\d+% of statements)`

Report:
```
Coverage: ${percentage}%
```

Note: Coverage check is informational. It does NOT fail the gate (projects have different coverage standards). It reports the number so the user can decide.
</step>

<step name="report">
**Generate final structured report:**

**All steps passed:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 QUALITY GATE PASSED (${MODE})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Step | Status | Duration |
|------|--------|----------|
| Build | PASS | ${N}s |
| Type check | PASS | ${N}s |
| Lint | PASS | ${N}s |
| Test suite | PASS | ${N}s |
| Security scan | PASS | ${N}s |
| Git diff review | PASS | ${N}s |
${coverage_line_if_prepr}

Total duration: ${total}s
Ready to ${MODE == "pre-pr" ? "create PR" : "commit"}.
```

**If any step was SKIP:**
```
| ${step_name} | SKIP | - |
```

**If git diff review had warnings:**
```
| Git diff review | WARN | ${N}s |

Warnings:
${warnings_list}
```
</step>

</process>

<success_criteria>
- [ ] Project type auto-detected from manifest files
- [ ] Pipeline steps determined by mode
- [ ] Each step executed in sequence
- [ ] Fail-fast: pipeline stops on first failure with diagnostic output
- [ ] Structured PASS/FAIL report generated
- [ ] Git diff review catches accidental inclusions (full/pre-pr modes)
- [ ] Coverage reported (pre-pr mode, informational only)
</success_criteria>
