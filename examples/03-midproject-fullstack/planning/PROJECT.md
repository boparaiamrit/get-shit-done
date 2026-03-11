# MetricsDash

## What This Is

A real-time analytics dashboard that lets SaaS founders track their key business metrics — MRR, churn rate, active users, feature adoption — with live-updating charts and KPI cards. Built as a standalone web app that ingests data via REST API and displays it through an interactive dashboard with WebSocket-powered real-time updates.

## Core Value

Teams see their key metrics update live without refreshing — the dashboard is always current, eliminating the "stale spreadsheet" problem that plagues early-stage SaaS teams.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- [x] AUTH-01: User can sign up with email and password
- [x] AUTH-02: User can log in and receive JWT access + refresh tokens
- [x] AUTH-03: Protected routes reject unauthenticated requests with 401
- [x] AUTH-04: Refresh token rotation extends sessions without re-login
- [x] API-01: POST /api/v1/events ingests metric data points with timestamp, metric name, and value
- [x] API-02: GET /api/v1/metrics returns aggregated metric values with configurable time buckets
- [x] API-03: GET /api/v1/metrics/:id/series returns time-series data for a specific metric
- [x] API-04: TimescaleDB hypertables store time-series data with automatic chunk management
- [x] API-05: Redis caches frequently-accessed aggregations with 30-second TTL

### Active

<!-- Current scope. Building toward these. -->

- [ ] DASH-01: Dashboard displays KPI cards showing current value, trend arrow, and percentage change
- [ ] DASH-02: Line charts render time-series data with configurable date ranges
- [ ] DASH-03: Bar charts display categorical metric comparisons
- [ ] DASH-04: Global FilterBar applies date range and metric filters across all dashboard components
- [ ] DASH-05: Dashboard layout is responsive — 2-column grid on desktop, single column on mobile
- [ ] RT-01: WebSocket connection delivers metric updates to connected clients in real-time
- [ ] RT-02: Charts update in-place when new data arrives without full re-render
- [ ] RT-03: Connection status indicator shows live/reconnecting/disconnected state
- [ ] RT-04: Offline queue buffers metric ingestion during connection loss and replays on reconnect

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Custom report builder — High complexity, v2 feature after validating core dashboard value
- PDF export — Requires headless rendering infrastructure, defer until users request it
- Multi-tenancy — Solo founder target, single-tenant simplifies auth and data isolation
- Mobile native app — Responsive web covers mobile use case for v1
- SSO/SAML — Email/password sufficient for early-stage target audience
- Custom dashboard layouts — Fixed layout for v1, drag-and-drop rearrangement is v2

## Context

Targeting early-stage SaaS founders (1-10 person teams) who currently track metrics in spreadsheets or basic tools like Baremetrics/ChartMogul but want something self-hosted and customizable. The key differentiator is real-time updates via WebSocket — most competing tools refresh on page load or at best poll every few minutes.

Solo developer with strong backend experience (NestJS, PostgreSQL) and moderate frontend experience (React, but first time with Recharts). Previous project used Socket.IO, switching to native NestJS WebSocket gateway for tighter integration.

TimescaleDB was chosen over InfluxDB for its PostgreSQL compatibility — same connection, same ORM (with raw queries for hypertable features), familiar SQL for aggregations. Redis handles caching of expensive aggregation queries that would otherwise hit TimescaleDB on every dashboard load.

## Constraints

- **Performance**: Chart updates must render in under 100ms after WebSocket message received — users perceive anything slower as "not real-time"
- **Time-series storage**: TimescaleDB hypertables with 1-hour chunk intervals for sub-second queries on up to 90 days of data
- **Deployment**: Vercel for frontend (static export), Railway for NestJS backend + PostgreSQL + Redis
- **Bundle size**: Frontend bundle under 200KB gzipped — Recharts is the largest dependency at ~45KB
- **Browser support**: Chrome, Firefox, Safari, Edge — last 2 versions. No IE11.
- **API rate limiting**: 100 events/second per API key for ingestion endpoint — prevents accidental flood from misconfigured clients

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| jose over jsonwebtoken for JWT | ESM-native, smaller bundle, Edge-compatible if needed later | ✓ Good — no issues, clean API |
| Refresh token rotation (not sliding expiry) | More secure — each token used exactly once, stolen tokens detected | ✓ Good — implemented cleanly with DB-backed revocation |
| TimescaleDB over InfluxDB | PostgreSQL compatibility means single DB engine, familiar SQL, Prisma for non-timeseries tables | ✓ Good — raw SQL for hypertable ops works fine alongside Prisma |
| Redis with 30s TTL for aggregation cache | Dashboard loads hit same aggregations repeatedly, 30s balances freshness vs DB load | ✓ Good — P95 dashboard load dropped from 800ms to 120ms |
| NestJS WebSocket gateway over Socket.IO | Tighter NestJS integration, smaller dependency, sufficient for our pub/sub pattern | — Pending (Phase 4) |
| TanStack Query for server state | Handles caching, refetching, optimistic updates — replaces manual fetch + useState | — Pending (Phase 3, in use) |
| Zustand for UI state (filters, layout) | Lightweight, no boilerplate, works alongside TanStack Query without conflict | — Pending (Phase 3, in use) |
| Recharts over Victory/Nivo | Simpler API for our chart types, smaller bundle, good React 18 support | — Pending (Phase 3, evaluating) |

---
*Last updated: 2026-03-07 after Phase 2 completion*
