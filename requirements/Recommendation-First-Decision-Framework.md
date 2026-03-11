# RECOMMENDATION-FIRST DECISION FRAMEWORK

**The Problem You're Describing (and Everyone Suffers From)**

---

## THE PROBLEM

Every agentic tool today — GSD, BMAD, Taskmaster, even raw Claude Code — operates in **interrogation mode**:

```
CURRENT (Interrogation Mode):

AI: "What layout do you want for the dashboard?"
    a) Grid
    b) List
    c) Masonry
    d) Custom
You: ...uh, I don't know? Which is best for my use case?

AI: "How should errors be handled?"
    a) Toast notifications
    b) Inline errors
    c) Error boundary with fallback
    d) Custom
You: ...what's even the difference in this context?

AI: "What pagination style?"
    a) Offset-based
    b) Cursor-based
    c) Infinite scroll
    d) Load more button
You: ...just pick the right one!
```

This creates three devastating problems:

**1. Decision Fatigue** — You're asked 15-30 questions before any work starts. By question 8, you're clicking random options or saying "whatever you think" — which defeats the entire purpose of the discuss phase.

**2. Context-Free Questions** — The AI asks "grid or list?" without telling you WHY one is better for YOUR situation. You need to be an expert in the topic to answer the question, but if you were an expert, you wouldn't need the AI.

**3. Equal-Weight Options** — Every option is presented as equally valid. But they're NOT. In most cases, there IS a best answer given the project context, the stack, the user base, and industry conventions. The AI knows this but refuses to say it.

**The root cause:** These tools are designed to be "neutral facilitators" when they should be **opinionated advisors**. A senior engineer doesn't ask you "grid or list?" — they say "I'd go with grid because of X, Y, Z. Want to discuss alternatives?"

---

## THE SOLUTION: RECOMMENDATION-FIRST DECISIONS

### The Core Principle

**Lead with the best answer. Explain why. Then offer alternatives.**

```
PROPOSED (Recommendation-First):

AI: "For the dashboard layout, I'm going with GRID.

    WHY: Your dashboard has 6-12 data cards of similar size. Grid gives
    equal visual weight to each, responsive out of the box with CSS Grid,
    and is the convention for admin dashboards (users expect it).

    ALTERNATIVES (override if you disagree):
    • List — better if cards have very different content lengths
    • Masonry — better for image-heavy/Pinterest-style content

    → Going with Grid unless you say otherwise."
```

**What changed:**
- AI did the thinking FIRST
- Gave its recommendation with confidence
- Explained WHY with project-specific reasoning
- Showed alternatives with WHEN they'd be better (not just what they are)
- Defaulted to proceeding — you only intervene if you disagree

### Three Decision Categories

Not all decisions need the same treatment:

```
┌──────────────────────────────────────────────────────────────┐
│  CATEGORY 1: AUTO-DECIDE (70% of decisions)                  │
│  ─────────────────────────────────────────────────────────── │
│  There IS a clearly correct answer given the context.        │
│  AI decides, briefly notes why, moves on.                    │
│  You don't even see a question.                              │
│                                                              │
│  Examples:                                                   │
│  - "Using bcrypt for password hashing (industry standard)"   │
│  - "Using UUID v4 for IDs (no sequential leak)"              │
│  - "Using parameterized queries (SQL injection prevention)"  │
│  - "Using 2-space indentation (matches existing codebase)"   │
│  - "Using conventional commits (matches existing pattern)"   │
│                                                              │
│  These are NOT questions. They're informed defaults.         │
│  Listed in the plan for transparency. Override by speaking   │
│  up if you disagree.                                         │
├──────────────────────────────────────────────────────────────┤
│  CATEGORY 2: RECOMMEND + EXPLAIN (25% of decisions)          │
│  ─────────────────────────────────────────────────────────── │
│  There's a best answer, but reasonable people could differ.  │
│  AI leads with recommendation, explains reasoning, shows     │
│  alternatives with context on WHEN each is better.           │
│                                                              │
│  Examples:                                                   │
│  - Layout pattern (grid vs list vs masonry)                  │
│  - State management (local state vs store vs server state)   │
│  - Pagination strategy (cursor vs offset vs infinite scroll) │
│  - Error handling UX (toast vs inline vs boundary)           │
│  - Caching strategy (in-memory vs Redis vs CDN)              │
│                                                              │
│  Format:                                                     │
│  "Going with [X] because [reason tied to YOUR project].     │
│   Alternatives: [Y] if [condition], [Z] if [condition].     │
│   Override? Otherwise proceeding with [X]."                  │
├──────────────────────────────────────────────────────────────┤
│  CATEGORY 3: MUST-ASK (5% of decisions)                      │
│  ─────────────────────────────────────────────────────────── │
│  Genuinely ambiguous. AI cannot determine the right answer   │
│  without your input because it depends on business logic,    │
│  user preferences, or constraints only you know.             │
│                                                              │
│  Examples:                                                   │
│  - "Should free-tier users see this feature grayed out or    │
│     hidden entirely?" (business decision)                    │
│  - "What's the maximum file upload size? This affects        │
│     storage costs." (budget constraint)                      │
│  - "Do you need to support IE11? This changes the entire     │
│     build strategy." (user base knowledge)                   │
│                                                              │
│  Format:                                                     │
│  "I need your input on [specific thing].                     │
│   Here's what I'd recommend: [X] because [reason].          │
│   But this depends on [thing only you know].                │
│   Options: [A] best when [condition],                        │
│           [B] best when [other condition]."                  │
│                                                              │
│  Even MUST-ASK questions come with a recommendation.        │
│  Never present raw options without guidance.                 │
└──────────────────────────────────────────────────────────────┘
```

