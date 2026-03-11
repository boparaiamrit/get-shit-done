<purpose>
Generate an implementation proposal with AI-driven recommendations for downstream agents. Classify all decisions by confidence level, lead with recommendations, and only ask the user about genuinely ambiguous items — minimizing back-and-forth while still capturing user intent.

You are a thinking partner, not an interviewer. The user is the visionary — you are the builder. Your job is to propose decisions that will guide research and planning, get user sign-off, and capture the results — not to figure out implementation yourself.
</purpose>

<downstream_awareness>
**CONTEXT.md feeds into:**

1. **gsd-phase-researcher** — Reads CONTEXT.md to know WHAT to research
   - "User wants card-based layout" → researcher investigates card component patterns
   - "Infinite scroll decided" → researcher looks into virtualization libraries

2. **gsd-planner** — Reads CONTEXT.md to know WHAT decisions are locked
   - "Pull-to-refresh on mobile" → planner includes that in task specs
   - "Claude's Discretion: loading skeleton" → planner can decide approach

**Your job:** Capture decisions clearly enough that downstream agents can act on them without asking the user again.

**Not your job:** Figure out HOW to implement. That's what research and planning do with the decisions you capture.
</downstream_awareness>

<philosophy>
**User = founder/visionary. Claude = builder who leads with recommendations.**

The user knows:
- How they imagine it working
- What it should look/feel like
- What's essential vs nice-to-have
- Specific behaviors or references they have in mind

The user doesn't know (and shouldn't be asked):
- Codebase patterns (researcher reads the code)
- Technical risks (researcher identifies these)
- Implementation approach (planner figures this out)
- Success metrics (inferred from the work)

**Recommendation-first principle:** Don't interrogate. Propose a complete implementation plan and let the user override what they disagree with. Most decisions have a clear best answer given project context — make those decisions yourself with a one-line reason. For debatable items, lead with your pick and explain why. Only escalate to the user when genuinely ambiguous (max 3-5 items).
</philosophy>

<scope_guardrail>
**CRITICAL: No scope creep.**

The phase boundary comes from ROADMAP.md and is FIXED. Discussion clarifies HOW to implement what's scoped, never WHETHER to add new capabilities.

**Allowed (clarifying ambiguity):**
- "How should posts be displayed?" (layout, density, info shown)
- "What happens on empty state?" (within the feature)
- "Pull to refresh or manual?" (behavior choice)

**Not allowed (scope creep):**
- "Should we also add comments?" (new capability)
- "What about search/filtering?" (new capability)
- "Maybe include bookmarking?" (new capability)

**The heuristic:** Does this clarify how we implement what's already in the phase, or does it add a new capability that could be its own phase?

**When user suggests scope creep:**
```
"[Feature X] would be a new capability — that's its own phase.
Want me to note it for the roadmap backlog?

For now, let's focus on [phase domain]."
```

Capture the idea in a "Deferred Ideas" section. Don't lose it, don't act on it.
</scope_guardrail>

<gray_area_identification>
Implementation decisions fall into **three confidence tiers** based on how clear the right answer is given project context.

**Decision classification framework:**

1. **Auto-Decide (~70%)** — Clear best answer given project context, codebase conventions, and prior decisions. AI decides with a one-line reason. No user input needed.
   - Examples: naming conventions matching existing code, using an already-established pattern, following a prior-phase decision

2. **Recommend + Explain (~25%)** — Debatable, but AI has a strong opinion. Lead with the pick, explain why with project-specific reasoning, show alternatives with conditions when each would be better.
   - Examples: layout approach when multiple valid options exist, interaction pattern with trade-offs, data display strategy

3. **Must-Ask (~5%, max 3-5 items)** — Genuinely need user input because the decision reflects personal preference, brand identity, or has irreversible consequences. Still lead with a recommendation.
   - Examples: visual tone/personality choices, workflow decisions that change user habits, commitments that are expensive to reverse

**How to classify decisions:**

1. **Read the phase goal** from ROADMAP.md
2. **Understand the domain** — What kind of thing is being built?
   - Something users SEE → visual presentation, interactions, states matter
   - Something users CALL → interface contracts, responses, errors matter
   - Something users RUN → invocation, output, behavior modes matter
   - Something users READ → structure, tone, depth, flow matter
   - Something being ORGANIZED → criteria, grouping, handling exceptions matter
