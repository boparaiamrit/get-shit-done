# Example Artifacts Design

**Date:** 2026-03-09
**Status:** Implemented

## Purpose

Exhaustive examples showing what GSD produces for different project scenarios. Each example contains the full `.planning/` artifact tree with realistic content using real tech stacks.

## Scenarios

### 01: Greenfield Next.js (ShopWave)
- **Stack:** Next.js 15, React 19, Tailwind, Prisma, PostgreSQL, Stripe
- **Scenario:** Brand new e-commerce project from `/gsd:new-project`
- **Files:** 8 (config, PROJECT, REQUIREMENTS, ROADMAP, STATE, CONTEXT, PLAN, README)
- **Demonstrates:** Full project setup, recommendation-first CONTEXT.md, test-first PLAN.md

### 02: Brownfield NestJS (TaskForge)
- **Stack:** NestJS 10, TypeORM, PostgreSQL, Redis, Docker
- **Scenario:** Existing API adding v1.1 features via `/gsd:new-milestone`
- **Files:** 8 (config, PROJECT, REQUIREMENTS, ROADMAP, STATE, CONVENTIONS, CONTEXT, README)
- **Demonstrates:** Validated requirements, codebase conventions driving auto-decisions, milestone-grouped roadmap

### 03: Mid-Project React+NestJS (MetricsDash)
- **Stack:** React 18, Vite, TanStack Query, Recharts, NestJS, TimescaleDB
- **Scenario:** Phase 3 in progress, resuming via `/gsd:resume-work`
- **Files:** 11 (config, PROJECT, REQUIREMENTS, ROADMAP, STATE, 2x SUMMARY, CONTEXT, PLAN, continue-here, README)
- **Demonstrates:** Accumulated state, completed phase summaries, velocity metrics, session continuity

## Key Features Showcased

- **Recommendation-first framework:** All 3 CONTEXT files show auto_decisions (~70%), recommendations (~25%), must-ask (~5%)
- **Deep-think protocol:** Factor references (project context, scale, team, convention, reversibility)
- **Test-first blocks:** Both PLAN files include `<test_first>` elements
- **Decision batching:** Related decisions grouped into packages
- **Question budget:** Must-ask sections capped at 3-5 items

## File Count

27 files across 3 scenarios.