### The 70-25-5 Rule

In any feature discussion, approximately:
- **70%** of decisions have a clear best answer → Auto-decide
- **25%** have a best answer that's debatable → Recommend + explain
- **5%** genuinely need your input → Must-ask with recommendation

GSD today treats all of them as Category 3. That's why it asks 20+ questions when it should ask 3-5.

---

## HOW TO IMPLEMENT THIS

### Option 1: CLAUDE.md Instruction Block (Works Everywhere — No GSD Required)

Add this to your project CLAUDE.md or global ~/.claude/CLAUDE.md:

```markdown
## Decision-Making Protocol

When you encounter a design, architecture, or implementation decision:

### Category 1 — Auto-Decide (clear best answer)
Just decide. Note it briefly in your plan or summary:
"Decision: Using [X] — [one-line reason]"
Do NOT ask the user. Move on.

Examples of auto-decide situations:
- Security best practices (hashing, encryption, parameterized queries)
- Following existing codebase conventions
- Industry-standard patterns for the given stack
- Naming conventions matching the project style

### Category 2 — Recommend + Explain (debatable but you have an opinion)
Lead with your recommendation. Explain why in 1-2 sentences tied to
THIS project's context. List alternatives only with conditions when
each would be better. Default to proceeding with your recommendation.

Format:
"Going with [X] because [project-specific reason].
 Alternatives: [Y] if [condition], [Z] if [condition].
 Proceeding unless you override."

### Category 3 — Must-Ask (genuinely need user input)
Only ask when the decision depends on business logic, budget,
user base, or constraints you cannot infer from the codebase.

EVEN THEN: Lead with your best recommendation and explain why.
Never present raw options without guidance.

Format:
"I need your input: [specific question].
 My recommendation: [X] because [reason].
 But this depends on [thing only you know].
 Options: [A] when [condition], [B] when [condition]."

### Rules
- NEVER ask more than 3 questions in a row without doing work between them.
- NEVER present options without recommending one and explaining why.
- NEVER ask about something you can infer from the codebase or context.
- Batch related decisions together — don't ask about pagination, then
  sorting, then filtering separately. Group them as "Data Display" and
  present your recommended approach as a package.
- If you're unsure whether to ask or auto-decide, auto-decide.
  The user will correct you if they disagree. That's faster than asking.
```

### Option 2: GSD Discuss Phase Override (For GSD Users)

If you're using GSD, you can modify the discuss-phase behavior by adding to your CLAUDE.md:

```markdown
## GSD Discuss Phase Rules

When running /gsd:discuss-phase, do NOT interrogate with open questions.
Instead:

1. Analyze the phase requirements
2. For each gray area, decide which category it falls into (auto/recommend/must-ask)
3. Present a PROPOSAL DOCUMENT that says:
   "Here's how I'd build this phase. Review and override what you disagree with."

Structure the proposal as:

### Phase [N] — Implementation Proposal

**Auto-decided (I'm going with these unless you object):**
- [Decision]: [Reason]
- [Decision]: [Reason]

**Recommended (my pick, with alternatives):**
- [Topic]: Going with [X] because [reason].
  Alt: [Y] if [condition].

**Need your input (can't proceed without this):**
- [Question] — I'd recommend [X] because [reason], but this depends on [thing].

This reduces a 20-question interrogation to a single proposal document
where the user reviews and overrides specific points.
```

