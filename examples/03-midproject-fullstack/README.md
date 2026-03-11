# Example: Mid-Project Full-Stack (MetricsDash)

## Scenario

**Project:** MetricsDash — a real-time analytics dashboard for SaaS metrics
**Stack:** React 18 (Vite, TanStack Query, Recharts, Tailwind) + NestJS 10 (WebSocket gateway, PostgreSQL + TimescaleDB, Redis)
**Developer:** Solo developer targeting early-stage SaaS founders
**State:** Mid-project — Phase 1 and 2 complete, Phase 3 in progress (Plan 2 of 3)

This example shows what GSD artifacts look like when you are in the middle of work. Unlike the greenfield example where everything is fresh, here you see accumulated state: completed phase summaries, performance metrics with real timing data, decisions that carry forward, and a continue-here file for session resumption.

## Commands Used

| Step | Command | What It Does |
|------|---------|--------------|
| 1 | `/gsd:new-project` | Generated initial PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md |
| 2-3 | `/gsd:discuss-phase 1`, `/gsd:execute-phase 1` | Completed auth system (2 plans) |
| 4-5 | `/gsd:discuss-phase 2`, `/gsd:execute-phase 2` | Completed API core (3 plans) |
| 6 | `/gsd:discuss-phase 3` | Discussed dashboard UI, produced 03-CONTEXT.md |
| 7 | `/gsd:execute-phase 3` | Started Phase 3 — Plan 1 complete, Plan 2 in progress |
| 8 | `/gsd:resume-work` | Resumes from continue-here file after session break |
| 9 | `/gsd:progress` | Shows current status: 55% complete, Phase 3 in progress |

## File Guide

| File | Purpose |
|------|---------|
| `planning/config.json` | Project configuration — yolo mode, quality model, auto-advance enabled |
| `planning/PROJECT.md` | Living project context — updated with decisions from Phases 1-2 |
| `planning/REQUIREMENTS.md` | Requirements with partial completion — AUTH and API done, DASH in progress |
| `planning/ROADMAP.md` | 4-phase roadmap showing mixed completion statuses |
| `planning/STATE.md` | **Key file** — mid-project state with accumulated metrics, decisions, and blocker |
| `planning/phases/01-auth/01-SUMMARY.md` | Completed Phase 1 summary — what shipped, timing, lessons |
| `planning/phases/02-api-core/02-SUMMARY.md` | Completed Phase 2 summary — API endpoints, TimescaleDB schema |
| `planning/phases/03-dashboard/03-CONTEXT.md` | Current phase context — recommendation-first decisions for dashboard UI |
| `planning/phases/03-dashboard/03-01-PLAN.md` | Completed plan — KPI Cards and Layout Shell |
| `planning/phases/03-dashboard/.continue-here-03-02.md` | **Resume point** — where to pick up on Chart Components plan |

## How Mid-Project State Differs

**Completed summaries exist.** Phases 1 and 2 have SUMMARY.md files documenting what shipped, timing data, and lessons learned. These feed into planning for later phases — the planner reads them to understand what patterns are established and what code exists.

**STATE.md has real data.** Progress is 55%, performance metrics show actual durations (Phase 1 averaged 18 min/plan, Phase 2 averaged 22 min/plan), and accumulated decisions reference concrete outcomes from earlier phases.

**PROJECT.md evolved.** Key Decisions table now has outcomes marked. Decisions made in Phase 1 (like "jose over jsonwebtoken") have a checkmark showing they worked out. Requirements in the Active section reflect what has been validated versus what is still pending.

**A continue-here file exists.** This is the session resumption mechanism. When `/gsd:resume-work` runs, it reads this file to know exactly where execution stopped — which plan, which task, what was last completed, and what the immediate next action is. The file is deleted after successful resumption.

**Context accumulates.** The Phase 3 CONTEXT.md references patterns established in Phase 2 (like the data fetching hooks) and code that already exists. Decisions are not made in isolation — they build on what came before.
