<purpose>
Extract reusable patterns and learnings from the current development session and persist them to `.planning/LEARNINGS.md`.

Captures error resolutions, debugging techniques, architecture decisions, tool discoveries, and workflow optimizations. Unlike MEMORY.md (user preferences and project state), LEARNINGS.md captures technical knowledge — patterns that help solve similar problems faster next time.
</purpose>

<core_principle>
**Knowledge compounds.** Every debugging session, architecture decision, and tool discovery is an investment. Capturing patterns means the team (human + AI) gets faster over time. A learning is only valuable if it's specific enough to act on — "React is good" is useless; "React Suspense requires ErrorBoundary wrapping or the entire tree unmounts on throw" is actionable.
</core_principle>

<process>

<step name="initialize" priority="first">
Load project context and existing learnings:

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state load)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

```bash
if [ -f ".planning/LEARNINGS.md" ]; then
  echo "LEARNINGS_EXISTS=true"
else
  echo "LEARNINGS_EXISTS=false"
fi
```

If LEARNINGS.md exists, read it and parse existing entries to build a dedup index.
</step>

<step name="extract_learnings">
**Scan the current session for extractable patterns across all categories:**

| Category | Look for | Example |
|----------|----------|---------|
| Error Resolution | Errors encountered and their root causes | "ECONNREFUSED on port 3000 — previous process still bound" |
| Debugging | Investigation techniques that worked | "Binary search through git history with `git bisect`" |
| Architecture | Design decisions with rationale | "Chose PostgreSQL over MongoDB for relational audit data" |
| Tool/Library | New tools, configs, or undocumented behavior | "`--experimental-specifier-resolution=node` fixes ESM imports" |
| Workflow | Process improvements discovered | "Run linter before tests — catches 80% of failures faster" |
| Performance | Bottlenecks found and optimizations applied | "N+1 query in user list — DataLoader batching reduced 200ms to 12ms" |
| Security | Vulnerabilities discovered or mitigations applied | "JWT stored in localStorage vulnerable to XSS — moved to httpOnly cookie" |
| Testing | Testing patterns, fixtures, or strategies that worked | "Factory pattern for test data — `createUser()` over raw SQL inserts" |

**Quality filter — only extract learnings that are:**
- Specific (includes file names, error codes, version numbers)
- Actionable (someone could apply this without additional context)
- Non-obvious (not something any developer would already know)

**Reject learnings that are:**
- Too generic ("use TypeScript for type safety")
- Project-specific trivia ("the login button is blue")
- Temporary ("server is down right now")
</step>

<step name="present_candidates">
**If arguments specify a topic:** Focus extraction on that area. Present findings directly.

**If no arguments:** Present all candidate learnings grouped by category:

```
## Session Learnings Found

### Error Resolution
1. **Prisma P2002 on upsert — race condition, not schema error**
   Pattern: Concurrent upsert on unique constraint throws P2002
   Context: High-traffic endpoints with optimistic upsert
   Solution: Wrap in `$transaction` with exponential retry (max 3)

### Debugging
2. **`strace -e trace=network` faster than Wireshark for API debugging**
   Pattern: Network call not reaching server
   Context: Linux/WSL environments with complex proxy chains
   Solution: `strace -f -e trace=network node server.js 2>&1 | grep connect`

### Architecture
3. **Event sourcing for compliance audit trails**
   Pattern: Regulatory requirement for full state change history
   Context: Financial/healthcare domains with audit requirements
   Solution: Event store with CQRS projections for read performance

Accept all? Or specify numbers to keep/edit/remove.
```

Wait for user approval. User can:
- "all" / "accept" — Save everything
- "1,3" — Save only those numbers
- "remove 2" — Save all except those
- Edit specific entries by providing corrections
</step>

<step name="deduplicate">
**Compare each approved learning against existing LEARNINGS.md entries:**

For each new learning:
1. Search existing entries in the same category for similar patterns
2. Compare the Pattern field — fuzzy match on key terms

| Match type | Action |
|-----------|--------|
| Exact duplicate (same pattern + context) | Skip — report as "already captured" |
| Similar pattern, new context | Merge — append new context/solution to existing entry |
| Related but distinct | Add as new — include cross-reference `(see also: [existing title])` |
| No match | Add as new entry |

Report dedup results:
```
Deduplication:
- "Prisma P2002" — NEW (no existing match)
- "strace for debugging" — MERGED with "Network debugging tools" (added new context)
- "Event sourcing" — SKIPPED (exact duplicate from session 2025-03-01)
```
</step>

<step name="write_learnings">
**Create or update `.planning/LEARNINGS.md`:**

If file doesn't exist, create with structure:

```markdown
# Project Learnings

> Reusable patterns extracted from development sessions.
> Consulted during planning and debugging to avoid repeated mistakes.

## Error Resolution

## Debugging

## Architecture

## Tool/Library

## Workflow

## Performance

## Security

## Testing
```

For each approved, non-duplicate learning, add under the appropriate category:

```markdown
### [Title]
- **Pattern:** [What happened / what was discovered]
- **Context:** [When/where this applies — be specific]
- **Solution:** [What to do about it — actionable steps]
- **Added:** [YYYY-MM-DD]
```

**Ordering:** Most recent entries first within each category.

**Size management:** If file exceeds 300 lines:
- Count entries per category
- Archive oldest entries (keep most recent 10 per category)
- Archived entries move to `.planning/LEARNINGS-ARCHIVE.md`
</step>

<step name="commit_learnings">
**Commit the updated learnings file:**

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs: extract session learnings" --files .planning/LEARNINGS.md
```

If archive was created/updated:
```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs: archive older learnings" --files .planning/LEARNINGS-ARCHIVE.md
```
</step>

<step name="report">
**Report what was captured:**

```
## Learnings Captured

| Action | Count | Details |
|--------|-------|---------|
| Added | {N} | {titles} |
| Merged | {N} | {titles} (new context added to existing) |
| Skipped | {N} | {titles} (already captured) |
| Archived | {N} | Oldest entries moved to LEARNINGS-ARCHIVE.md |

File: .planning/LEARNINGS.md ({total} learnings across {categories} categories)
```
</step>

</process>

<integration>
**How learnings feed back into GSD workflows:**

- **Planning (/gsd:plan-phase):** Planner reads LEARNINGS.md to avoid known pitfalls and apply proven patterns
- **Debugging (/gsd:debug):** Debugger checks LEARNINGS.md for previously-solved similar errors
- **Execution (/gsd:execute-phase):** Executor consults LEARNINGS.md for architecture decisions and tool preferences
- **Verification (/gsd:verify-work):** Verifier checks against known failure patterns

Learnings are project-local (`.planning/`), not global. Different projects accumulate different knowledge.
</integration>

<failure_handling>
- **No extractable learnings in session:** Report "No actionable patterns found in this session" — don't force learnings
- **LEARNINGS.md corrupted:** Back up existing file, create fresh, report what was lost
- **Dedup uncertain:** Present both old and new entries to user for manual decision
</failure_handling>

<success_criteria>
- [ ] Session analyzed for patterns across all 8 categories
- [ ] Quality filter applied (specific, actionable, non-obvious)
- [ ] User approved which learnings to save
- [ ] Deduplicated against existing entries
- [ ] LEARNINGS.md created or updated with structured entries
- [ ] File committed
- [ ] Size management applied if over 300 lines
</success_criteria>
