# Example: Greenfield Next.js E-Commerce

## Scenario

**Project:** ShopWave — a modern e-commerce storefront for indie brands
**Stack:** Next.js 15 (App Router), React 19, Tailwind CSS, Prisma ORM, PostgreSQL, Stripe
**Developer:** Solo developer targeting initial launch on Vercel free tier

This example shows what GSD produces when you start a project from scratch. Every file here is a realistic artifact generated through the GSD workflow.

## Commands Used

| Step | Command | What It Does |
|------|---------|--------------|
| 1 | `/gsd:new-project` | Generates PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md, and config.json |
| 2 | `/gsd:discuss-phase 1` | Runs the recommendation-first discussion for Phase 1, produces 01-CONTEXT.md |
| 3 | `/gsd:plan-phase 1` | Spawns the planner subagent, produces 01-01-PLAN.md (and other plans) |

## File Guide

| File | Purpose |
|------|---------|
| `planning/config.json` | Project configuration — mode, granularity, workflow toggles |
| `planning/PROJECT.md` | Living project context — what ShopWave is, its constraints, key decisions |
| `planning/REQUIREMENTS.md` | Checkable requirements organized by category with traceability matrix |
| `planning/ROADMAP.md` | 4-phase coarse roadmap with success criteria and plan breakdowns |
| `planning/STATE.md` | Project state snapshot — position, progress, session continuity |
| `planning/phases/01-foundation/01-CONTEXT.md` | **Key file** — recommendation-first decisions for Phase 1 |
| `planning/phases/01-foundation/01-01-PLAN.md` | Executable plan with test-first blocks for the auth system |

## How the Recommendation-First Framework Shows Up

The core innovation is in `01-CONTEXT.md`. Instead of asking the user 20 questions before starting, GSD uses a three-tier decision framework:

1. **Auto-Decided (~70%)** — Obvious choices locked by convention or best practice. The user never sees these unless they override. Example: "Use bcrypt for password hashing" — there is no meaningful alternative.

2. **Recommendations (~25%)** — Real trade-offs where one option is clearly better for this project. GSD presents its recommendation with rationale and alternatives. The user accepts or swaps. Example: "JWT over database sessions — simpler infra for solo dev on Vercel."

3. **Must-Ask (~5%)** — Genuine ambiguities only the user can resolve. These are questions with no objectively correct answer. Example: "Which auth providers for v1?" — that is a business decision.

This means the user answers 2-3 questions instead of 20, and every decision is documented with its reasoning for downstream agents.

The CONTEXT.md then flows into PLAN.md files where every locked decision becomes a concrete task action — no interpretation needed by the executor.