### Option 3: Custom Discuss Command (Replace GSD's Discuss Phase Entirely)

Create a custom slash command that replaces `/gsd:discuss-phase`:

```markdown
---
name: smart-discuss
description: Recommendation-first phase discussion — replaces /gsd:discuss-phase
---

You are preparing to discuss Phase $ARGUMENTS for implementation.

STEP 1: Read the following files:
- .planning/ROADMAP.md (what this phase is supposed to deliver)
- .planning/REQUIREMENTS.md (what's in scope)
- .planning/STATE.md (current project state)
- .planning/codebase/ARCHITECTURE.md (if exists)
- Any existing CONTEXT.md for this phase

STEP 2: Analyze the phase and identify ALL gray areas. For each gray area,
classify it:
- AUTO-DECIDE: Clear best answer given context. Just decide.
- RECOMMEND: Debatable but you have a strong opinion. Lead with recommendation.
- MUST-ASK: Genuinely need user input. Still recommend.

STEP 3: Present a SINGLE proposal document:

"# Phase [N] — Implementation Proposal

## Decisions Made (auto-decided)
[List each decision with one-line reason]

## Recommendations (review and override if you disagree)
[For each: recommendation + why + alternatives with conditions]

## Input Needed (I'm blocked without your answer)
[For each: question + your recommendation + why you still need their input]

---
Review this proposal. Tell me what to change. Everything not overridden
is locked and goes into CONTEXT.md."

STEP 4: After user review, create CONTEXT.md with all locked decisions.

KEY RULES:
- Maximum 3-5 items in "Input Needed". If you have more, you haven't
  thought hard enough. Move some to Recommendations.
- Every item — even Must-Ask — includes your recommendation.
- Group related decisions (don't separate pagination from sorting from
  filtering — group as "Data Display Strategy").
- Reference specific project context in every recommendation.
  "Grid layout" is weak. "Grid layout because your existing components
  use Tailwind's grid utilities and you have 8 data cards of equal weight"
  is strong.
```

---

## THE PROPOSAL DOCUMENT PATTERN

This is the core UX innovation. Instead of a conversation with 20 questions, you get a single document to review.

### Example: Phase 2 — User Dashboard

**Current GSD (interrogation mode — 12+ questions):**
```
Q1: What layout for the dashboard? Grid/List/Masonry/Custom?
Q2: How many columns? 2/3/4/Auto?
Q3: Card content — what metrics to show?
Q4: Real-time updates or refresh on navigation?
Q5: Loading states — skeleton/spinner/progressive?
Q6: Empty state — illustration/text/CTA?
Q7: Error handling — toast/inline/retry?
Q8: Responsive behavior — stack/scroll/hide?
Q9: Date range filter — dropdown/picker/presets?
Q10: Export functionality — CSV/PDF/both?
Q11: Role-based visibility — hide/disable/redirect?
Q12: Dark mode support?
```

**Proposed (recommendation-first — 1 document, 2 questions):**

```markdown
# Phase 2 — User Dashboard: Implementation Proposal

## Decisions Made
- **Layout**: CSS Grid, 3-column on desktop, stack on mobile
  (matches your existing Tailwind setup, cards are equal-weight metrics)
- **Loading**: Skeleton screens (already using shadcn/ui which has them)
- **Responsive**: Stack columns on mobile, 2-col on tablet, 3-col on desktop
- **Errors**: Toast notifications via existing toast component
- **Date filter**: Preset buttons (7d/30d/90d/all) — most dashboards don't
  need custom range pickers, and presets reduce decision fatigue for users
- **Commits**: conventional commit format matching existing project
- **Dark mode**: Yes — your Tailwind config already has dark mode enabled

## Recommendations
- **Real-time vs refresh**: Going with REFRESH ON NAVIGATION.
  Why: Real-time adds WebSocket complexity for data that changes hourly,
  not by the second. Users will see fresh data every time they visit.
  Alt: Real-time via SSE if you later need live-updating metrics.

- **Export**: Going with CSV ONLY for v1.
  Why: CSV covers 90% of use cases (opens in Excel, Google Sheets, any BI tool).
  PDF adds a rendering library dependency for marginal benefit.
  Alt: Add PDF in v2 if users request it.

## Input Needed
- **Which metrics on cards?** I can see your API returns: users_count,
  courses_completed, avg_score, certificates_issued, active_sessions,
  compliance_rate. My recommendation: show the top 6 as cards, with
  courses_completed and compliance_rate as the hero metrics (larger cards).
  But you know which metrics your users actually care about.

- **Role-based visibility**: Should Admins see all tenants' dashboards,
  or only their own? This is a business rule I can't infer.
  My recommendation: Admins see their own tenant only (simpler, more
  secure), with a super-admin role for cross-tenant views later.

---
Review this. Override anything you disagree with.
Everything not overridden goes into CONTEXT.md and I proceed.
```

