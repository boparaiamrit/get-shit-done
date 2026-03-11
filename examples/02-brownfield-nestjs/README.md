# Example: Brownfield NestJS API (v1.1 Milestone)

## Scenario

**Project:** TaskForge — a task management API for development teams
**Stack:** NestJS 10, TypeORM, PostgreSQL, Redis, Docker
**Team:** 3 backend engineers, 6 months of production runtime
**Current state:** v1.0 shipped (users, tasks, projects CRUD). Starting v1.1 to add notifications and search.

This example shows what GSD produces when you have an **existing codebase** and run `/gsd:new-milestone` to plan new features on top of validated, shipping code.

## Commands Used

| Step | Command | What It Does |
|------|---------|--------------|
| 1 | `/gsd:map-codebase` | Scans existing NestJS codebase, produces CONVENTIONS.md |
| 2 | `/gsd:new-milestone` | Creates v1.1 milestone — updates PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md |
| 3 | `/gsd:discuss-phase 5` | Runs recommendation-first discussion for Phase 5 (Notifications), produces 05-CONTEXT.md |

## File Guide

| File | Purpose |
|------|---------|
| `planning/config.json` | Project configuration — same structure as greenfield, carried forward |
| `planning/PROJECT.md` | Living project context — v1.0 requirements now VALIDATED, v1.1 requirements ACTIVE |
| `planning/REQUIREMENTS.md` | Checkable requirements — v1.0 categories all checked off, v1.1 categories with open checkboxes |
| `planning/ROADMAP.md` | Milestone-grouped roadmap — v1.0 phases collapsed in details tags, v1.1 expanded |
| `planning/STATE.md` | Project state at v1.1 start — shows 40% progress, performance metrics from v1.0 |
| `planning/codebase/CONVENTIONS.md` | Codebase conventions found by `/gsd:map-codebase` — drives auto-decisions |
| `planning/phases/05-notifications/05-CONTEXT.md` | **Key file** — brownfield recommendation-first decisions referencing existing patterns |

## How Brownfield Differs from Greenfield

The core difference is **existing patterns constrain decisions**. In a greenfield project, auto-decisions reference industry standards and framework conventions. In a brownfield project, auto-decisions reference **your actual codebase**.

### 1. Validated Requirements Drive Confidence

PROJECT.md has 15 requirements marked as validated from v1.0. These are not hypotheses — they shipped, they work, real users depend on them. New v1.1 requirements must maintain backward compatibility.

### 2. Codebase Conventions Replace Guesswork

`/gsd:map-codebase` produces CONVENTIONS.md documenting patterns the team already uses: module structure, entity conventions, DTO validation, guard-based auth. When the discuss phase auto-decides "use NestJS module pattern," it is referencing the actual `TasksModule` in the codebase, not a theoretical best practice.

### 3. Auto-Decisions Reference Real Code

In `05-CONTEXT.md`, every auto-decision cites an existing pattern:
- "Following existing TasksModule structure" (not "following NestJS docs")
- "Via existing Redis connection" (not "recommend Redis")
- "Matching /api/v1/ route prefix" (not "use RESTful URLs")

This is what makes brownfield planning faster and more reliable — 70% of decisions are already made by the codebase itself.

### 4. Roadmap Shows History

The roadmap does not start at Phase 1. Phases 1-4 are collapsed as completed v1.0 work. Phase numbering continues from 5, preserving the project's full history while keeping focus on current work.