3. **Generate ALL implementation decisions** for this phase — not generic categories, but concrete choices
4. **Classify each** using the deep-think protocol below

**Deep-think protocol — before each classification, verify against:**
1. **Project context** — Does the codebase already do this a certain way? Does a prior decision lock this in?
2. **Scale context** — Is this appropriate for the project's current scale and maturity?
3. **Team context** — Can the team (or solo developer) maintain this? Exotic solutions that require specialized knowledge are a liability.
4. **Convention** — Is there an industry-standard answer?
5. **Reversibility** — Easy to change later → lean toward Auto-Decide. Hard to reverse → lean toward Recommend or Must-Ask.

**Decision batching rule:** Group related decisions into coherent packages (e.g., "Data Display Strategy" covering layout + density + ordering, rather than three separate items). This reduces cognitive load and produces more consistent decisions.

**Question budget enforcement:** Max 3-5 items in "Input Needed". If you have more, think harder — apply the deep-think protocol again and move items to Recommend + Explain. If the recommendation is strong and well-reasoned, users can always override.

**Claude handles these (always Auto-Decide):**
- Technical implementation details
- Architecture patterns
- Performance optimization
- Scope (roadmap defines this)
</gray_area_identification>

<process>

**Express path available:** If you already have a PRD or acceptance criteria document, use `/gsd:plan-phase {phase} --prd path/to/prd.md` to skip this discussion and go straight to planning.

<step name="initialize" priority="first">
Phase number from argument (required).

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op "${PHASE}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Parse JSON for: `commit_docs`, `phase_found`, `phase_dir`, `phase_number`, `phase_name`, `phase_slug`, `padded_phase`, `has_research`, `has_context`, `has_plans`, `has_verification`, `plan_count`, `roadmap_exists`, `planning_exists`.

**If `phase_found` is false:**
```
Phase [X] not found in roadmap.

Use /gsd:progress to see available phases.
```
Exit workflow.

**If `phase_found` is true:** Continue to check_existing.
</step>

<step name="check_existing">
Check if CONTEXT.md already exists using `has_context` from init.

```bash
ls ${phase_dir}/*-CONTEXT.md 2>/dev/null
```

**If exists:**
Use AskUserQuestion:
- header: "Context"
- question: "Phase [X] already has context. What do you want to do?"
- options:
  - "Update it" — Review and revise existing context
  - "View it" — Show me what's there
  - "Skip" — Use existing context as-is

If "Update": Load existing, continue to analyze_phase
If "View": Display CONTEXT.md, then offer update/skip
If "Skip": Exit workflow

**If doesn't exist:**

Check `has_plans` and `plan_count` from init. **If `has_plans` is true:**

Use AskUserQuestion:
- header: "Plans exist"
- question: "Phase [X] already has {plan_count} plan(s) created without user context. Your decisions here won't affect existing plans unless you replan."
- options:
  - "Continue and replan after" — Capture context, then run /gsd:plan-phase {X} to replan
  - "View existing plans" — Show plans before deciding
  - "Cancel" — Skip discuss-phase

If "Continue and replan after": Continue to analyze_phase.
If "View existing plans": Display plan files, then offer "Continue" / "Cancel".
If "Cancel": Exit workflow.

**If `has_plans` is false:** Continue to load_prior_context.
</step>

<step name="load_prior_context">
Read project-level and prior phase context to avoid re-asking decided questions and maintain consistency.

**Step 1: Read project-level files**
```bash
# Core project files
cat .planning/PROJECT.md 2>/dev/null
cat .planning/REQUIREMENTS.md 2>/dev/null
cat .planning/STATE.md 2>/dev/null
```

Extract from these:
- **PROJECT.md** — Vision, principles, non-negotiables, user preferences
- **REQUIREMENTS.md** — Acceptance criteria, constraints, must-haves vs nice-to-haves
- **STATE.md** — Current progress, any flags or session notes

**Step 2: Read all prior CONTEXT.md files**
```bash
# Find all CONTEXT.md files from phases before current
find .planning/phases -name "*-CONTEXT.md" 2>/dev/null | sort
```

