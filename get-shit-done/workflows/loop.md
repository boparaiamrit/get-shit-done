<purpose>
Execute a repetitive task across multiple targets with built-in safety bounds. Supports sequential (one at a time) and parallel (via subagents) execution patterns. Tracks progress, enforces iteration limits, detects stalls, and requires test passes between iterations.
</purpose>

<process>

<step name="parse_arguments" priority="first">
**Parse $ARGUMENTS for task description and flags:**

- `--limit N` → max iterations (default 10)
- `--parallel` → use parallel execution via subagents (default: sequential)
- Everything else → task description

Examples:
- `"add error handling to all API routes"` → sequential, limit 10
- `"migrate components to TypeScript --limit 20"` → sequential, limit 20
- `"update all test files to vitest --parallel --limit 15"` → parallel, limit 15

```
TASK_DESCRIPTION = parsed task text
MAX_ITERATIONS = parsed limit or 10
EXECUTION_MODE = "parallel" or "sequential"
```

If `$TASK_DESCRIPTION` is empty:
```
AskUserQuestion(
  header: "Loop Task",
  question: "What repetitive task do you want to run?",
  followUp: "Examples: 'add error handling to all API routes', 'migrate .js files to .ts', 'add JSDoc to all exported functions'"
)
```

Display banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD > LOOP (${EXECUTION_MODE})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Task: ${TASK_DESCRIPTION}
Max iterations: ${MAX_ITERATIONS}
Mode: ${EXECUTION_MODE}
```
</step>

<step name="discover_targets">
**Identify all targets for the task:**

Analyze `$TASK_DESCRIPTION` to determine what constitutes a "target." Use codebase scanning to build the target list.

Common patterns:
- "add X to all Y files" → find all Y files
- "migrate X to Y" → find all files matching X pattern
- "update all Z" → find all Z instances
- "fix X in every Y" → find all Y containing X

```bash
# Example: find targets based on task description analysis
# The specific commands depend on what the task targets
```

Build target list:
```
TARGETS = [
  { id: 1, path: "src/routes/users.ts", description: "users route" },
  { id: 2, path: "src/routes/posts.ts", description: "posts route" },
  ...
]
TARGET_COUNT = len(TARGETS)
```

If no targets found:
```
No targets found for: ${TASK_DESCRIPTION}

Searched for: ${what was searched}
Try being more specific about which files or patterns to target.
```
STOP.

Report:
```
Found ${TARGET_COUNT} targets:

| # | Target | Description |
|---|--------|-------------|
| 1 | ${path} | ${description} |
| 2 | ${path} | ${description} |
...

Estimated iterations: ${TARGET_COUNT}
${TARGET_COUNT > MAX_ITERATIONS ? "WARNING: More targets than iteration limit. Will process first " + MAX_ITERATIONS + "." : ""}
```

If TARGET_COUNT > 20:
```
AskUserQuestion(
  header: "Large Target Set",
  question: "${TARGET_COUNT} targets found. Proceed with all, or filter?",
  options: [
    { label: "Proceed with all", description: "Process up to ${MAX_ITERATIONS} targets" },
    { label: "Filter by directory", description: "Limit to a specific directory" },
    { label: "Filter by pattern", description: "Provide a more specific pattern" },
    { label: "Abort", description: "Cancel loop" }
  ]
)
```

Adjust targets based on user response.
</step>

<step name="initialize_state">
**Create loop state file:**

Write to `.planning/loop-state.json`:

```json
{
  "task": "${TASK_DESCRIPTION}",
  "mode": "${EXECUTION_MODE}",
  "max_iterations": ${MAX_ITERATIONS},
  "started": "${ISO_TIMESTAMP}",
  "updated": "${ISO_TIMESTAMP}",
  "status": "running",
  "targets": [
    { "id": 1, "path": "${path}", "description": "${desc}", "status": "pending" }
  ],
  "iterations": [],
  "stall_counter": 0,
  "summary": {
    "total": ${TARGET_COUNT},
    "completed": 0,
    "failed": 0,
    "skipped": 0,
    "pending": ${TARGET_COUNT}
  }
}
```
</step>

<step name="run_baseline_tests">
**Run test suite before starting loop to establish baseline:**

Detect test runner:
```bash
if [ -f "package.json" ]; then
  TEST_CMD="npm test"
