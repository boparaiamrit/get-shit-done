# THE COMPLETE PACKAGE: Universal Agentic Development System

**Date:** March 9, 2026  
**Scope:** A production-grade, project-agnostic system for AI-assisted development  
**Goal:** Combine the best of GSD, persistent memory, multi-agent orchestration, security verification, and cost control into one composable architecture that works for any project — greenfield or brownfield, solo or team.

---

## WHY THIS EXISTS

The 2026 agentic coding landscape is fragmented:

| Tool | What It Solves | What It Misses |
|------|---------------|----------------|
| **GSD** | Context rot, spec-driven planning, atomic execution | Memory, security, cost, team workflows |
| **Claude Code Agent Teams** | Parallel execution, inter-agent messaging | Planning structure, memory, verification |
| **Claude-Mem / memsearch** | Session-to-session memory | No planning, no orchestration, token overhead |
| **CLAUDE.md + Auto-Memory** | Persistent rules, learned patterns | Not searchable, no semantic recall, static |
| **Memory-MCP servers** | Semantic search over memories | Unreliable recall (agent must choose to search), expensive |
| **BMAD / Taskmaster / SpecKit** | Structured planning | Context rot (single context), enterprise ceremony |
| **Raw Claude Code** | Maximum flexibility, zero overhead | No structure, no memory, context rot |

**No single tool is complete.** Everyone picks one and suffers its blind spots.

This system is **composable** — three independent layers you adopt incrementally. Use one layer alone, or stack all three. Nothing is all-or-nothing.

---

## ARCHITECTURE OVERVIEW

```
┌──────────────────────────────────────────────────────────────┐
│                  LAYER 3: ORCHESTRATION                       │
│    When to use single agent vs multi-agent vs agent teams    │
│    Role-based agents, wave execution, cost routing           │
├──────────────────────────────────────────────────────────────┤
│                  LAYER 2: PLANNING & VERIFICATION            │
│    Discuss → Plan → Execute → Verify → Security Gate         │
│    Test-first plans, cross-phase regression, escape hatches  │
├──────────────────────────────────────────────────────────────┤
│                  LAYER 1: MEMORY & CONTEXT                   │
│    Four-tier memory: always-loaded → scoped → learned →      │
│    searchable. Subagent bootstrap protocol. State files.     │
└──────────────────────────────────────────────────────────────┘
```

---

## LAYER 1: MEMORY & CONTEXT

### The Core Problem

Every Claude Code session starts blank. Every subagent starts blanker. You re-explain your project, your patterns, your past decisions. GSD solves context rot by using fresh contexts — but fresh contexts have zero memory. Agent Teams spawn teammates with project context but no conversation history. Memory tools exist but they're either always-on (burning tokens) or opt-in (agent forgets to search).