For each CONTEXT.md where phase number < current phase:
- Read the `<decisions>` section — these are locked preferences
- Read `<specifics>` — particular references or "I want it like X" moments
- Note any patterns (e.g., "user consistently prefers minimal UI", "user rejected single-key shortcuts")

**Step 3: Build internal `<prior_decisions>` context**

Structure the extracted information:
```
<prior_decisions>
## Project-Level
- [Key principle or constraint from PROJECT.md]
- [Requirement that affects this phase from REQUIREMENTS.md]

## From Prior Phases
### Phase N: [Name]
- [Decision that may be relevant to current phase]
- [Preference that establishes a pattern]

### Phase M: [Name]
- [Another relevant decision]
</prior_decisions>
```

**Usage in subsequent steps:**
- `analyze_phase`: Skip gray areas already decided in prior phases
- `present_gray_areas`: Annotate options with prior decisions ("You chose X in Phase 5")
- `discuss_areas`: Pre-fill answers or flag conflicts ("This contradicts Phase 3 — same here or different?")

**If no prior context exists:** Continue without — this is expected for early phases.
</step>

<step name="scout_codebase">
Lightweight scan of existing code to inform gray area identification and discussion. Uses ~10% context — acceptable for an interactive session.

**Step 1: Check for existing codebase maps**
```bash
ls .planning/codebase/*.md 2>/dev/null
```

**If codebase maps exist:** Read the most relevant ones (CONVENTIONS.md, STRUCTURE.md, STACK.md based on phase type). Extract:
- Reusable components/hooks/utilities
- Established patterns (state management, styling, data fetching)
- Integration points (where new code would connect)

Skip to Step 3 below.

**Step 2: If no codebase maps, do targeted grep**

Extract key terms from the phase goal (e.g., "feed" → "post", "card", "list"; "auth" → "login", "session", "token").

```bash
# Find files related to phase goal terms
grep -rl "{term1}\|{term2}" src/ app/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | head -10

# Find existing components/hooks
ls src/components/ 2>/dev/null
ls src/hooks/ 2>/dev/null
ls src/lib/ src/utils/ 2>/dev/null
```

Read the 3-5 most relevant files to understand existing patterns.

**Step 3: Build internal codebase_context**

From the scan, identify:
- **Reusable assets** — existing components, hooks, utilities that could be used in this phase
- **Established patterns** — how the codebase does state management, styling, data fetching
- **Integration points** — where new code would connect (routes, nav, providers)
- **Creative options** — approaches the existing architecture enables or constrains

Store as internal `<codebase_context>` for use in analyze_phase and present_gray_areas. This is NOT written to a file — it's used within this session only.
</step>

<step name="analyze_phase">
Analyze the phase to classify ALL implementation decisions. **Use both `prior_decisions` and `codebase_context` to ground every classification.**

**Read the phase description from ROADMAP.md and determine:**

1. **Domain boundary** — What capability is this phase delivering? State it clearly.

2. **Check prior decisions** — Before generating decisions, check what's already locked:
   - Scan `<prior_decisions>` for relevant choices (e.g., "Ctrl+C only, no single-key shortcuts")
   - These are **pre-answered** — carry them forward as Auto-Decide items citing the prior phase
   - Note applicable prior decisions for use in the proposal

3. **Generate ALL implementation decisions** — Every choice that could affect the outcome, no matter how small. Batch related decisions into coherent packages (e.g., "Data Display Strategy" instead of separate layout/pagination/sorting items).

4. **Classify each decision using the deep-think protocol:**

   For each decision or decision package, verify against:
   - **Project context:** Does the codebase already do this? Does a prior decision apply?
   - **Scale context:** Is this appropriate for the project's current maturity?
   - **Team context:** Can the team (or solo developer) maintain this? Exotic solutions requiring specialized knowledge are a liability.
   - **Convention:** Is there an industry-standard answer?
   - **Reversibility:** Easy to change later, or locked in once built?

   Then assign a tier:

   **Auto-Decide (~70%)** — Clear best answer. Assign with one-line reason.
   ```
   Decision: Use Tailwind utility classes for styling
   Reason: Entire codebase uses Tailwind — no other pattern exists
   ```

   **Recommend + Explain (~25%)** — Debatable but you have a strong opinion. Structure as:
   ```
   Decision: Data Display Strategy
   Recommendation: Card-based layout with medium density
   Why: Card component already exists (src/components/ui/Card.tsx), matches existing
        visual language, medium density balances information and scannability
   Alternatives:
   - List layout — better if data is tabular or comparison-heavy
   - Grid layout — better if visual thumbnails are the primary content
   ```

   **Must-Ask (~5%, max 3-5)** — Genuinely need user input. Still lead with recommendation:
   ```
   Decision: Empty state personality
   Recommendation: Friendly illustration with action prompt
   Why this needs your input: Empty states set emotional tone — this is a brand/voice
        decision that affects how users feel about the product
   ```