elif [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
  TEST_CMD="pytest"
elif [ -f "Cargo.toml" ]; then
  TEST_CMD="cargo test"
elif [ -f "go.mod" ]; then
  TEST_CMD="go test ./..."
else
  TEST_CMD=""
fi
```

If test runner found:
```bash
$TEST_CMD 2>&1
BASELINE_EXIT=$?
```

If baseline tests fail:
```
Baseline tests FAIL. Fix tests before starting loop.
Failing tests should pass before making repetitive changes.
```
STOP.

If no test runner: warn but continue.
```
No test runner detected. Loop will skip inter-iteration test checks.
```

Store `$TEST_CMD` and `$BASELINE_PASS = true`.
</step>

<step name="execute_sequential">
**Sequential execution — one target at a time:**

Skip this step if `$EXECUTION_MODE == "parallel"`.

```
ITERATION = 0
STALL_COUNTER = 0
LAST_COMPLETED_COUNT = 0
```

**For each target in $TARGETS (up to $MAX_ITERATIONS):**

```
ITERATION += 1
```

**1. Announce:**
```
[${ITERATION}/${MAX_ITERATIONS}] Target: ${target.path}
  ${target.description}
```

**2. Execute task on target:**

Apply `$TASK_DESCRIPTION` to `${target.path}`. This involves:
- Reading the target file
- Understanding what change the task requires
- Making the change
- Verifying the change was applied correctly

**3. Verify change:**

Check that the expected change was made:
- File was modified (git diff shows changes)
- Change matches the task intent
- No syntax errors introduced (if detectable)

If verification fails:
```
[${ITERATION}/${MAX_ITERATIONS}] Target: ${target.path} — FAILED
  Reason: ${why}
```
Record as failed, continue to next target.

**4. Run tests (if test runner available):**

```bash
$TEST_CMD 2>&1
TEST_EXIT=$?
```

If tests fail:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 LOOP STOPPED — TEST FAILURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Iteration ${ITERATION}: Tests failed after modifying ${target.path}

Failing output (last 20 lines):
${output_tail}

Options:
1. Fix and retry this target
2. Revert this target and continue
3. Stop loop
```

If user chooses revert:
```bash
git checkout -- ${target.path}
```
Mark target as skipped, continue.

If user chooses stop: go to `report`.

**5. Commit:**

```bash
git add ${target.path}
git commit -m "loop(${ITERATION}/${TARGET_COUNT}): ${TASK_DESCRIPTION} — ${target.description}"
```

**6. Record iteration:**

Update `.planning/loop-state.json`:
- Mark target as completed
- Add iteration record: `{ iteration: N, target: path, status: "completed", commit: hash, duration: Ns }`
- Update summary counts

**7. Stall detection:**

```
CURRENT_COMPLETED = summary.completed
if CURRENT_COMPLETED == LAST_COMPLETED_COUNT:
  STALL_COUNTER += 1
else:
  STALL_COUNTER = 0
  LAST_COMPLETED_COUNT = CURRENT_COMPLETED

if STALL_COUNTER >= 2:
  → STALL DETECTED, go to stall_handler
```

**8. Report progress:**
```
[${ITERATION}/${MAX_ITERATIONS}] ${target.path} — DONE (${completed}/${total} targets)
```
</step>

<step name="execute_parallel">
**Parallel execution via subagents:**

Skip this step if `$EXECUTION_MODE == "sequential"`.

Group targets into batches of up to 5 (to avoid overwhelming the system).

**For each batch:**

```
BATCH_NUM += 1
BATCH_TARGETS = next 5 targets
```

**1. Announce batch:**
```
Batch ${BATCH_NUM}: Processing ${BATCH_TARGETS.length} targets in parallel
${BATCH_TARGETS.map(t => "  - " + t.path).join("\n")}
```

**2. Spawn subagents:**

For each target in batch:
```
Task(
  prompt="
<objective>
Apply this change to a single file:
Task: ${TASK_DESCRIPTION}
Target: ${target.path}

Read the file, make the change, verify it compiles/parses correctly.
Do NOT commit — the orchestrator handles commits.
</objective>

<files_to_read>
- ${target.path}
</files_to_read>

<output>
Return:
## ITERATION COMPLETE
- target: ${target.path}
- status: completed | failed
- changes: brief description of what changed
- issues: any problems encountered
</output>
",
  description="Loop: ${target.description}"
)
```

**3. Collect results:**

Wait for all agents in batch to complete.

For each result:
- If COMPLETE: stage and commit the file
- If FAILED: record failure, continue

**4. Run tests after batch:**

```bash
$TEST_CMD 2>&1
TEST_EXIT=$?
```

If tests fail after batch:
```
Tests failed after batch ${BATCH_NUM}. Investigating which target broke tests...
```

Binary search: revert targets one at a time, test after each, to identify which target caused the failure. Revert the offending target, mark as failed, re-run tests to confirm green.

**5. Update state and check stall/limits.**

Continue to next batch.
</step>

<step name="stall_handler">
**Stall detected — no progress for 2 consecutive iterations:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 LOOP STALLED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

No progress for 2 iterations.
Completed: ${completed}/${total}
Last attempted: ${last_targets}

Possible causes:
- Remaining targets may not match the expected pattern
- Task may need different approach for remaining targets
- Targets may have dependencies preventing changes
```

Offer options:
- "Continue anyway" — reset stall counter, try next 2
- "Skip remaining and report" — go to report
- "Adjust task" — user provides refined task description, continue

Update state based on choice.
</step>

<step name="report">
**Generate final loop report:**

Update `.planning/loop-state.json`:
- `status`: "completed" | "stopped" | "stalled"
- `updated`: now
- Final summary counts

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 LOOP COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Task: ${TASK_DESCRIPTION}
Mode: ${EXECUTION_MODE}
Duration: ${total_duration}

| Result | Count |
|--------|-------|
| Completed | ${N} |
| Failed | ${N} |
| Skipped | ${N} |
| Pending | ${N} |

Iterations used: ${ITERATION}/${MAX_ITERATIONS}

${if completed == total:}
All targets processed successfully.

${if failed > 0:}
### Failed Targets
| # | Target | Reason |
|---|--------|--------|
${failed_targets_table}

${if pending > 0:}
### Remaining Targets (not processed)
| # | Target |
|---|--------|
${pending_targets_table}

Run again to continue: /gsd:loop ${TASK_DESCRIPTION}

State file: .planning/loop-state.json
```
</step>

</process>

<safety_bounds>
**Hard limits — these cannot be overridden:**
- Max iterations cap: 50 (even if --limit sets higher)
- Test failure = immediate stop (user must acknowledge)
- Stall detection at 2 consecutive no-progress iterations

**Soft limits — user can override:**
- Default iteration limit: 10
- Batch size for parallel: 5
- Stall: user can choose to continue
</safety_bounds>

<resumption>
If `.planning/loop-state.json` exists with `status: "running"` or `status: "stopped"`:

```
Found existing loop state:
  Task: ${task}
  Progress: ${completed}/${total}
  Last updated: ${updated}

Resume from where it stopped? [Y/n]
```

If yes: load state, skip completed targets, continue from first pending.
If no: archive old state as `loop-state.${timestamp}.json`, start fresh.
</resumption>

<success_criteria>
- [ ] Task description and flags parsed from arguments
- [ ] Targets discovered via codebase scanning
- [ ] Baseline tests pass before starting
- [ ] Each iteration: execute, verify, test, commit
- [ ] Test failure stops the loop immediately
- [ ] Stall detection after 2 no-progress iterations
- [ ] Iteration limit enforced (default 10, max 50)
- [ ] Progress tracked in .planning/loop-state.json
- [ ] Resumable from interrupted state
- [ ] Structured final report with pass/fail/skip counts
</success_criteria>