### The Solution: Four-Tier Memory Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  TIER 1: CLAUDE.md — ALWAYS LOADED (~200 lines max)          │
│  ─────────────────────────────────────────────────────────── │
│  Project identity, architecture, hard rules, conventions     │
│  Loaded into EVERY session and EVERY subagent automatically  │
│  Survives /compact. This is your guaranteed floor.           │
│                                                              │
│  Keep it UNDER 200 lines. Over 200 → adherence drops from   │
│  92% to 71%. Move details to Tier 2.                         │
├──────────────────────────────────────────────────────────────┤
│  TIER 2: .claude/rules/ — LOADED WHEN RELEVANT              │
│  ─────────────────────────────────────────────────────────── │
│  Scoped rules in separate .md files. Each file loads ONLY    │
│  when Claude works on matching file paths.                   │
│                                                              │
│  Example: rules/auth.md loads only when touching auth code.  │
│  rules/database.md loads only when touching migrations.      │
│                                                              │
│  This keeps CLAUDE.md small and rules contextually relevant. │
│  Zero token cost when not triggered.                         │
├──────────────────────────────────────────────────────────────┤
│  TIER 3: Auto-Memory — CLAUDE LEARNS OVER TIME              │
│  ─────────────────────────────────────────────────────────── │
│  Built into Claude Code. Claude saves notes from your        │
│  corrections automatically. Plain markdown in                │
│  ~/.claude/memory/. Human-editable.                          │
│                                                              │
│  "Don't use library X, use library Y" → remembered forever.  │
│  Browse with /memory. Curate regularly — delete wrong ones.  │
│  Subagents can maintain their own auto-memory.               │
├──────────────────────────────────────────────────────────────┤
│  TIER 4: Searchable State — ON-DEMAND DEEP CONTEXT          │
│  ─────────────────────────────────────────────────────────── │
│  For decisions, incidents, research that don't fit in        │
│  CLAUDE.md but need to survive across months of sessions.    │
│                                                              │
│  Option A: File-based (.planning/decisions/, .planning/      │
│  incidents/) — simple, git-tracked, zero overhead.           │
│                                                              │
│  Option B: MCP Memory Server (memory-mcp, claude-mem,        │
│  mcp-memory-service) — semantic search, more overhead.       │
│                                                              │
│  Start with Option A. Graduate to Option B only if you       │
│  have 50+ decision records and grep isn't cutting it.        │
└──────────────────────────────────────────────────────────────┘
```

### CLAUDE.md Template (Universal)

```markdown
# [Project Name]

## Architecture
- [Stack: e.g., Next.js + PostgreSQL + Redis]
- [Pattern: e.g., monorepo, microservices, serverless]
- [Key constraint: e.g., multi-tenant, real-time, offline-first]

## Hard Rules (non-negotiable)
- [Rule 1: e.g., All DB queries must include tenant scoping]
- [Rule 2: e.g., No raw SQL — use ORM/query builder only]
- [Rule 3: e.g., All API endpoints require auth middleware]
- [Rule 4: e.g., Never log PII or secrets, even at debug level]

## Conventions
- [Naming: e.g., camelCase for variables, PascalCase for components]
- [Errors: e.g., return { success: false, error: string, code: string }]
- [Tests: e.g., colocated — feature.test.ts next to feature.ts]
- [Commits: e.g., conventional commits: feat(), fix(), docs()]

## Memory Protocol
Before starting any implementation task:
1. Read .planning/STATE.md for current project state
2. Read relevant files in .planning/decisions/ for past decisions
3. After completing work, update STATE.md with what changed and why
4. If you discover a pattern or gotcha, add to .planning/decisions/
```

### Scoped Rules Template (.claude/rules/)

```
.claude/rules/
├── security.md          # Auth, validation, secrets — loads for auth/** files
├── database.md          # Migrations, queries, schema — loads for db/** files
├── api.md               # Endpoint patterns, error handling — loads for api/** files
├── frontend.md          # Component patterns, state — loads for ui/** or app/** files
├── testing.md           # Test conventions, coverage — loads for *.test.* files
└── deployment.md        # CI/CD, env vars, infra — loads for infra/** files
```

Each file: 30-80 lines max. Specific, verifiable instructions. Not prose.

### Searchable State Structure (.planning/)

```
.planning/
├── STATE.md                    # Current: what's in progress, what's blocked, what's next
├── decisions/
│   ├── 001-auth-strategy.md    # Why we chose X over Y
│   ├── 002-database-schema.md  # Schema decisions and rationale
│   └── 003-api-versioning.md   # How and why we version APIs
├── incidents/
│   ├── 001-data-leak-fix.md    # What happened, root cause, prevention
│   └── 002-perf-regression.md  # What happened, root cause, prevention
├── research/
│   ├── payment-providers.md    # Research findings for future reference
│   └── caching-strategies.md   # Evaluated options and conclusions
└── codebase/                   # Generated by /gsd:map-codebase or manually
    ├── ARCHITECTURE.md
    ├── CONVENTIONS.md
    ├── STACK.md
    └── CONCERNS.md