5. **Question budget check** — If Must-Ask has more than 5 items, re-evaluate. Apply the deep-think protocol again: Can you make a stronger recommendation and move it to Recommend + Explain? Remember, users can still override recommendations.

6. **Skip assessment** — If ALL decisions are Auto-Decide (pure infrastructure, clear-cut implementation, or everything already decided in prior phases), the phase may not need a full proposal. Proceed with a lightweight confirmation.

**Output the full classification internally, then proceed to generate_proposal.**
</step>

<step name="generate_proposal">
Create a single **Implementation Proposal** document and present it to the user for review.

**Build the proposal with three sections:**

### Section 1: Decisions Made (Auto-Decide)

List all auto-decided items, grouped by package where applicable. Each gets a one-line reason.

```
## Decisions Made

These decisions have a clear best answer given your project context. Listed for transparency — override any you disagree with.

- **Styling approach:** Tailwind utility classes — entire codebase uses Tailwind
- **State management:** React Query for server state — already established pattern
- **Routing:** File-based routing via Next.js App Router — existing convention
- **Component location:** src/components/[feature]/ — matches project structure
- **Error handling:** Error boundary pattern — used in 3 existing features
```

### Section 2: Recommendations (Recommend + Explain)

For each debatable decision, lead with the pick, explain why with project-specific reasoning, and show alternatives with conditions when each is better. Group related items into packages.

```
## Recommendations

Recommendations based on your codebase, prior decisions, and project context. Override any you disagree with.

### Data Display Strategy
**Recommendation:** Card-based layout with medium density
- Card component already exists with shadow/rounded variants — reusing keeps the app visually consistent
- Medium density balances information visibility and scannability for the expected data volume
- *Alternative — List layout:* Better if data becomes comparison-heavy or users need to scan many rows quickly
- *Alternative — Compact cards:* Better if the dataset grows large and users prefer density over whitespace

### Loading & Pagination
**Recommendation:** Infinite scroll with skeleton loading
- useInfiniteQuery hook is already set up from Phase 4
- Skeleton loading matches the existing pattern in the Messages feature
- *Alternative — Paginated:* Better if users need to bookmark or share specific "pages" of results
- *Alternative — Load-more button:* Better if scroll position preservation is critical
```

### Section 3: Input Needed (Must-Ask)

Max 3-5 items. Each includes the question, a recommendation, and why user input is needed.

```
## Input Needed

These decisions reflect personal preference, brand identity, or are expensive to reverse. Your input matters here.

### 1. Empty state personality
**Recommendation:** Friendly illustration with action prompt
Why I'm asking: Empty states set the emotional tone of your product — this is a voice/brand decision.
- Friendly illustration + CTA ("Start by adding...") — warm, encourages action
- Minimal text only ("No items yet") — clean, stays out of the way
- Rich onboarding guide — thorough, but heavier to maintain

### 2. Notification behavior on new items
**Recommendation:** Subtle badge count, no toast interruptions
Why I'm asking: This affects how "noisy" your app feels — a UX personality choice.
- Badge count only — quiet, user checks when ready
- Toast notification — immediate awareness, but can feel interruptive
- Both with user preference toggle — flexible, but more UI to build
```

**Present the complete proposal inline** (not as a file — the user reads it in the conversation), then proceed to review_proposal.
</step>

<step name="review_proposal">
Present the proposal and collect user feedback in a single pass.

**After presenting the proposal inline, use AskUserQuestion:**
- header: "Proposal"
- question: "Review this implementation proposal. Override anything you disagree with, or approve to proceed."
- options:
  - "Approve and proceed" — Accept all decisions and recommendations as proposed
  - "Override specific items" — Tell me what to change

