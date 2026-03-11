# Recommendation-First Decision Framework + Universal System Improvements

**Date:** 2026-03-09
**Status:** Approved

## Scope

Implement two requirement documents:
1. Recommendation-First Decision Framework — change all user-facing workflows from interrogation mode to proposal-based interaction
2. Universal Agentic Development System — test-first plans, flexible task granularity, cross-phase regression, security gate

## Approach

Full workflow rewrites for discuss-phase, new-project, new-milestone, verify-work.
Surgical updates for agents, templates, references, and hooks.

## Components

### Workflow Rewrites (4)
1. **discuss-phase.md** — Replace gray-area questioning loops with single Proposal Document (auto-decided/recommended/must-ask sections)
2. **new-project.md** — Replace deep questioning with context-inferred Project Proposal, user reviews and overrides
3. **new-milestone.md** — Same proposal pattern for milestone context
4. **verify-work.md** — Replace one-at-a-time test presentation with batch checklist

### Agent Updates (2)
5. **gsd-planner.md** — Support flexible task count (2-5), generate test-first blocks
6. **gsd-plan-checker.md** — Verify test-first blocks exist in each task

### Template Updates (2)
7. **context.md** — Add proposal document sections
8. **Plan template** — Add `<test_first>` block to task schema

### Reference Updates (1)
9. **questioning.md** — Rewrite to recommendation-first principles

### New Components (1)
10. **hooks/gsd-security-gate.js** — Static analysis, dependency audit, secrets detection

### Workflow Additions (1)
11. **execute-phase.md** — Add cross-phase regression testing requirement

### Eval Tests
12. Tests validating all changes work correctly

## Key Principles
- 70-25-5 rule: 70% auto-decide, 25% recommend, 5% must-ask
- Question budget: max 3-5 must-ask items per phase discussion
- Decision batching: group related decisions into packages
- Deep-think protocol: verify against project context, scale, convention, reversibility
- Batch verification: single checklist, not sequential questions
