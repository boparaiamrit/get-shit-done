# Phase 5: Notifications - Context

**Gathered:** 2025-09-16
**Status:** Ready for planning

<domain>
## Phase Boundary

In-app and email notifications for task events. Users are notified when tasks are assigned to them, task status changes, comments are added, and due dates approach. Users can configure which events trigger notifications and through which channel (in-app, email, or both). Notification preferences, read/unread state, and dismissal are part of this phase. Real-time push (WebSocket) is Phase 7 scope — this phase delivers pull-based in-app and async email.

</domain>

<auto_decisions>
## Auto-Decided (locked unless overridden)

### Module Architecture
- **NestJS module at `src/modules/notifications/`**: Following established module-per-domain pattern from TasksModule, ProjectsModule — matches codebase conventions (1), team already knows this structure (3)
- **NotificationsService injectable for business logic**: Consistent with TasksService, UsersService pattern — single service per module, controller delegates (1)
- **TypeORM entities in `entities/` subdirectory**: `Notification` and `NotificationPreference` entities extending BaseEntity with UUID PK, soft delete, timestamps — existing entity convention (1)
- **snake_case DB columns, camelCase TypeScript**: Following existing TypeORM naming strategy configured in `ormconfig.ts` — codebase convention (1)

### Delivery Infrastructure
- **BullMQ job queue via existing Redis connection**: Already used for password reset emails in AuthModule — reuse existing `bull` config in `app.module.ts`, add `notifications` queue — existing infra (1), appropriate for async delivery (2)
- **Nodemailer for email delivery**: Already in `package.json` dependencies, configured in AuthModule for password reset — reuse transport config, add notification-specific templates — existing dependency (1)
- **Separate processor for email vs in-app**: BullMQ named processors — `notification-inapp` writes to DB, `notification-email` sends via Nodemailer — separation of concerns (4), independent retry policies (3)

### API Design
- **RESTful endpoints under `/api/v1/notifications`**: Following existing route prefix pattern, JwtAuthGuard applied at controller level — codebase convention (1), industry standard (4)
- **class-validator DTOs for all inputs**: `UpdatePreferencesDto`, `MarkReadDto` with `@IsUUID()`, `@IsEnum()`, `@IsBoolean()` — matches existing DTO pattern (1), Swagger auto-generation (1)
- **Pagination via `page`/`limit` query params**: Consistent with task list endpoint pattern, default limit 20 — codebase convention (1)
- **`@CurrentUser()` decorator for notification ownership**: Only return notifications belonging to authenticated user — matches existing auth pattern (1), security requirement (4)

</auto_decisions>

<recommendations>
## Accepted Recommendations

### Event Collection Strategy
- **Recommendation**: NestJS EventEmitter2 for decoupled event publishing
- **Rationale**: Task, comment, and assignment operations emit domain events (`task.assigned`, `task.statusChanged`, `comment.created`, `task.dueDateApproaching`). NotificationsModule listens via `@OnEvent()` decorators. This decouples notification triggers from business logic — TasksService does not need to know about notifications. The `@nestjs/event-emitter` package is already in `node_modules` (transitive dependency) but unused directly. Adopting it keeps TasksService and ProjectsService unchanged.
- **Alternatives considered**: Direct service calls from TasksService to NotificationsService if want explicit control and simpler debugging; database triggers if want guaranteed capture regardless of application code path
- **Deep-think factors**: Decoupling over coupling (4), no changes to existing working services (1), NestJS-native pattern (4)

### Notification Preferences Storage
- **Recommendation**: Per-event-type toggles stored in a `notification_preferences` table with composite key (user_id, event_type)
- **Rationale**: Each row represents one user's preference for one event type with `in_app_enabled` and `email_enabled` boolean columns. Simpler to query than JSONB (direct WHERE clause), explicit schema makes preferences discoverable, and TypeORM entity gives type safety. Default preferences created on user registration via a migration seeding defaults for existing users.
- **Alternatives considered**: JSONB column on users table if want to avoid a new table and expect preferences to stay simple; separate preferences service with caching if expect high read volume on preferences
- **Deep-think factors**: Explicit schema over schemaless (3), queryable without JSON operators (3), migration path for existing users is clean (1)