**If "Approve and proceed":**
All decisions (auto-decided, recommended, and must-ask defaults) are locked in. Proceed to write_context.

**If "Override specific items":**
Ask as plain text: "Which items do you want to change? Reference them by name and tell me your preference."

Wait for the user's response. For each override:
1. Acknowledge the change
2. Update the relevant decision in the internal proposal
3. If the override affects related decisions (e.g., changing layout affects density recommendations), flag the ripple effect and update those too

After incorporating all overrides, re-present only the changed sections with a summary:

```
Updated proposal:
- [Item] → Changed from [original] to [override] per your input
- [Item] → Adjusted from [original] to [new recommendation] (ripple effect from above change)

Everything else remains as proposed.
```

Then use AskUserQuestion:
- header: "Confirm"
- question: "Overrides applied. Approve the updated proposal?"
- options:
  - "Approve and proceed"
  - "Override more items"

If "Override more items": repeat the override loop.
If "Approve and proceed": proceed to write_context.

**If user provides free text instead of selecting an option** (e.g., "change the layout to list" or "I prefer pagination"), treat it as an override — incorporate the feedback, re-present changed sections, and confirm.

**Scope creep handling:**
If user's override introduces something outside the phase domain:
```
"[Feature] sounds like a new capability — that belongs in its own phase.
I'll note it as a deferred idea.

For the current proposal: [return to confirmation]"
```

Track deferred ideas internally.
</step>

<step name="write_context">
Create CONTEXT.md capturing decisions made.

**Find or create phase directory:**

Use values from init: `phase_dir`, `phase_slug`, `padded_phase`.

If `phase_dir` is null (phase exists in roadmap but no directory):
```bash
mkdir -p ".planning/phases/${padded_phase}-${phase_slug}"
```

**File location:** `${phase_dir}/${padded_phase}-CONTEXT.md`

**Structure the content by what was discussed:**

```markdown
# Phase [X]: [Name] - Context

**Gathered:** [date]
**Status:** Ready for planning

<domain>
## Phase Boundary

[Clear statement of what this phase delivers — the scope anchor]

</domain>

<auto_decisions>
## Decisions Made

[All auto-decided items with one-line reasons. These were clear best answers given project context.]

- **[Decision]:** [Choice] — [one-line reason]
- **[Decision]:** [Choice] — [one-line reason]

</auto_decisions>

<recommendations>
## Accepted Recommendations

[Recommendations that were approved (or approved with overrides). Include the rationale so downstream agents understand the reasoning.]

### [Decision Package Name]
- **Decision:** [What was decided]
- **Rationale:** [Why this choice, with project-specific reasoning]
- **Alternatives considered:** [What was not chosen and when it would be better]

</recommendations>

<decisions>
## Implementation Decisions

### [Category 1 that was discussed]
- [Decision or preference captured]
- [Another decision if applicable]

### [Category 2 that was discussed]
- [Decision or preference captured]

### Claude's Discretion
[Areas where user said "you decide" — note that Claude has flexibility here]

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- [Component/hook/utility]: [How it could be used in this phase]

### Established Patterns
- [Pattern]: [How it constrains/enables this phase]

### Integration Points
- [Where new code connects to existing system]

</code_context>

<specifics>
## Specific Ideas

[Any particular references, examples, or "I want it like X" moments from discussion]

[If none: "No specific requirements — open to standard approaches"]

</specifics>

<deferred>
## Deferred Ideas

[Ideas that came up but belong in other phases. Don't lose them.]

[If none: "None — discussion stayed within phase scope"]

</deferred>

---

*Phase: XX-name*
*Context gathered: [date]*
```

Write file.
</step>

<step name="confirm_creation">
Present summary and next steps:

```
Created: .planning/phases/${PADDED_PHASE}-${SLUG}/${PADDED_PHASE}-CONTEXT.md

## Decisions Captured

### [Category]
- [Key decision]

### [Category]
- [Key decision]

[If deferred ideas exist:]
## Noted for Later
- [Deferred idea] — future phase

---

## ▶ Next Up

**Phase ${PHASE}: [Name]** — [Goal from ROADMAP.md]

`/gsd:plan-phase ${PHASE}`

<sub>`/clear` first → fresh context window</sub>

---

**Also available:**
- `/gsd:plan-phase ${PHASE} --skip-research` — plan without research
- Review/edit CONTEXT.md before continuing

---
```
</step>

