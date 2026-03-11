<purpose>
Chain multiple GSD agents in sequence with structured handoffs. Each agent receives the previous agent's findings and produces a handoff document for the next. Supports predefined workflows (feature, bugfix, refactor, security) and custom agent sequences.

Orchestrator stays lean: resolve chain, spawn agents one at a time (or in parallel for independent stages), collect handoffs, produce final recommendation.
</purpose>

<core_principle>
**Structured handoffs beat ad-hoc coordination.** Each agent writes a formal handoff document with Context, Findings, Files Modified, Open Questions, and Recommendations. The next agent reads this document — not the orchestrator's summary — ensuring zero information loss between stages. The orchestrator coordinates but never interprets findings.
</core_principle>

<process>

<step name="initialize" priority="first">
Load project context:

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state load)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

```bash
mkdir -p .planning/handoffs
```

Parse $ARGUMENTS to determine workflow type and optional description.

If no arguments provided:
```
AskUserQuestion:
  header: "Orchestrate"
  question: "What type of workflow do you want to orchestrate?"
  options:
    - "feature" — Full feature pipeline: research → plan → check → execute → verify
    - "bugfix" — Bug fix pipeline: debug → plan → execute → verify
    - "refactor" — Refactor pipeline: map → plan → execute → integration check
    - "security" — Security audit: map → verify (security focus)
    - "custom" — I'll specify the agent sequence
```
</step>

<step name="resolve_chain">
**Map workflow type to agent chain:**

| Workflow | Chain | Parallel opportunities |
|----------|-------|----------------------|
| `feature` | gsd-researcher → gsd-planner → gsd-plan-checker → gsd-executor → gsd-verifier | None (strictly sequential) |
| `bugfix` | gsd-debugger → gsd-planner → gsd-executor → gsd-verifier | None (strictly sequential) |
| `refactor` | gsd-codebase-mapper → gsd-planner → gsd-executor → gsd-verifier | Mapper can run code review in parallel |
| `security` | gsd-codebase-mapper → gsd-verifier | Mapper + verifier can run in parallel (independent focus areas) |
| `custom` | User-specified sequence | User indicates which agents can run in parallel |

**For custom chains:**
Parse comma-separated agent list from arguments: `custom agent1,agent2,agent3`

Validate each agent exists:
```bash
for agent in $AGENT_LIST; do
  if [ ! -f "$HOME/.claude/get-shit-done/agents/${agent}.md" ]; then
    echo "Agent not found: ${agent}"
  fi
done
```

If any agent not found, report available agents and ask user to correct.

**Generate session ID:**
```bash
SESSION_ID=$(date +%Y%m%d-%H%M%S)-${WORKFLOW_TYPE}
```
</step>

<step name="gather_context">
**Get task description from user:**

If $ARGUMENTS contains description text beyond workflow type, use that.

Otherwise:
```
AskUserQuestion:
  header: "Task Description"
  question: "Describe what you want to accomplish. This context will be passed to all agents in the chain."
```

Store as `TASK_DESCRIPTION` — passed to every agent via handoff.
</step>

<step name="execute_chain">
**Execute agents in sequence (or parallel where noted):**

For each agent in the chain:

1. **Resolve agent model:**
```bash
AGENT_MODEL=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" resolve-model ${AGENT_TYPE} --raw)
```

2. **Build agent prompt with handoff context:**

```markdown
<objective>
{Role-specific objective based on agent type and task description}

**Task:** {TASK_DESCRIPTION}
**Chain position:** Agent {N} of {total} in {WORKFLOW_TYPE} workflow
**Session:** {SESSION_ID}
</objective>

<prior_handoffs>
{If first agent: "No prior handoffs — you are the first agent in the chain."}
{If subsequent: list of handoff file paths to read}
</prior_handoffs>

<files_to_read>
- .planning/STATE.md (Project state)
- .planning/ROADMAP.md (Roadmap, if exists)
{Prior handoff file paths}
- ./CLAUDE.md (Project instructions, if exists)
</files_to_read>

<handoff_output>
When complete, create a handoff document at:
.planning/handoffs/{SESSION_ID}/{NN}-{agent-type}-handoff.md

Use this exact structure:

---
agent: {agent-type}
session: {SESSION_ID}
position: {N}/{total}
status: complete | blocked | needs-input
timestamp: {ISO timestamp}
---

## Context
{What you were asked to do and any constraints}

## Findings
{Key discoveries, analysis results, or decisions made}
{Be specific — file paths, line numbers, evidence}

## Files Modified
{List of files created, modified, or deleted — or "None" if read-only stage}

## Open Questions
{Unresolved issues, ambiguities, or risks for downstream agents}
{If none: "No open questions."}

## Recommendations
{What the next agent should focus on, prioritize, or watch out for}
{Specific, actionable guidance — not generic advice}
</handoff_output>
```

3. **Spawn agent:**

