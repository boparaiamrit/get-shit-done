# Roadmap: TaskForge

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2025-08-20)
- 🚧 **v1.1 Enhanced** — Phases 5-6 (in progress)
- 📋 **v2.0 Collaboration** — Phases 7-9 (planned)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) — SHIPPED 2025-08-20</summary>

### Phase 1: Authentication & Authorization
**Goal**: Secure user registration, login, and role-based access
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Plans**: 2 plans

Plans:
- [x] 01-01: JWT auth system with registration, login, and refresh rotation
- [x] 01-02: Role-based access control with guards and decorators

### Phase 2: Tasks & Projects Core
**Goal**: CRUD operations for tasks and projects with assignment
**Requirements**: TASK-01, TASK-02, TASK-03, PROJ-01
**Plans**: 3 plans

Plans:
- [x] 02-01: Project entity, module, and CRUD endpoints
- [x] 02-02: Task entity with priority, status, and configurable workflow
- [x] 02-03: Task assignment and project membership linking

### Phase 3: Task Enrichment
**Goal**: Comments, attachments, and filtering on tasks
**Requirements**: TASK-04, TASK-05, TASK-06
**Plans**: 2 plans

Plans:
- [x] 03-01: Comments system and S3 file attachments
- [x] 03-02: Task filtering, sorting, and pagination

### Phase 4: Project Management
**Goal**: Team invitations, per-project roles, archiving
**Requirements**: PROJ-02, PROJ-03, PROJ-04
**Plans**: 2 plans

Plans:
- [x] 04-01: Email invitations and project membership management
- [x] 04-02: Per-project roles and soft-delete archiving

</details>

### 🚧 v1.1 Enhanced (In Progress)

**Milestone Goal:** Add notification system and full-text search so teams stay informed and can find work quickly.

#### Phase 5: Notifications
**Goal**: In-app and email notifications for task events with user preferences
**Depends on**: Phase 4 (requires project membership and task assignment)
**Requirements**: NOTF-01, NOTF-02, NOTF-03, NOTF-04
**Success Criteria** (what must be TRUE):
  1. User receives in-app notification within 5 seconds of a triggering event
  2. User receives email for assignments and approaching due dates
  3. User can toggle notification preferences per event type
  4. User can view, mark read, and dismiss notifications via API
**Plans**: 2 plans

Plans:
- [ ] 05-01: Notification infrastructure — entities, event emitter, BullMQ processor, delivery service
- [ ] 05-02: Notification API — CRUD endpoints, preferences, mark-read, email templates

#### Phase 6: Search
**Goal**: Full-text search across tasks with filters and saved queries
**Depends on**: Phase 3 (requires task filtering infrastructure)
**Requirements**: SRCH-01, SRCH-02, SRCH-03, SRCH-04
**Success Criteria** (what must be TRUE):
  1. User can search task titles and descriptions with relevance ranking
  2. Search combines with existing filters (project, status, assignee, date, priority)
  3. Matching terms are highlighted in search results
  4. User can save a search query and retrieve it by name
**Plans**: 2 plans

Plans:
- [ ] 06-01: PostgreSQL full-text search — tsvector columns, GIN indexes, search service
- [ ] 06-02: Search API — endpoints, filter combination, saved queries, result highlighting

### 📋 v2.0 Collaboration (Planned)

**Milestone Goal:** Real-time updates, analytics dashboards, and third-party integrations.

#### Phase 7: Real-time Updates
**Goal**: WebSocket-based live task updates and user presence
**Depends on**: Phase 5 (extends notification infrastructure)
**Requirements**: RT-01, RT-02
**Plans**: TBD

#### Phase 8: Analytics
**Goal**: Project velocity dashboards and data export
**Depends on**: Phase 6 (leverages search/query infrastructure)
**Requirements**: ANLYT-01, ANLYT-02, ANLYT-03
**Plans**: TBD

#### Phase 9: Integrations
**Goal**: Webhook system, Slack and GitHub integrations
**Depends on**: Phase 5 (extends event system)
**Requirements**: INTG-01, INTG-02, INTG-03
**Plans**: TBD

## Progress

**Execution Order:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Authentication | v1.0 | 2/2 | Complete | 2025-04-10 |
| 2. Tasks & Projects | v1.0 | 3/3 | Complete | 2025-05-22 |
| 3. Task Enrichment | v1.0 | 2/2 | Complete | 2025-07-01 |
| 4. Project Management | v1.0 | 2/2 | Complete | 2025-08-20 |
| 5. Notifications | v1.1 | 0/2 | Not started | - |
| 6. Search | v1.1 | 0/2 | Not started | - |
| 7. Real-time | v2.0 | 0/? | Not started | - |
| 8. Analytics | v2.0 | 0/? | Not started | - |
| 9. Integrations | v2.0 | 0/? | Not started | - |

---
*Roadmap created: 2025-03-15*
*Last updated: 2025-09-15 after v1.1 milestone creation*