```

**Decision record template:**
```markdown
# Decision: [Title]
**Date:** YYYY-MM-DD
**Status:** Accepted / Superseded by #NNN

## Context
[What situation prompted this decision]

## Options Considered
1. [Option A] — [tradeoffs]
2. [Option B] — [tradeoffs]

## Decision
[What we chose and why]

## Consequences
[What this means for future work]
```

### The Subagent Memory Gap (Critical Fix)

When GSD or Agent Teams spawn a subagent, it gets:
- ✅ CLAUDE.md (auto-loaded)
- ✅ .claude/rules/ (auto-loaded for matching files)
- ✅ Its spawn prompt
- ❌ Your conversation history
- ❌ Tier 4 memories (unless told to look)

**Fix: The Memory Bootstrap Protocol** (already in CLAUDE.md template above)

This block in CLAUDE.md forces every subagent to:
1. Read STATE.md before starting
2. Read relevant decisions before implementing
3. Write back what it learned after finishing

Because CLAUDE.md loads automatically into every subagent, this protocol propagates without any extra configuration. The "Memory Protocol" section in CLAUDE.md is the single most impactful thing you can add.

**For MCP Memory Server users**, add to the protocol:
```markdown
## Memory Protocol (MCP variant)
Before starting any implementation task:
1. Call memory_search("[topic of current task]") to find past decisions
2. Read .planning/STATE.md for current project state
3. After completing work, call memory_store() with key decisions made
4. Update STATE.md with what changed and why
```

---

## LAYER 2: PLANNING & VERIFICATION

### GSD's Workflow, Fixed

GSD's discuss → plan → execute → verify is the right skeleton. Here's what to change:

```
┌─────────────┐   ┌──────────────┐   ┌─────────────┐   ┌──────────────┐   ┌───────────┐
│  1. DISCUSS  │──▶│  2. PLAN     │──▶│  3. EXECUTE  │──▶│  4. VERIFY   │──▶│ 5. SECURE │
│             │   │              │   │             │   │              │   │           │
│ Lock gray   │   │ Test specs   │   │ Fresh ctx   │   │ Functional   │   │ Static    │
│ areas before│   │ BEFORE impl  │   │ per plan    │   │ checks +     │   │ analysis  │
│ any code    │   │ in each task │   │ Atomic      │   │ full-suite   │   │ Dep audit │
│             │   │              │   │ commits     │   │ regression   │   │ Custom    │
│             │   │ Allow >3     │   │             │   │              │   │ checks    │
│             │   │ tasks when   │   │             │   │              │   │           │
│             │   │ justified    │   │             │   │              │   │           │
└─────────────┘   └──────────────┘   └─────────────┘   └──────────────┘   └───────────┘
```

### Change 1: Test-First Plan Templates

GSD's current plan template has `<verify>` as a post-hoc check. Add `<test_first>`:

```xml
<task type="auto">
  <n>Create rate limiting middleware</n>
  <test_first>
    Write tests BEFORE implementation:
    - 5 requests in 1 minute → all pass
    - 6th request in same minute → returns 429
    - After 1 minute cooldown → requests pass again
    - Different API keys tracked independently
  </test_first>
  <files>src/middleware/rate-limiter.ts, src/middleware/rate-limiter.test.ts</files>
  <action>
    Implement rate limiter that passes the tests above.
    Use sliding window algorithm with Redis backend.
  </action>
  <verify>npm test -- rate-limiter passes all 4 cases</verify>
  <done>Rate limiting works per API key with 1-minute sliding window</done>
</task>
```

The test spec tells the executor exactly what "done" looks like BEFORE it writes implementation code. This is TDD enforced at the plan level.

### Change 2: Flexible Task Granularity

GSD caps at 3 tasks per plan. Sometimes that forces artificial splits:

```
BEFORE (forced split — coordination problem):
  Plan 1: Create user model + migration (2 tasks)
  Plan 2: Create user API endpoints (2 tasks)
  Plan 3: Create user auth middleware (2 tasks)
  → Plan 2 and 3 depend on Plan 1. Sequential execution only.
  → If Plan 1 changes schema, Plans 2-3 may break.