**Result:**
- 7 auto-decisions (zero questions)
- 2 recommendations (zero questions, override if wrong)
- 2 must-ask questions (with recommendations attached)
- **Total user effort: Review 1 document, answer 2 questions, override 0-2 recommendations**
- vs. GSD today: **answer 12 separate questions one by one**

---

## HOW THIS CHANGES EACH PHASE

### New Project / New Milestone

```
CURRENT:
  AI asks 15-25 questions about goals, stack, constraints, edge cases.
  User answers each one. Takes 20-40 minutes of back-and-forth.

PROPOSED:
  AI reads any existing context (codebase, README, package.json).
  AI generates a PROPOSAL: "Here's what I understand about your project."
  Includes: inferred stack, inferred constraints, recommended architecture.
  User reviews, corrects errors, adds missing info.
  1-2 rounds max. Takes 5-10 minutes.
```

### Discuss Phase

```
CURRENT:
  AI identifies 8-15 gray areas. Asks about each one sequentially.
  User suffers decision fatigue. Quality of answers degrades.

PROPOSED:
  AI generates Implementation Proposal document.
  70% auto-decided, 25% recommended, 5% must-ask.
  User reviews ONE document, overrides specific points.
  1 round. Takes 3-5 minutes.
```

### Planning

```
CURRENT:
  AI creates plans, sometimes asks about implementation details.
  "Should I use library X or Y for this task?"

PROPOSED:
  AI picks the best library based on project context and stack.
  Notes the choice in the plan: "Using X because [reason]."
  No question asked. User sees the decision in plan review.
```

### Verification

```
CURRENT:
  "Can you log in?" → yes/no
  "Does the filter work?" → yes/no
  "Is the data correct?" → yes/no
  (one question at a time, tedious)

PROPOSED:
  AI presents a verification checklist:
  "Please test these 5 things and tell me which ones fail:
   □ Login with email → should see dashboard
   □ Filter by date → should show filtered results
   □ Export CSV → should download file with correct data
   □ Mobile view → should stack to single column
   □ Error state → disconnect network, should see toast"

  User tests all at once, reports failures in batch.
  One round instead of 5 sequential questions.
```

---

## THE QUESTION BUDGET

A hard constraint to prevent interrogation creep:

```markdown
## Question Budget (add to CLAUDE.md)

Per workflow stage, you have a QUESTION BUDGET:

- New Project setup: max 5 questions (after your initial proposal)
- Discuss Phase: max 3 must-ask questions (rest are auto-decide or recommend)
- Plan Phase: max 2 questions (about implementation approach)
- Execute Phase: 0 questions (just do the work)
- Verify Phase: present ONE checklist (not sequential questions)

If you hit the budget, STOP asking and make your best decision.
The user will correct you if you're wrong. Being corrected on 1 wrong
decision is faster than answering 15 questions to prevent it.

MATH:
- 15 questions × 2 min each = 30 min of decision-making
- 1 wrong auto-decision × 5 min to correct = 5 min
- Net savings: 25 minutes. Auto-decide wins by 5x.
```

---

## BATCHING RELATED DECISIONS

Another major improvement. GSD asks about layout, then pagination, then filtering, then sorting, then loading states — each as a separate question. These are all part of ONE decision: "How should data be displayed?"

