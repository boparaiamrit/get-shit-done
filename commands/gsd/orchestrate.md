---
name: gsd:orchestrate
description: Chain multiple GSD agents in sequence with structured handoffs
argument-hint: "<workflow: feature|bugfix|refactor|security|custom> [agent1,agent2,...]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
  - AskUserQuestion
---

<objective>
Chain multiple GSD agents in sequence with structured handoffs between each stage.

Predefined chains handle common workflows (feature, bugfix, refactor, security). Custom chains allow arbitrary agent sequences. Each agent produces a handoff document that the next agent consumes, creating a traceable pipeline from investigation to delivery.

Output: handoff documents in `.planning/handoffs/`, final SHIP / NEEDS WORK / BLOCKED recommendation.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/orchestrate.md
</execution_context>

<context>
Workflow type: $ARGUMENTS

**Predefined chains:**
- `feature` — researcher -> planner -> plan-checker -> executor -> verifier
- `bugfix` — debugger -> planner -> executor -> verifier
- `refactor` — codebase-mapper -> planner -> executor -> integration-checker
- `security` — codebase-mapper -> verifier (security focus)
- `custom agent1,agent2,agent3` — user-specified agent sequence

Context files are resolved inside the workflow and per-subagent `<files_to_read>` blocks.
</context>

<process>
Execute the orchestrate workflow from @~/.claude/get-shit-done/workflows/orchestrate.md end-to-end.
Preserve all workflow gates (chain resolution, handoff creation, agent spawning, parallel execution, final recommendation).
</process>

<success_criteria>
- [ ] Workflow type resolved (predefined or custom)
- [ ] All agents in chain executed in sequence
- [ ] Handoff document created after each agent
- [ ] Independent agents executed in parallel where applicable
- [ ] Final recommendation produced (SHIP / NEEDS WORK / BLOCKED)
- [ ] Handoff docs stored in `.planning/handoffs/`
</success_criteria>