AFTER (allow 5 tasks when tightly coupled):
  Plan 1: Create user module — model, migration, API, auth, tests (5 tasks)
  → Single fresh context. All tasks see each other's changes.
  → Still atomic commits per task within the plan.
```

**Rule: Default to 2-3 tasks. Allow up to 5 when the tasks share state that would be lost across plan boundaries.** Add to CLAUDE.md:

```markdown
## Planning Rules
- Default: 2-3 tasks per plan
- Exception: up to 5 tasks when they share schema, types, or interfaces
  that would cause coordination problems if split across plans
- Each task still gets its own atomic commit regardless of plan size
```

### Change 3: Cross-Phase Regression Testing

GSD verifies each phase in isolation. Phase 3 can break Phase 1's work.

**Fix:** Add to CLAUDE.md:

```markdown
## Post-Execution Rule
After completing ANY phase or plan execution:
1. Run the FULL test suite, not just new tests
2. If any EXISTING test fails, this is a regression
3. Report regressions before marking phase as complete
4. Do NOT proceed to next phase with failing tests
```

### Change 4: Security Gate

A dedicated verification step that runs after functional verification:

**Automated (hook-based):**
```bash
#!/bin/bash
# .claude/hooks/security-gate.sh

echo "=== SECURITY GATE ==="

# Static analysis (language-aware)
if command -v semgrep &> /dev/null; then
  semgrep --config=auto --error src/ 2>&1
fi

# Dependency vulnerabilities
if [ -f "package-lock.json" ]; then
  npm audit --audit-level=high 2>&1
elif [ -f "requirements.txt" ]; then
  pip-audit -r requirements.txt 2>&1
elif [ -f "Cargo.lock" ]; then
  cargo audit 2>&1
fi

# Secrets detection
if command -v gitleaks &> /dev/null; then
  gitleaks detect --source . --no-git 2>&1
else
  # Fallback: basic grep
  grep -rn "password\s*=\|api_key\s*=\|secret\s*=" src/ \
    --include="*.ts" --include="*.js" --include="*.py" \
    | grep -v ".test." | grep -v "process.env" | grep -v "os.environ"
fi

echo "=== SECURITY GATE COMPLETE ==="
```

**Agent-based (for deeper review):**

Spawn a security reviewer subagent with this prompt:
```
You are a security code reviewer. Review the diff of changes made in
the last phase for:
1. Injection vulnerabilities (SQL, XSS, command injection)
2. Authentication/authorization bypasses
3. Sensitive data exposure (logging, error messages, API responses)
4. Hardcoded secrets or credentials
5. Missing input validation
6. Insecure defaults

Read .planning/incidents/ for past security issues in this project.
Read .claude/rules/security.md for project-specific security rules.