```
Task(
  prompt=filled_prompt,
  subagent_type="{AGENT_TYPE}",
  model="{AGENT_MODEL}",
  description="{WORKFLOW_TYPE} chain: {agent_type} ({N}/{total})"
)
```

4. **Verify handoff created:**
```bash
if [ -f ".planning/handoffs/${SESSION_ID}/${NN}-${AGENT_TYPE}-handoff.md" ]; then
  echo "Handoff created successfully"
else
  echo "WARNING: Agent did not create handoff document"
fi
```

If handoff missing, create a minimal one from agent's return text.

5. **Report progress:**
```
## Stage {N}/{total}: {Agent Type} — Complete

Status: {from handoff frontmatter}
Key findings: {1-2 line summary from Findings section}

{If more agents: "Proceeding to {next_agent}..."}
{If blocked: "Agent reported BLOCKED. See handoff for details."}
```

**If status is `blocked`:**
- Present blocking reason to user
- Options: "Provide input" / "Skip this stage" / "Abort chain"
- If skip: mark handoff as skipped, pass to next agent with note
- If abort: go to `final_recommendation` with partial results

**Parallel execution for independent agents:**

When two agents in the chain are independent (neither needs the other's handoff):
- Spawn both simultaneously via parallel Task calls
- Both receive the same prior handoff as input
- Both write separate handoff documents
- Merge handoffs for the next sequential agent
</step>

<step name="final_recommendation">
**Produce final recommendation after all agents complete (or chain aborted):**

Read all handoff documents in sequence:
```bash
ls .planning/handoffs/${SESSION_ID}/*.md | sort
```

Analyze across all handoffs:
- **SHIP:** All agents completed successfully, no open blockers, verifier passed
- **NEEDS WORK:** All agents completed but open questions or minor issues remain
- **BLOCKED:** Any agent reported blocked, or critical issues found

Create final summary:

```markdown
# Orchestration Summary: {SESSION_ID}

## Recommendation: {SHIP | NEEDS WORK | BLOCKED}

**Workflow:** {WORKFLOW_TYPE}
**Task:** {TASK_DESCRIPTION}
**Agents:** {N}/{total} completed

## Agent Results

| # | Agent | Status | Key Finding |
|---|-------|--------|-------------|
| 1 | {type} | {status} | {1-line summary} |
| 2 | {type} | {status} | {1-line summary} |
| ... | | | |

## Consolidated Findings
{Merged key findings from all handoffs — deduplicated}

## Open Questions
{Merged from all handoffs — deduplicated, attributed to source agent}

## Files Modified
{Union of all files modified across all agents}

## Handoff Documents
{List of all handoff file paths for detailed review}
```

Write to `.planning/handoffs/{SESSION_ID}/SUMMARY.md`

Present to user:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► ORCHESTRATION COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Recommendation: {SHIP | NEEDS WORK | BLOCKED}

{Agent results table}

{If NEEDS WORK: list open questions}
{If BLOCKED: list blockers with suggested resolution}

Full report: .planning/handoffs/{SESSION_ID}/SUMMARY.md
Handoff docs: .planning/handoffs/{SESSION_ID}/
```
</step>

</process>

<handoff_format>
**Every agent in the chain MUST produce a handoff document with this structure:**

```markdown
---
agent: {agent-type}
session: {session-id}
position: {N}/{total}
status: complete | blocked | needs-input
timestamp: {ISO timestamp}
---

## Context
{What was asked and constraints}

## Findings
{Specific discoveries with evidence}

## Files Modified
{Files changed or "None"}

## Open Questions
{Unresolved issues for downstream agents}

## Recommendations
{Actionable guidance for next agent}
```

This format is non-negotiable. Agents that don't produce a handoff document get a minimal one created from their return text.
</handoff_format>

<context_efficiency>
Orchestrator: ~10-15% context. Each agent: fresh 200k context with only the relevant prior handoff(s) loaded via `<files_to_read>`. No cumulative context bleed — agent 5 reads agent 4's handoff, not the full conversation.
</context_efficiency>

<failure_handling>
- **Agent fails to spawn:** Report error, offer to skip or retry with different model
- **Agent returns without handoff:** Create minimal handoff from return text, continue chain
- **Agent reports blocked:** Present to user, offer skip/abort/provide-input
- **Chain partially completes:** Produce final recommendation from completed stages only, note incomplete stages
- **Parallel agents both fail:** Systemic issue — report for manual investigation
- **Custom chain has invalid agent:** List available agents, ask user to correct
</failure_handling>

<success_criteria>
- [ ] Workflow type resolved (predefined or custom)
- [ ] Task description captured
- [ ] All agents spawned with correct handoff context
- [ ] Handoff document created after each agent stage
- [ ] Blocked agents handled (user input, skip, or abort)
- [ ] Independent agents executed in parallel where applicable
- [ ] Final recommendation produced (SHIP / NEEDS WORK / BLOCKED)
- [ ] Summary written to `.planning/handoffs/{session}/SUMMARY.md`
</success_criteria>