```markdown
## Decision Batching Rule (add to CLAUDE.md)

NEVER ask about individual UI/API/data concerns separately.
Group related decisions into coherent PACKAGES:

BAD (5 separate questions):
  Q1: Grid or list?
  Q2: Pagination style?
  Q3: Sort options?
  Q4: Filter approach?
  Q5: Loading state?

GOOD (1 recommendation package):
  "DATA DISPLAY STRATEGY:
   Grid layout with server-side cursor pagination, column-header
   sorting, sidebar filters, and skeleton loading states.
   
   Why: Grid matches your existing component library. Cursor pagination
   handles your dataset size (>10k rows) without count queries.
   Server-side sort/filter because client-side chokes on this volume.
   Skeleton states because shadcn/ui includes them.
   
   Override any individual piece if you disagree."
```

---

## DEEP-THINK PROTOCOL

You mentioned the AI should "think deeply and give the best possible answer." Here's how to enforce that:

```markdown
## Deep-Think Protocol (add to CLAUDE.md)

Before presenting any recommendation or making any auto-decision,
verify it against these checks:

1. PROJECT CONTEXT: Does this recommendation match the existing
   codebase, stack, and patterns? Check actual files, not assumptions.

2. SCALE CONTEXT: Is this appropriate for the project's current scale
   AND likely next scale? Don't over-engineer for millions of users
   if this is an MVP. Don't under-engineer if the data model suggests
   growth.

3. TEAM CONTEXT: Is this something the team can maintain? A brilliant
   architectural choice that nobody on the team understands is worse
   than a simple choice everyone can debug.

4. CONVENTION: Is there an industry standard for this? If yes, use it
   unless there's a specific reason not to. Standards exist because
   they solved the problem already.

5. REVERSIBILITY: If this decision is wrong, how hard is it to change?
   Easy to reverse → auto-decide with confidence.
   Hard to reverse → recommend + explain, maybe must-ask.

When you recommend, cite which of these factors drove your decision:
"Going with [X] — matches existing patterns (1), appropriate for
current scale (2), and is the industry standard (4)."
```

---

## COMPLETE CLAUDE.MD BLOCK (COPY-PASTE READY)

Add this entire block to any project's CLAUDE.md:

```markdown
## Decision-Making Protocol

### How to Make Decisions
- NEVER interrogate with sequential questions. Present proposals.
- NEVER present options without recommending one and explaining why.
- NEVER ask about something you can infer from code, config, or context.
- Classify every decision as: AUTO-DECIDE (70%) / RECOMMEND (25%) / MUST-ASK (5%)

### Auto-Decide (clear best answer)
Just decide. Note briefly: "Decision: [X] — [one-line reason]."
Includes: security best practices, existing conventions, industry standards.

### Recommend (debatable, but you have an opinion)
Format: "Going with [X] because [project-specific reason].
Alt: [Y] if [condition]. Proceeding unless you override."

### Must-Ask (genuinely blocked without user input)
Format: "I need your input on [specific thing].
My recommendation: [X] because [reason].
But this depends on [thing only you know]."

### Rules
- Question budget: max 3 must-ask questions per phase discussion.
- Batch related decisions into packages (e.g., "Data Display Strategy").
- Group: don't ask about layout, pagination, sorting, filtering separately.
- Default to proceeding. Being corrected on 1 wrong decision is faster
  than answering 15 questions to prevent it.
- Before any recommendation, verify against: project context, scale,
  team capability, industry convention, and reversibility.
- When presenting proposals, cite which factors drove each decision.

### Verification Format
- Present ONE checklist of things to test, not sequential yes/no questions.
- User tests all at once, reports failures in batch.
```

---

## SUMMARY

| Dimension | Current (Interrogation) | Proposed (Recommendation-First) |
|-----------|------------------------|-------------------------------|
| Questions per phase | 10-20 | 2-5 |
| Time in discussion | 20-40 min | 5-10 min |
| Decision quality | Degrades (fatigue) | Consistent (AI thinks deeply) |
| User effort | High (answer everything) | Low (review + override) |
| Context captured | Same | Same (all decisions still recorded) |
| Format | Sequential Q&A | Single proposal document |
| Default behavior | Wait for answer | Proceed with recommendation |
| Wrong decisions | Prevented (at high cost) | Corrected (at low cost) |

**The math is simple:** Preventing 15 wrong decisions via questions costs 30 minutes. Making 1 wrong auto-decision and correcting it costs 5 minutes. The recommendation-first approach is faster even when it's wrong — and it's usually right because the AI has the project context to make informed decisions.
