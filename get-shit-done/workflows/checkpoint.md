<purpose>
Create or verify named progress checkpoints that capture a known-good state during development. Checkpoints store file hashes, test status, and git state as JSON in `.planning/checkpoints/`. Use them to mark progress milestones, create rollback points, or verify that changes did not regress a known-good state.
</purpose>

<process>

<step name="parse_arguments" priority="first">
**Parse $ARGUMENTS into mode and checkpoint name:**

- No arguments → LIST mode (show all checkpoints)
- One word → CREATE mode, word is checkpoint name
- `create <name>` → CREATE mode explicitly
- `verify <name>` → VERIFY mode
- `list` → LIST mode

Validate checkpoint name:
- Lowercase, hyphens only (no spaces, no special chars)
- Max 40 characters
- Examples: `core-done`, `tests-pass`, `refactored`, `pr-ready`, `feature-start`

```
MODE = "list" | "create" | "verify"
CHECKPOINT_NAME = parsed name (or null for list)
```

Display banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD > CHECKPOINT (${MODE})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</step>

<step name="ensure_directory">
**Create checkpoints directory if it does not exist:**

```bash
mkdir -p .planning/checkpoints
```
</step>

<step name="list_checkpoints">
**LIST mode — show all existing checkpoints:**

```bash
ls .planning/checkpoints/*.json 2>/dev/null
```

If no checkpoints exist:
```
No checkpoints found.

Create one: /gsd:checkpoint <name>
Examples: /gsd:checkpoint feature-start
          /gsd:checkpoint core-done
          /gsd:checkpoint tests-pass
```
STOP.

For each checkpoint file, read and extract summary:

```
## Checkpoints

| Name | Created | Branch | Files Changed | Tests | Commit |
|------|---------|--------|---------------|-------|--------|
| feature-start | 2026-03-10 14:30 | feat/auth | 0 | pass | a1b2c3d |
| core-done | 2026-03-10 16:45 | feat/auth | 12 | pass | d4e5f6a |
| tests-pass | 2026-03-10 18:20 | feat/auth | 15 | pass | b7c8d9e |

Verify against any checkpoint: /gsd:checkpoint verify <name>
```
STOP.
</step>

<step name="create_checkpoint">
**CREATE mode — snapshot current state:**

**1. Check if checkpoint name already exists:**

```bash
test -f ".planning/checkpoints/${CHECKPOINT_NAME}.json" && echo "exists"
```

If exists, ask user:
```
Checkpoint "${CHECKPOINT_NAME}" already exists (created ${date}).
Overwrite? [y/N]
```
If no: STOP.

**2. Gather state data:**

```bash
# Current branch
BRANCH=$(git branch --show-current)

# Current commit
COMMIT=$(git rev-parse --short HEAD)
COMMIT_FULL=$(git rev-parse HEAD)
COMMIT_MSG=$(git log -1 --format="%s")

# Dirty state
DIRTY_FILES=$(git status --porcelain)

# Files changed since last tag/branch point
CHANGED_FILES=$(git diff --name-only HEAD~10 HEAD 2>/dev/null || git diff --name-only HEAD)

# Tracked file count
TRACKED_COUNT=$(git ls-files | wc -l | tr -d ' ')
```

**3. Run test suite (if test runner detected):**

Detect test runner (same logic as quality-gate workflow):

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
TEST_EXIT=$?
TEST_STATUS=$([ $TEST_EXIT -eq 0 ] && echo "pass" || echo "fail")
```

If no test runner: `TEST_STATUS="skipped"`

**4. Handle dirty working tree:**

If `$DIRTY_FILES` is non-empty:
```
Working tree has uncommitted changes:
${DIRTY_FILES}
```

Offer options:
- "Commit first" — stage all and commit with message `checkpoint: ${CHECKPOINT_NAME}`
- "Stash and checkpoint" — `git stash push -m "checkpoint: ${CHECKPOINT_NAME}"`
- "Checkpoint anyway" — record dirty state (checkpoint will note uncommitted changes)

Execute chosen action. Update `$COMMIT` if a new commit was made.

**5. Generate file manifest with hashes:**

```bash
# Hash all tracked files for comparison
git ls-files -z | xargs -0 md5sum 2>/dev/null || git ls-files -z | xargs -0 shasum
```

Store as `$FILE_HASHES` (map of path -> hash).

**6. Write checkpoint JSON:**

Write to `.planning/checkpoints/${CHECKPOINT_NAME}.json`:

```json
{
  "name": "${CHECKPOINT_NAME}",
  "created": "${ISO_TIMESTAMP}",
  "branch": "${BRANCH}",
  "commit": "${COMMIT}",
  "commit_full": "${COMMIT_FULL}",
  "commit_message": "${COMMIT_MSG}",
  "had_dirty_state": ${true|false},
  "dirty_action": "${commit|stash|none}",
  "test_status": "${pass|fail|skipped}",
  "tracked_file_count": ${TRACKED_COUNT},
  "changed_files": [${list of changed file paths}],
  "file_hashes": {${path: hash map}},
  "metadata": {
    "phase": "${current_phase_from_STATE_if_exists}",
    "description": "${user_provided_or_auto_generated}"
  }
}
```

**7. Report:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CHECKPOINT CREATED: ${CHECKPOINT_NAME}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Branch: ${BRANCH}
Commit: ${COMMIT} — ${COMMIT_MSG}
Tests: ${TEST_STATUS}
Tracked files: ${TRACKED_COUNT}
Changed files: ${CHANGED_FILES count}
Stored: .planning/checkpoints/${CHECKPOINT_NAME}.json

Verify later: /gsd:checkpoint verify ${CHECKPOINT_NAME}
```
</step>

