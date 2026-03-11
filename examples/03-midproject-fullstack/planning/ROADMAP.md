# Roadmap: MetricsDash

## Overview

MetricsDash ships in four phases: authentication foundation, API and data pipeline, dashboard UI, and real-time WebSocket layer. Each phase delivers a vertically complete slice — Phase 2 includes seed data and a basic test harness so the API is usable standalone, Phase 3 builds the visual layer on top of working endpoints, and Phase 4 adds the live update mechanism that connects everything.

## Phases

- [x] **Phase 1: Auth & Project Setup** — JWT authentication, user model, project scaffolding
- [x] **Phase 2: API Core & Data Pipeline** — REST endpoints, TimescaleDB schema, Redis caching, seed data
- [ ] **Phase 3: Dashboard UI** — KPI cards, charts, filters, responsive layout
- [ ] **Phase 4: Real-time & WebSocket** — Live updates, connection management, offline resilience

## Phase Details

### Phase 1: Auth & Project Setup
**Goal**: Working authentication system with JWT tokens, user registration, login, and protected route middleware. Both frontend and backend project scaffolding complete.
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria** (what must be TRUE):
  1. User can register with email/password and receive tokens
  2. User can log in and access protected endpoints
  3. Expired access tokens are silently refreshed via refresh token
  4. Unauthenticated requests to protected routes return 401
**Plans**: 2 plans

Plans:
- [x] 01-01: NestJS scaffolding, Prisma User model, bcrypt password hashing, JWT token generation with jose
- [x] 01-02: Login/register endpoints, refresh token rotation, auth guard middleware, frontend auth context

### Phase 2: API Core & Data Pipeline
**Goal**: Complete REST API for metric ingestion and retrieval, TimescaleDB hypertable schema, Redis caching layer, and seed data for development.
**Depends on**: Phase 1
**Requirements**: API-01, API-02, API-03, API-04, API-05
**Success Criteria** (what must be TRUE):
  1. POST /api/v1/events accepts and stores metric data points
  2. GET /api/v1/metrics returns aggregated values with time bucketing
  3. GET /api/v1/metrics/:id/series returns time-series data for charting
  4. Aggregation queries complete in under 200ms for 90-day range
  5. Redis cache reduces repeated aggregation query load
**Plans**: 3 plans

Plans:
- [x] 02-01: TimescaleDB hypertable schema, Prisma models for non-timeseries tables, migration scripts
- [x] 02-02: Ingestion endpoint with validation, rate limiting (100 events/sec), batch insert optimization
- [x] 02-03: Query endpoints with time bucketing, Redis caching layer, seed data generator

### Phase 3: Dashboard UI
**Goal**: Interactive dashboard with KPI cards, line/bar charts, date range filtering, and responsive layout. Consumes the API built in Phase 2.
**Depends on**: Phase 2
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05
**Success Criteria** (what must be TRUE):
  1. KPI cards display current value with trend indicator and percentage change
  2. Line charts render time-series data and respond to date range changes
  3. Bar charts display categorical comparisons for selected metrics
  4. FilterBar date range and metric selection propagates to all components
  5. Layout adapts between 2-column desktop and single-column mobile
**Plans**: 3 plans

Plans:
- [x] 03-01: Dashboard layout shell, KPI card components, TanStack Query hooks for metric data
- [ ] 03-02: Line chart and bar chart components with Recharts, tooltip formatting, responsive sizing
- [ ] 03-03: FilterBar with date range picker, metric selector, URL param sync, Zustand filter store

### Phase 4: Real-time & WebSocket
**Goal**: WebSocket gateway that pushes metric updates to connected dashboard clients, with connection state management and offline resilience.
**Depends on**: Phase 3
**Requirements**: RT-01, RT-02, RT-03, RT-04
**Success Criteria** (what must be TRUE):
  1. Dashboard receives metric updates via WebSocket without polling
  2. Charts update in-place (no full re-render) when new data arrives
  3. Connection indicator shows live/reconnecting/disconnected status
  4. Metrics ingested during disconnection are queued and replayed on reconnect
**Plans**: 2 plans

Plans:
- [ ] 04-01: NestJS WebSocket gateway, subscription channels per metric, client connection manager
- [ ] 04-02: Frontend WebSocket hook, TanStack Query cache injection, connection status UI, offline queue

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Auth & Project Setup | 2/2 | Complete | 2026-02-24 |
| 2. API Core & Data Pipeline | 3/3 | Complete | 2026-03-04 |
| 3. Dashboard UI | 1/3 | In progress | - |
| 4. Real-time & WebSocket | 0/2 | Not started | - |

---
*Roadmap created: 2026-02-18*
*Last updated: 2026-03-07 after Plan 03-01 completion*