Output:
- CRITICAL: [issue + file + line] — blocks merge
- WARNING: [issue + file + line] — should fix
- CLEAN: No security issues found
```

### Change 5: Cost-Aware Model Routing

The single biggest cost lever. Don't use Opus for everything:

| Agent Role | Recommended Model | Reasoning |
|-----------|-------------------|-----------|
| Discussion / requirements | Opus | Deep reasoning about ambiguity |
| Research | Sonnet | Summarization, not architecture |
| Plan creation | Opus | Architectural decisions |
| Plan verification / checking | Sonnet | Pattern matching, not invention |
| Code execution / implementation | Sonnet | Code gen is Sonnet's sweet spot |
| Functional verification | Sonnet | Checklist-style checking |
| Security review | Opus | Deep reasoning about attack vectors |
| Bug debugging | Opus | Root cause analysis needs depth |
| Quick mode tasks | Sonnet | Speed + cost for simple work |

**Impact:** 40-60% cost reduction vs all-Opus, with quality maintained where it matters.

For GSD: `/gsd:set-profile balanced` gets close, but manually override security verification to Opus.

For Agent Teams: Currently all agents run the same model (Opus 4.6 required). Workaround: spawn separate Claude Code processes with `--model sonnet` for implementation agents, losing native coordination. Track the community request for per-agent model selection.

---

## LAYER 3: ORCHESTRATION

### Decision Matrix — When to Use What

```
┌─────────────────────────────────────────────────────────────┐
│  TASK COMPLEXITY           →  ORCHESTRATION APPROACH         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Trivial (typo, config)   →  Direct Claude Code session     │
│  No planning needed.         No tools. Just do it.          │
│                                                             │
│  Small (bug fix, tweak)   →  /gsd:quick or single subagent  │
│  < 100 lines changed.       Atomic commit. State tracking.  │
│                                                             │
│  Medium (new endpoint,    →  GSD: discuss → plan → execute  │
│  new component, ~500 LOC)    → verify → security gate       │
│  1-3 plans.                  Fresh contexts. Test-first.     │
│                                                             │
│  Large (new module,       →  GSD full workflow OR            │
│  major feature, ~2000 LOC)   Agent Teams with roles          │
│  4-8 plans, 2-3 phases.     Parallel execution in waves.    │
│                                                             │
│  Massive (rewrite,        →  Agent Teams + GSD planning      │
│  new system, >5000 LOC)      Multiple milestones.            │
│  Multiple milestones.        Consider if this should be      │
│                              broken into separate projects.   │
└─────────────────────────────────────────────────────────────┘
```

### Agent Team Composition (Role-Based)

For complex work, spawn specialized agents:

```
YOU (interact with LEAD)
  │
  ▼
TEAM LEAD
  │
  ├── ARCHITECT
  │   Context: ARCHITECTURE.md, DATA-MODEL.md, decisions/
  │   Job: Review plans for consistency, flag design issues
  │   Model: Opus
  │
  ├── IMPLEMENTER(s) (1-3 depending on scope)
  │   Context: PLAN.md, CONVENTIONS.md, relevant source files
  │   Job: Write code according to plans
  │   Model: Sonnet (cost-effective for code gen)
  │
  ├── SECURITY REVIEWER
  │   Context: incidents/, rules/security.md, security tools
  │   Job: Review every change for vulnerabilities
  │   Model: Opus (deep reasoning about attack surfaces)
  │
  └── TEST ENGINEER
      Context: Test patterns, coverage thresholds, existing tests
      Job: Write tests, run full suite, report regressions
      Model: Sonnet
```

**Communication flow:**
```
LEAD assigns task → IMPLEMENTER
  IMPLEMENTER completes → messages SECURITY REVIEWER
    SECURITY REVIEWER approves/flags → messages TEST ENGINEER
      TEST ENGINEER runs tests → reports to LEAD
        LEAD synthesizes → reports to you
```

**When NOT to use Agent Teams:**
- Task is simple enough for one agent (most tasks)
- You need tight control over exactly what happens (use single session)
- Token budget is limited (teams burn tokens linearly per agent)
- The feature doesn't have separable concerns (no benefit to specialization)

**When Agent Teams shine:**
- Complex refactoring touching many files with different concerns
- Features requiring simultaneous security, performance, and functional analysis
- Large PRs needing multi-perspective code review
- Research tasks where parallel investigation beats sequential

### Parallel Execution Patterns

**GSD's wave pattern (for planned work):**
```
Wave 1: [Plan A] [Plan B] [Plan C]    ← independent, run parallel
         ↓         ↓         ↓
Wave 2: [Plan D] [Plan E]              ← depend on Wave 1, run parallel
         ↓         ↓
Wave 3: [Plan F]                       ← depends on Wave 2, runs alone
```

**Agent Teams pattern (for collaborative work):**
```
LEAD decomposes task → assigns subtasks to teammates
  Teammates work independently in own context windows
  Teammates message each other when they need coordination
  LEAD collects results when all teammates report complete