### Email Templates
- **Recommendation**: Handlebars templates in `src/modules/notifications/templates/` directory
- **Rationale**: `.hbs` files are editable by non-engineers, render fast (pre-compiled), and Handlebars is battle-tested for email. The team can add new templates without touching TypeScript. NestJS has `@nestjs-modules/mailer` which wraps Nodemailer + Handlebars, but adding it as a dependency is optional — raw Handlebars compilation is simpler and avoids another abstraction layer.
- **Alternatives considered**: React Email if want type-safe components and preview tooling; inline HTML strings if only 2-3 templates and want zero dependencies; MJML if need complex responsive layouts
- **Deep-think factors**: Non-dev editable (3), fast render performance (3), minimal dependency footprint (2)

</recommendations>

<decisions>
## Must-Ask Decisions

### Which task events trigger notifications
- User specified four event types for v1.1:
  1. **Task assigned** — notify the assignee (in-app + email)
  2. **Task status changed** — notify assignee and task creator (in-app only by default)
  3. **Comment added** — notify all task participants except commenter (in-app only by default)
  4. **Due date approaching** — notify assignee 24 hours before due date (in-app + email)
- Explicitly excluded: task description edits, priority changes, attachment uploads — "too noisy, maybe v2"
- Due date check runs as a scheduled BullMQ job (daily at 08:00 UTC)

### Email delivery timing
- User chose a split strategy:
  - **Immediate** for task assignments — "people need to know right away when they get assigned work"
  - **Daily digest at 09:00 UTC** for everything else — "I don't want my team getting 30 emails a day"
- Digest aggregation: BullMQ delayed job collects pending email notifications, groups by user, sends single digest email per user
- Users can override to immediate for any event type in their preferences

</decisions>

<specifics>
## Specific Ideas

- "Notifications should feel like GitHub's — simple list, mark as read, link directly to the task"
- Assignment emails should include task title, project name, and a direct link — no fluff
- Digest email should group by project, then list events chronologically within each project
- "Don't notify me about my own actions" — if I change a task's status, I should not get a notification about it

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- **BullMQ setup in AppModule**: Queue configuration with Redis connection already exists — add `notifications` queue alongside existing `emails` queue
- **Nodemailer transport in AuthModule**: SMTP config for password reset emails — extract to shared `MailService` or duplicate config in NotificationsModule
- **BaseEntity class**: Provides `id`, `createdAt`, `updatedAt`, `deletedAt` — Notification entity extends this directly
- **Test factories in `test/factories/`**: Add `NotificationFactory` and `NotificationPreferenceFactory` following existing `TaskFactory` pattern

### Established Patterns
- **Guard-based auth**: JwtAuthGuard + @CurrentUser() — notifications controller follows same pattern, no new auth code needed
- **Soft delete**: All entities use `deletedAt` — notification "dismiss" maps to soft delete naturally
- **Pagination**: Existing `PaginationDto` and response format in TasksController — reuse for notification list endpoint
- **DTO validation**: class-validator with global ValidationPipe — all notification DTOs follow same pattern

### Integration Points
- **TasksService.update()**: Emit `task.statusChanged` event after successful update
- **TasksService.assignTask()**: Emit `task.assigned` event after assignment
- **CommentsService.create()**: Emit `comment.created` event after comment saved
- **Scheduled job**: New BullMQ cron job checks tasks with `dueDate` within 24 hours, emits `task.dueDateApproaching`

</code_context>

<deferred>
## Deferred Ideas

- WebSocket push for real-time notification delivery — Phase 7 (Real-time Updates)
- Notification badge count in API response headers — add if frontend requests it
- Slack/webhook notification channels — Phase 9 (Integrations)
- Notification grouping/threading (e.g., "3 comments on Task X") — v2 if notification volume becomes an issue

</deferred>

---

*Phase: 05-notifications*
*Context gathered: 2025-09-16*
