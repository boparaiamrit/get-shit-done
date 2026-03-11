# TaskForge

## What This Is

A task management REST API for development teams. Teams create projects, break work into tasks with assignees and priorities, and track progress through customizable statuses. Built with NestJS 10, TypeORM, and PostgreSQL, deployed via Docker Compose with Redis for caching and session management.

## Core Value

Teams can track and organize work without friction — creating, assigning, and updating tasks must feel instant and never lose data.

## Requirements

### Validated

<!-- Shipped in v1.0, confirmed valuable. These are load-bearing — existing API clients depend on them. -->

- ✓ AUTH-01: User can register with email and password — v1.0 Phase 1
- ✓ AUTH-02: User can log in and receive JWT access + refresh tokens — v1.0 Phase 1
- ✓ AUTH-03: User can reset password via email link — v1.0 Phase 1
- ✓ AUTH-04: JWT refresh rotation prevents token theft — v1.0 Phase 1
- ✓ AUTH-05: Role-based access control (admin, member, viewer) — v1.0 Phase 1
- ✓ TASK-01: User can create tasks with title, description, priority, status — v1.0 Phase 2
- ✓ TASK-02: User can assign tasks to project members — v1.0 Phase 2
- ✓ TASK-03: User can update task status through configurable workflow — v1.0 Phase 2
- ✓ TASK-04: User can add comments to tasks — v1.0 Phase 3
- ✓ TASK-05: User can attach files to tasks (S3 storage) — v1.0 Phase 3
- ✓ TASK-06: User can filter and sort task lists by status, assignee, priority — v1.0 Phase 3
- ✓ PROJ-01: User can create projects with name and description — v1.0 Phase 2
- ✓ PROJ-02: User can invite members to projects via email — v1.0 Phase 4
- ✓ PROJ-03: User can set member roles per project — v1.0 Phase 4
- ✓ PROJ-04: User can archive projects (soft delete) — v1.0 Phase 4

### Active

<!-- v1.1 scope. Building toward these. -->

- [ ] NOTF-01: User receives in-app notifications for task events
- [ ] NOTF-02: User receives email notifications for critical events (assignment, due date)
- [ ] NOTF-03: User can configure notification preferences per event type
- [ ] NOTF-04: User can mark notifications as read/unread and dismiss
- [ ] SRCH-01: User can full-text search across task titles and descriptions
- [ ] SRCH-02: User can search with filters (project, status, assignee, date range)
- [ ] SRCH-03: Search results show relevance-ranked matches with highlighted terms
- [ ] SRCH-04: User can save and reuse search queries

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Real-time collaboration (live cursors, presence) — high complexity, WebSocket infra not justified yet
- Gantt charts / timeline views — frontend concern, API-only for now
- Time tracking — separate domain, would bloat task model
- Third-party integrations (Slack, GitHub) — v2.0 scope, needs webhook infrastructure first
- Mobile app — API-first, clients come later
- Elasticsearch — PostgreSQL full-text search sufficient for current scale (<100k tasks)

## Context

- **Team:** 3 backend engineers, 1 DevOps. No dedicated frontend — API consumed by a separate React team.
- **Runtime:** 6 months in production. ~200 active users across 15 organizations. ~45k tasks in database.
- **Infra:** Docker Compose for local dev, Kubernetes for staging/prod. PostgreSQL 15, Redis 7.
- **Codebase:** ~18k lines of TypeScript. 47 TypeORM entities. 12 NestJS modules. 340 unit tests, 85 e2e tests.
- **Tech debt:** Task filtering is N+1 query prone (tracked in backlog). Some DTOs lack proper validation. No request rate limiting yet.
- **API clients:** React dashboard (internal team), 2 third-party integrations using API keys.

## Constraints

- **Backward compatibility**: v1.1 must not break existing API contracts — existing clients depend on current response shapes
- **Database**: PostgreSQL only — no Elasticsearch, no MongoDB. Full-text search must use pg_trgm and tsvector
- **Infrastructure**: Must use existing Redis instance for any queue/cache needs — no new infrastructure services
- **Performance**: Notification delivery must not slow down task CRUD operations (async processing required)
- **Migration safety**: All TypeORM migrations must be reversible (down migrations required)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| NestJS over Express | Opinionated structure keeps 3-person team consistent | ✓ Good — module pattern scales well |
| TypeORM over Prisma | Team experience, mature migration system | ✓ Good — migrations reliable in prod |
| JWT with refresh rotation | Stateless auth, Redis blacklist for revocation | ✓ Good — no session storage scaling issues |
| S3 for file attachments | Offload binary storage from API server | ✓ Good — simplified deployment |
| class-validator DTOs | Runtime validation, Swagger auto-generation | ✓ Good — caught many bad inputs in prod |
| BullMQ for async jobs | Already in deps for email sending, Redis-backed | — Pending (v1.1 will expand usage) |

---
*Last updated: 2025-09-15 after v1.1 milestone kickoff*
