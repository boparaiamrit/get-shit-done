# Codebase Conventions: TaskForge

**Scanned:** 2025-09-15 via `/gsd:map-codebase`
**Codebase size:** ~18k lines TypeScript, 12 modules, 47 entities

## Module Structure

Every feature follows the NestJS module pattern consistently:

```
src/
  modules/
    tasks/
      tasks.module.ts          # Module registration
      tasks.controller.ts      # Route handlers
      tasks.service.ts         # Business logic
      dto/
        create-task.dto.ts     # Input validation
        update-task.dto.ts
        task-query.dto.ts      # Filter/pagination params
      entities/
        task.entity.ts         # TypeORM entity
      guards/
        task-owner.guard.ts    # Resource ownership check
      tasks.controller.spec.ts # Unit tests
      tasks.e2e-spec.ts        # E2E tests
```

**Convention:** One module per domain. Controller handles HTTP, service handles logic, entities handle persistence. No cross-module service injection — use events or explicit module imports.

## TypeORM Entity Conventions

All entities extend a `BaseEntity` class with standard columns:

```typescript
@Entity()
export class Task extends BaseEntity {
  // BaseEntity provides: id (UUID), createdAt, updatedAt, deletedAt (soft delete)

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'assignee_id' })
  assignee: User;
}
```

**Conventions found:**
- UUIDs for all primary keys (never auto-increment)
- Soft delete via `deletedAt` column on all entities
- `snake_case` column names in database, `camelCase` in TypeScript
- Eager loading disabled by default — explicit joins via QueryBuilder
- Enums stored as PostgreSQL enum types

## DTO Validation Pattern

All input DTOs use `class-validator` decorators with `class-transformer`:

```typescript
export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;
}
```

**Conventions found:**
- Global `ValidationPipe` with `whitelist: true` and `transform: true`
- Optional fields always have `@IsOptional()` + `?` suffix
- UUIDs validated with `@IsUUID()`
- All DTOs have corresponding Swagger `@ApiProperty()` decorators
- Response DTOs use `class-transformer` `@Expose()` and `@Exclude()`

## Authentication & Guards

JWT-based auth with custom decorators:

```typescript
@Controller('api/v1/tasks')
@UseGuards(JwtAuthGuard)          // All routes require auth
@ApiBearerAuth()
export class TasksController {

  @Post()
  @Roles(Role.ADMIN, Role.MEMBER)  // Role-based access
  create(@CurrentUser() user: User, @Body() dto: CreateTaskDto) { ... }

  @Get(':id')
  @UseGuards(TaskOwnerGuard)       // Resource-level access
  findOne(@Param('id', ParseUUIDPipe) id: string) { ... }
}
```

**Conventions found:**
- `@CurrentUser()` custom decorator extracts user from JWT
- `@Roles()` decorator + `RolesGuard` for role-based access
- Resource-specific guards (e.g., `TaskOwnerGuard`) for ownership checks
- All routes under `/api/v1/` prefix
- `ParseUUIDPipe` on all ID params

## API Response Pattern

Standardized response wrapper:

```typescript
// Success: { data: T, meta?: { page, limit, total } }
// Error: { statusCode, message, error }
// Pagination: QueryBuilder-based, page/limit from query params
```

**Conventions found:**
- No custom response interceptor — NestJS default with manual wrapping in controller
- Pagination via `page` and `limit` query params, default limit 20
- List endpoints return `{ data: T[], meta: { page, limit, total } }`
- Error responses follow NestJS `HttpException` format

## Testing Patterns

```
Unit tests:  *.spec.ts  (jest, module mocking via Test.createTestingModule)
E2E tests:   *.e2e-spec.ts  (supertest, test database, full app bootstrap)
Factories:   test/factories/  (entity factories for test data)
```

**Conventions found:**
- Jest with `ts-jest` transform
- Unit tests mock dependencies via `@nestjs/testing` module builder
- E2E tests use a separate test database (docker-compose.test.yml)
- Test factories create entities with sensible defaults
- Coverage threshold: 80% lines (enforced in CI)

## Infrastructure

- **Redis:** Used for JWT blacklist (token revocation) and BullMQ job queue (email sending)
- **S3:** File attachments uploaded via `@aws-sdk/client-s3`, presigned URLs for downloads
- **Docker:** `docker-compose.yml` for local dev (postgres, redis, api). Kubernetes for prod.
- **Migrations:** TypeORM CLI migrations in `src/migrations/`, run on deploy via entrypoint script

---
*Scanned: 2025-09-15*
*Source: /gsd:map-codebase analysis of src/ directory*