<step name="verify_checkpoint">
**VERIFY mode — compare current state against a named checkpoint:**

**1. Load checkpoint:**

```bash
cat ".planning/checkpoints/${CHECKPOINT_NAME}.json"
```

If not found:
```
Checkpoint "${CHECKPOINT_NAME}" not found.

Available checkpoints:
${list from .planning/checkpoints/*.json}
```
STOP.

Parse JSON into `$CHECKPOINT` object.

**2. Compare git state:**

```bash
CURRENT_BRANCH=$(git branch --show-current)
CURRENT_COMMIT=$(git rev-parse --short HEAD)
CURRENT_COMMIT_FULL=$(git rev-parse HEAD)
```

Branch match: `$CURRENT_BRANCH == $CHECKPOINT.branch`
Commit match: `$CURRENT_COMMIT_FULL == $CHECKPOINT.commit_full`
Commit ancestry: `git merge-base --is-ancestor ${CHECKPOINT.commit_full} HEAD` (is checkpoint an ancestor of current HEAD?)

**3. Compare file hashes:**

```bash
git ls-files -z | xargs -0 md5sum 2>/dev/null || git ls-files -z | xargs -0 shasum
```

Compare against `$CHECKPOINT.file_hashes`:

- **Added files** — in current but not in checkpoint
- **Removed files** — in checkpoint but not in current
- **Modified files** — hash differs
- **Unchanged files** — hash matches

**4. Run test suite and compare:**

Run tests (same detection as create step).

Compare: `$CURRENT_TEST_STATUS` vs `$CHECKPOINT.test_status`

| Checkpoint | Current | Verdict |
|------------|---------|---------|
| pass | pass | Tests still green |
| pass | fail | REGRESSION — tests were passing at checkpoint |
| fail | pass | IMPROVEMENT — tests now passing |
| fail | fail | Tests still failing |
| skipped | any | Cannot compare |

**5. Generate verification report:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CHECKPOINT VERIFY: ${CHECKPOINT_NAME}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Checkpoint: ${CHECKPOINT_NAME} (${CHECKPOINT.created})
Comparing: ${CHECKPOINT.commit} -> ${CURRENT_COMMIT}

## Git State

| Property | Checkpoint | Current | Match |
|----------|------------|---------|-------|
| Branch | ${cp_branch} | ${cur_branch} | ${Y/N} |
| Commit | ${cp_commit} | ${cur_commit} | ${Y/N} |
| Ancestry | - | - | ${checkpoint is ancestor: Y/N} |

## File Changes Since Checkpoint

| Category | Count | Files |
|----------|-------|-------|
| Added | ${N} | ${file_list or "—"} |
| Removed | ${N} | ${file_list or "—"} |
| Modified | ${N} | ${file_list or "—"} |
| Unchanged | ${N} | — |

## Test Status

| Checkpoint | Current | Verdict |
|------------|---------|---------|
| ${cp_test} | ${cur_test} | ${verdict} |

## Overall Verdict

${one of:}
- CLEAN — No changes since checkpoint. State is identical.
- PROGRESSED — ${N} files changed, tests still green. Forward progress.
- REGRESSED — Tests were passing at checkpoint but now failing. Investigate.
- DIVERGED — On different branch. ${N} files differ.
```

If REGRESSED:
```
Action recommended: Review failing tests before proceeding.
  /gsd:debug — investigate test failures
  git stash && git checkout ${CHECKPOINT.commit} — return to checkpoint state
```
</step>

</process>

<success_criteria>
- [ ] Arguments parsed into mode and checkpoint name
- [ ] Checkpoint directory created if missing
- [ ] LIST: all checkpoints displayed with summary
- [ ] CREATE: git state, file hashes, and test status captured
- [ ] CREATE: dirty working tree handled (commit, stash, or note)
- [ ] CREATE: JSON written to .planning/checkpoints/
- [ ] VERIFY: checkpoint loaded and compared against current state
- [ ] VERIFY: file diff, test comparison, and overall verdict reported
- [ ] VERIFY: regression detected when tests degrade from checkpoint
</success_criteria>