```

**Hybrid (best of both):**
```
Use GSD for planning (discuss → plan → create PLAN.md files)
Use Agent Teams for execution (spawn specialists per plan)
Use GSD for verification (verify against goals + security gate)
```

This gives you GSD's structured planning with Agent Teams' specialized execution.

---

## BROWNFIELD PROTOCOL (Existing Projects)

Most tools assume greenfield. Here's how to adopt this system for an existing codebase:

### Step 1: Generate Codebase Intelligence (Day 1)

```bash
# Option A: Use GSD's map-codebase
/gsd:map-codebase

# Option B: Manually create (more control)
mkdir -p .planning/codebase
# Then ask Claude to analyze and write:
# ARCHITECTURE.md, CONVENTIONS.md, STACK.md, CONCERNS.md
```

### Step 2: Document Existing Decisions (Day 1-2)

Mine your git history, PR comments, and team knowledge:
```bash
mkdir -p .planning/decisions
# Create decision records for every "why did we do it this way?"
# Focus on: database schema choices, auth strategy, API patterns,
# dependency selections, deployment architecture
```

### Step 3: Document Past Incidents (Day 2)

```bash
mkdir -p .planning/incidents
# Create incident records for every past bug/outage/security issue
# Focus on: root cause, fix, pattern to prevent recurrence
```

### Step 4: Create CLAUDE.md + Rules (Day 2-3)

Use the templates from Layer 1. The CLAUDE.md should reflect your existing architecture, not an ideal future state.

### Step 5: Start Using Incrementally (Day 3+)

Don't try to retrofit the entire codebase. Apply the system to NEW work:
- Next bug fix → use /gsd:quick with the new CLAUDE.md
- Next feature → use discuss → plan → execute with security gate
- Observe what the agents get wrong → fix in CLAUDE.md or rules/
- Curate auto-memory weekly → delete wrong patterns

### The "Strangler Fig" Approach

Like the strangler fig pattern for legacy systems: wrap the old project in the new system gradually. Don't rewrite. Don't force-migrate. Let the new system grow around the old one.

```
Month 1: CLAUDE.md + rules + STATE.md (memory layer only)
Month 2: Add planning workflow for new features
Month 3: Add Agent Teams for complex work
Month 4: Full system operational, old ad-hoc workflow fades out
```

---

## COST MODEL

### Estimated Token Costs (Sonnet-heavy routing)

| Workflow | Estimated Cost | Time |
|----------|---------------|------|
| Direct Claude Code session (30 min) | $0.20 - $1 | 30 min |
| Bug fix via /gsd:quick | $0.50 - $2 | 5-15 min |
| Medium feature (3 plans, discuss+plan+execute+verify) | $5 - $15 | 30-60 min |
| Complex feature (5+ plans, security gate) | $15 - $40 | 1-3 hours |
| Agent Team (4 agents, complex task) | $40 - $100 | 1-3 hours |
| Full milestone (5 phases, 15 plans) | $80 - $250 | 1-2 days |

### vs. All-Opus (GSD default "quality" profile)

Multiply above by 3-5x. A full milestone on all-Opus can hit $500-1000+.

### Cost Reduction Levers

1. **Model routing** (biggest lever) — Sonnet for execution, Opus for thinking. 40-60% savings.
2. **Skip research** for known stacks — `--skip-research` saves 4 parallel agent spawns.
3. **Scoped rules** — rules that only load for matching files save tokens every session.
4. **CLAUDE.md under 200 lines** — shorter = cheaper context per message.
5. **Batch small tasks** — one /gsd:quick instead of three separate sessions.
6. **Cache codebase analysis** — run map-codebase once per sprint, not per feature.
7. **Set budget caps** — add to CLAUDE.md: "Keep research summaries under 500 words."

---

## WHAT THIS SYSTEM GIVES YOU THAT NOTHING ELSE DOES

| Capability | GSD Alone | Agent Teams Alone | This System |
|-----------|-----------|-------------------|-------------|
| Context rot prevention | ✅ | ✅ | ✅ |
| Persistent memory across sessions | ❌ | ❌ | ✅ (4-tier) |
| Memory propagation to subagents | ❌ | Partial | ✅ (bootstrap protocol) |
| Spec-driven planning | ✅ | ❌ | ✅ |
| Test-first enforcement | ❌ | ❌ | ✅ |
| Security verification | ❌ | ❌ | ✅ (gate + agent) |
| Cross-phase regression testing | ❌ | ❌ | ✅ |
| Cost-aware model routing | Partial | ❌ | ✅ |
| Flexible task granularity | ❌ (max 3) | ✅ | ✅ (default 3, up to 5) |
| Brownfield adoption path | Partial | ❌ | ✅ (strangler fig) |
| Team handoff workflow | ❌ | Partial | ✅ |
| Incident learning / prevention | ❌ | ❌ | ✅ (incident records) |
| Composable (use pieces independently) | ❌ (all or nothing) | ✅ | ✅ |

---

## IMPLEMENTATION TIMELINE

### Week 1 — Memory Foundation (Layer 1 only)

- [ ] Create CLAUDE.md using the template
- [ ] Create .claude/rules/ with 3-5 scoped rule files
- [ ] Enable auto-memory in Claude Code
- [ ] Create .planning/ structure (STATE.md, decisions/, incidents/)
- [ ] For brownfield: generate codebase analysis (map-codebase or manual)
- [ ] For brownfield: document top 5 past decisions and top 3 incidents
- [ ] Test: run a normal session, verify agents read STATE.md

### Week 2 — Planning Workflow (Layer 2)

- [ ] Install GSD: `npx get-shit-done-cc@latest`
- [ ] Add test_first block to plan template (modify locally)
- [ ] Create security gate hook script
- [ ] Add post-execution regression rule to CLAUDE.md
- [ ] Test: run one feature through discuss → plan → execute → verify → secure
- [ ] Measure token cost, adjust model routing if needed

### Week 3 — Multi-Agent (Layer 3)

- [ ] Enable Agent Teams: add `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` to settings
- [ ] Create spawn prompts for: architect, implementer, security reviewer, test engineer
- [ ] Test: spawn a 3-agent team on a medium feature
- [ ] Compare cost/quality vs single-agent GSD workflow
- [ ] Decide: when does the team overhead justify itself?

### Week 4 — Optimize

- [ ] Curate auto-memory (delete wrong patterns, reinforce good ones)
- [ ] Tune CLAUDE.md based on what agents keep getting wrong
- [ ] Update .planning/decisions/ with decisions made during Weeks 1-3
- [ ] Create a "Getting Started" doc for collaborators / team members
- [ ] Establish cadence: weekly memory curation, per-sprint codebase refresh

---

## QUICK START (15 minutes)

If you want to start right now with minimum setup:

```bash
# 1. Create CLAUDE.md at project root (use template above, ~50 lines)
touch CLAUDE.md

# 2. Create minimal state structure
mkdir -p .planning/decisions .planning/incidents
echo "# Project State\n\n## Current: Setting up agentic workflow" > .planning/STATE.md

# 3. Install GSD
npx get-shit-done-cc@latest

# 4. Verify
# Open Claude Code, run /gsd:help
```

That's it. You now have:
- Persistent context (CLAUDE.md)
- Shared state (STATE.md)
- Decision tracking (.planning/decisions/)
- GSD's full planning + execution workflow

Add layers as you need them. The system grows with you.

---

## ONE-LINE SUMMARY

**GSD's architecture (fresh contexts, externalized state, atomic commits) + four-tier persistent memory (always-loaded → scoped → learned → searchable with subagent bootstrap protocol) + security gate (static analysis + security reviewer agent) + cost-aware model routing (Opus for thinking, Sonnet for doing) + flexible task granularity + cross-phase regression testing + brownfield adoption path = the complete package.**
