# Requirements: MetricsDash

**Defined:** 2026-02-18
**Core Value:** Teams see their key metrics update live without refreshing

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [x] **AUTH-01**: User can sign up with email and password
- [x] **AUTH-02**: User can log in and receive JWT access + refresh tokens
- [x] **AUTH-03**: Protected routes reject unauthenticated requests with 401
- [x] **AUTH-04**: Refresh token rotation extends sessions without re-login

### API Core

- [x] **API-01**: POST /api/v1/events ingests metric data points with timestamp, metric name, and value
- [x] **API-02**: GET /api/v1/metrics returns aggregated metric values with configurable time buckets
- [x] **API-03**: GET /api/v1/metrics/:id/series returns time-series data for a specific metric
- [x] **API-04**: TimescaleDB hypertables store time-series data with automatic chunk management
- [x] **API-05**: Redis caches frequently-accessed aggregations with 30-second TTL

### Dashboard

- [ ] **DASH-01**: Dashboard displays KPI cards showing current value, trend arrow, and percentage change
- [ ] **DASH-02**: Line charts render time-series data with configurable date ranges
- [ ] **DASH-03**: Bar charts display categorical metric comparisons
- [ ] **DASH-04**: Global FilterBar applies date range and metric filters across all dashboard components
- [ ] **DASH-05**: Dashboard layout is responsive — 2-column grid on desktop, single column on mobile

### Real-time

- [ ] **RT-01**: WebSocket connection delivers metric updates to connected clients in real-time
- [ ] **RT-02**: Charts update in-place when new data arrives without full re-render
- [ ] **RT-03**: Connection status indicator shows live/reconnecting/disconnected state
- [ ] **RT-04**: Offline queue buffers metric ingestion during connection loss and replays on reconnect

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Alerting

- **ALRT-01**: User can define threshold alerts on any metric (e.g., "MRR drops below $5000")
- **ALRT-02**: Alerts trigger email notification with metric snapshot
- **ALRT-03**: Alert history shows past triggers with timestamps and values

### Integrations

- **INTG-01**: Slack webhook sends alert notifications to configured channel
- **INTG-02**: Stripe webhook auto-ingests MRR, churn, and subscription count metrics
- **INTG-03**: CSV import for bulk historical data loading

### Collaboration

- **COLLAB-01**: User can invite team members with view-only or editor roles
- **COLLAB-02**: Shared dashboard link with optional password protection
- **COLLAB-03**: Annotation markers on charts for team context ("launched feature X here")

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Custom report builder | High complexity, unclear demand — validate core dashboard first |
| PDF/image export | Requires headless rendering (Puppeteer), significant infra cost for solo dev |
| Multi-tenancy | Single-tenant simplifies everything — auth, data isolation, deployment |
| Drag-and-drop layout | Fixed layout for v1, custom layouts are a v2 feature |
| Mobile native app | Responsive web covers mobile; native app only if usage data justifies |
| White-labeling | Enterprise feature, not relevant for early-stage SaaS founder target |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| API-01 | Phase 2 | Complete |
| API-02 | Phase 2 | Complete |
| API-03 | Phase 2 | Complete |
| API-04 | Phase 2 | Complete |
| API-05 | Phase 2 | Complete |
| DASH-01 | Phase 3 | In Progress |
| DASH-02 | Phase 3 | In Progress |
| DASH-03 | Phase 3 | In Progress |
| DASH-04 | Phase 3 | In Progress |
| DASH-05 | Phase 3 | In Progress |
| RT-01 | Phase 4 | Pending |
| RT-02 | Phase 4 | Pending |
| RT-03 | Phase 4 | Pending |
| RT-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0
- Complete: 9 (50%)
- In Progress: 5 (28%)
- Pending: 4 (22%)

---
*Requirements defined: 2026-02-18*
*Last updated: 2026-03-07 after Phase 2 completion*