<step name="git_commit">
Commit phase context (uses `commit_docs` from init internally):

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs(${padded_phase}): capture phase context" --files "${phase_dir}/${padded_phase}-CONTEXT.md"
```

Confirm: "Committed: docs(${padded_phase}): capture phase context"
</step>

<step name="update_state">
Update STATE.md with session info:

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state record-session \
  --stopped-at "Phase ${PHASE} context gathered" \
  --resume-file "${phase_dir}/${padded_phase}-CONTEXT.md"
```

Commit STATE.md:

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs(state): record phase ${PHASE} context session" --files .planning/STATE.md
```
</step>

<step name="auto_advance">
Check for auto-advance trigger:

1. Parse `--auto` flag from $ARGUMENTS
2. **Sync chain flag with intent** — if user invoked manually (no `--auto`), clear the ephemeral chain flag from any previous interrupted `--auto` chain. This does NOT touch `workflow.auto_advance` (the user's persistent settings preference):
   ```bash
   if [[ ! "$ARGUMENTS" =~ --auto ]]; then
     node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-set workflow._auto_chain_active false 2>/dev/null
   fi
   ```
3. Read both the chain flag and user preference:
   ```bash
   AUTO_CHAIN=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-get workflow._auto_chain_active 2>/dev/null || echo "false")
   AUTO_CFG=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-get workflow.auto_advance 2>/dev/null || echo "false")
   ```

**If `--auto` flag present AND `AUTO_CHAIN` is not true:** Persist chain flag to config (handles direct `--auto` usage without new-project):
```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-set workflow._auto_chain_active true
```

**If `--auto` flag present OR `AUTO_CHAIN` is true OR `AUTO_CFG` is true:**

Display banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► AUTO-ADVANCING TO PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Context captured. Launching plan-phase...
```

Launch plan-phase using the Skill tool to avoid nested Task sessions (which cause runtime freezes due to deep agent nesting — see #686):
```
Skill(skill="gsd:plan-phase", args="${PHASE} --auto")
```

This keeps the auto-advance chain flat — discuss, plan, and execute all run at the same nesting level rather than spawning increasingly deep Task agents.

**Handle plan-phase return:**
- **PHASE COMPLETE** → Full chain succeeded. Display:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   GSD ► PHASE ${PHASE} COMPLETE
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Auto-advance pipeline finished: discuss → plan → execute

  Next: /gsd:discuss-phase ${NEXT_PHASE} --auto
  <sub>/clear first → fresh context window</sub>
  ```
- **PLANNING COMPLETE** → Planning done, execution didn't complete:
  ```
  Auto-advance partial: Planning complete, execution did not finish.
  Continue: /gsd:execute-phase ${PHASE}
  ```
- **PLANNING INCONCLUSIVE / CHECKPOINT** → Stop chain:
  ```
  Auto-advance stopped: Planning needs input.
  Continue: /gsd:plan-phase ${PHASE}
  ```
- **GAPS FOUND** → Stop chain:
  ```
  Auto-advance stopped: Gaps found during execution.
  Continue: /gsd:plan-phase ${PHASE} --gaps
  ```

**If neither `--auto` nor config enabled:**
Route to `confirm_creation` step (existing behavior — show manual next steps).
</step>

</process>

<success_criteria>
- Phase validated against roadmap
- Prior context loaded (PROJECT.md, REQUIREMENTS.md, STATE.md, prior CONTEXT.md files)
- Already-decided questions carried forward as Auto-Decide items (not re-asked)
- Codebase scouted for reusable assets, patterns, and integration points
- All implementation decisions classified into Auto-Decide / Recommend+Explain / Must-Ask tiers
- Deep-think protocol applied to each classification (project context, scale, convention, reversibility)
- Related decisions batched into coherent packages
- Question budget enforced (max 3-5 Must-Ask items)
- Single implementation proposal generated with all three sections
- User reviewed proposal in one pass (approve or override)
- Overrides incorporated with ripple-effect awareness
- Scope creep redirected to deferred ideas
- CONTEXT.md captures auto_decisions, recommendations, decisions, code_context, specifics, and deferred sections
- Deferred ideas preserved for future phases
- STATE.md updated with session info
- User knows next steps
</success_criteria>
