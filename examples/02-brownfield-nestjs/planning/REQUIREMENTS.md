# Requirements: TaskForge

**Defined:** 2025-03-15
**Core Value:** Teams can track and organize work without friction

## v1.0 Requirements (Shipped)

All v1.0 requirements shipped and validated. Existing API clients depend on these.

### Authentication

- [x] **AUTH-01**: User can register with email and password
- [x] **AUTH-02**: User can log in and receive JWT access + refresh tokens
- [x] **AUTH-03**: User can reset password via email link
- [x] **AUTH-04**: JWT refresh rotation prevents token theft
- [x] **AUTH-05**: Role-based access control (admin, member, viewer)

### Tasks

- [x] **TASK-01**: User can create tasks with title, description, priority, status
- [x] **TASK-02**: User can assign tasks to project members
- [x] **TASK-03**: User can update task status through configurable workflow
- [x] **TASK-04**: User can add comments to tasks
- [x] **TASK-05**: User can attach files to tasks (S3 storage)
- [x] **TASK-06**: User can filter and sort task lists by status, assignee, priority

### Projects

- [x] **PROJ-01**: User can create projects with name and description
- [x] **PROJ-02**: User can invite members to projects via email
- [x] **PROJ-03**: User can set member roles per project
- [x] **PROJ-04**: User can archive projects (soft delete)

## v1.1 Requirements (Active)

New capabilities for the current milestone.

### Notifications

- [ ] **NOTF-01**: User receives in-app notifications for task events (assignment, status change, comment, approaching due date)
- [ ] **NOTF-02**: User receives email notifications for critical events (assignment, due date within 24h)
- [ ] **NOTF-03**: User can configure notification preferences per event type (in-app, email, or both)
- [ ] **NOTF-04**: User can mark notifications as read/unread, dismiss individual or all notifications

### Search

- [ ] **SRCH-01**: User can full-text search across task titles and descriptions within a project
- [ ] **SRCH-02**: User can combine search with filters (project, status, assignee, date range, priority)
- [ ] **SRCH-03**: Search results return relevance-ranked matches with highlighted matching terms
- [ ] **SRCH-04**: User can save search queries and reuse them as named filters

## v2.0 Requirements (Deferred)

Tracked but not in current roadmap. Will be scoped after v1.1 ships.

### Real-time

- **RT-01**: Users see task updates in real-time without page refresh
- **RT-02**: Users see who else is viewing the same task (presence indicators)

### Analytics

- **ANLYT-01**: Project dashboard shows task completion velocity over time
- **ANLYT-02**: User can export task data as CSV for external reporting
- **ANLYT-03**: Admin can view organization-wide activity summary

### Integrations

- **INTG-01**: Webhook system for external consumers (task created, updated, completed)
- **INTG-02**: Slack integration for task notifications
- **INTG-03**: GitHub integration for linking commits to tasks

## Out of Scope

| Feature | Reason |
|---------|--------|
| Gantt charts / timeline views | Frontend concern, API-only project |
| Time tracking | Separate domain, would bloat task model |
| Elasticsearch | PostgreSQL full-text search sufficient at current scale |
| Mobile app | API-first approach, native clients deferred |
| Multi-tenancy isolation | Current org model sufficient for <50 orgs |
| Custom fields on tasks | Significant schema complexity, revisit if requested |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | ✓ Complete |
| AUTH-02 | Phase 1 | ✓ Complete |
| AUTH-03 | Phase 1 | ✓ Complete |
| AUTH-04 | Phase 1 | ✓ Complete |
| AUTH-05 | Phase 1 | ✓ Complete |
| TASK-01 | Phase 2 | ✓ Complete |
| TASK-02 | Phase 2 | ✓ Complete |
| TASK-03 | Phase 2 | ✓ Complete |
| TASK-04 | Phase 3 | ✓ Complete |
| TASK-05 | Phase 3 | ✓ Complete |
| TASK-06 | Phase 3 | ✓ Complete |
| PROJ-01 | Phase 2 | ✓ Complete |
| PROJ-02 | Phase 4 | ✓ Complete |
| PROJ-03 | Phase 4 | ✓ Complete |
| PROJ-04 | Phase 4 | ✓ Complete |
| NOTF-01 | Phase 5 | Pending |
| NOTF-02 | Phase 5 | Pending |
| NOTF-03 | Phase 5 | Pending |
| NOTF-04 | Phase 5 | Pending |
| SRCH-01 | Phase 6 | Pending |
| SRCH-02 | Phase 6 | Pending |
| SRCH-03 | Phase 6 | Pending |
| SRCH-04 | Phase 6 | Pending |

**Coverage:**
- v1.0 requirements: 15 total — 15 complete ✓
- v1.1 requirements: 8 total — 8 mapped to phases ✓
- v2.0 requirements: 8 total — deferred (not mapped)
- Unmapped: 0 ✓

---
*Requirements defined: 2025-03-15*
*Last updated: 2025-09-15 after v1.1 milestone creation*
