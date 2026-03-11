# Phase 3: Dashboard UI - Context

**Gathered:** 2026-03-05
**Status:** In progress (Plan 1 complete, Plan 2 in progress)

<domain>
## Phase Boundary

Interactive dashboard displaying KPI cards, line charts, bar charts, and a global FilterBar with date range selection. Consumes the REST API from Phase 2. Layout is responsive — 2-column grid on desktop, single column on mobile. Real-time WebSocket updates are Phase 4; this phase uses TanStack Query polling as a bridge.

</domain>

<auto_decisions>
## Auto-Decided (locked unless overridden)

### Chart Library
- **Recharts for all chart types**: Already in package.json from Phase 2 spike (1), declarative React API matches component model (4), sufficient for line/bar/area charts needed (3)
- **ResponsiveContainer wrapper on every chart**: Required for charts to resize within CSS Grid cells (4), Recharts does not auto-resize without it (1)

### State Management
- **TanStack Query for all server state (metrics, aggregations)**: Handles caching, background refetch, stale-while-revalidate — replaces manual fetch + useState (4), already configured in Phase 2 API hooks (1)
- **Zustand for UI-only state (active filters, layout preferences)**: Lightweight (< 1KB), no boilerplate, works alongside TanStack Query without overlap (4), convention for non-server state in this codebase (1)
- **URL search params as source of truth for date range and metric filters**: Enables shareable dashboard URLs, browser back/forward works with filter changes (4), standard SaaS dashboard pattern (4)

### Layout System
- **CSS Grid for dashboard layout**: `grid-template-columns: repeat(2, 1fr)` on desktop, `1fr` on mobile (4), Tailwind `grid` utilities keep it declarative (1)
- **Responsive breakpoints**: sm (640px), md (768px), lg (1024px) — Tailwind defaults (4), single-column below md, two-column at md and above (1)
- **KPI cards span full width in top row, charts fill grid cells below**: Standard dashboard information hierarchy — summary on top, detail below (4)

### Component Architecture
- **Compound component pattern for chart cards**: `<ChartCard>` wraps `<ChartCard.Header>`, `<ChartCard.Body>`, `<ChartCard.Footer>` — consistent visual treatment across chart types (4), matches existing card pattern from Phase 1 auth UI (1)
- **Shared FilterContext via Zustand store**: All dashboard components subscribe to `useFilterStore()` — filter changes propagate without prop drilling (4)
- **Each chart component receives data as prop, not fetches internally**: Data fetching lives in parent/page component via TanStack Query hooks — charts are pure display components (3), testable with mock data (4)

### Data Formatting
- **date-fns for timestamp formatting**: Already in deps (1), tree-shakeable (3), locale-aware formatting for chart axis labels (4)
- **Intl.NumberFormat for metric values**: Native browser API (4), handles currency (MRR), percentages (churn), integers (active_users) with locale-appropriate formatting (3)
- **Abbreviate large numbers**: 1,234 stays as-is, 12,345 becomes "12.3K", 1,234,567 becomes "1.2M" — standard dashboard convention (4)

### Error/Loading States
- **Skeleton loaders during initial fetch**: Matches card dimensions to prevent layout shift (4), project already uses skeleton pattern from auth pages (1)
- **Stale data displayed during background refetch**: TanStack Query staleTime: 30s, refetchInterval: 30s — user sees last-known data with a subtle "updating" indicator rather than a blank state (4)
- **Error state with retry button**: Toast notification for transient errors, inline error with retry for persistent failures (4), matches existing error handling pattern (1)

</auto_decisions>

<recommendations>
## Accepted Recommendations

### Chart Interaction Model
- **Recommendation**: Brush selection for zooming into time ranges + tooltip on hover showing exact values
- **Rationale**: Brush zoom is the standard for time-series dashboards — lets users drill into interesting patterns. Tooltip on hover provides exact values without cluttering the chart with labels. Recharts supports both via `<Brush>` and `<Tooltip>` composable components.
- **Alternatives considered**: Click-to-drill-down if future hierarchy needed (e.g., yearly → monthly → daily), crosshair cursor if multi-series comparison becomes important
- **Deep-think factors**: Industry standard for analytics dashboards (4), Recharts native support (1), reversible — can swap interaction model later (5)

### Data Refresh Strategy
- **Recommendation**: TanStack Query background refetch every 30 seconds + manual refresh button in FilterBar
- **Rationale**: 30-second polling provides "near real-time" feel without WebSocket complexity. Phase 4 will upgrade to WebSocket push, but polling works as a reliable baseline. Manual refresh button gives users control when they need immediate data.
- **Alternatives considered**: WebSocket push from the start (Phase 4 will add this — keeping phases independent), longer polling interval (60s) if API load becomes concern
- **Deep-think factors**: Phase independence — dashboard works standalone without Phase 4 (3), TanStack Query makes polling trivial with refetchInterval (1), upgradeable to WebSocket without UI changes (5)

### Empty State Design
- **Recommendation**: Skeleton loaders during initial fetch, friendly illustration with "No data yet — send your first metric via the API" message on truly empty state, retry button on error
- **Rationale**: Three distinct states need distinct UI: loading (skeleton), empty (onboarding guidance), error (actionable recovery). The empty state doubles as onboarding — shows users how to get started.
- **Alternatives considered**: Spinner instead of skeleton if implementation time is tight, sample/demo data pre-populated if onboarding friction is a concern
- **Deep-think factors**: Better perceived performance with skeletons over spinners (4), empty state as onboarding is a product decision that reduces support burden (3)

### Color Palette for Charts
- **Recommendation**: Use Tailwind color palette tokens — blue-500 for primary series, emerald-500 for positive trends, rose-500 for negative trends, slate-400 for axes/grid
- **Rationale**: Consistent with existing Tailwind theme. Semantic color mapping (green = good, red = bad) is immediately understood. Accessible contrast ratios against white background.
- **Alternatives considered**: Custom brand palette if design system exists (it does not yet), categorical palette (d3-scale-chromatic) if multi-series charts have more than 4 series
- **Deep-think factors**: Consistency with existing Tailwind theme (1), semantic meaning aids comprehension (4), accessible by default with Tailwind's contrast-checked palette (4)

</recommendations>

<decisions>
## Must-Ask Decisions

### Default dashboard layout
- 2-column grid on desktop: KPI cards in top row (full width, 4 cards in a flex row), charts in bottom section (2 columns)
- Single column on mobile: KPI cards stack vertically, charts stack below
- User chose this over a sidebar layout ("I want the full width for charts — no sidebar eating horizontal space")

### Date range defaults and presets
- Default view: Last 7 days
- Preset buttons: Today, Last 7 Days, Last 30 Days, Last 90 Days, Custom
- Custom opens a date picker popover (react-day-picker, already in deps)
- User chose 7 days default over 30 days ("most users check daily trends, 7 days shows the weekly pattern without too much noise")

</decisions>

<specifics>
## Specific Ideas

- "I want KPI cards to feel like Stripe Dashboard — big number, small trend indicator, clean"
- "Charts should have generous whitespace — not cramped. The data should breathe."
- "The date range picker should feel snappy — no modal, just a dropdown/popover"
- Trend arrow: up-right arrow (green) for positive change, down-right arrow (red) for negative, horizontal dash (gray) for flat. Percentage change shown next to arrow.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/client/lib/api.ts` — Axios instance with auth interceptor, base URL configured
- `src/client/contexts/AuthContext.tsx` — useAuth() hook for checking authentication state
- `src/client/components/ui/Skeleton.tsx` — Skeleton loader component from auth pages
- `src/client/components/ui/Button.tsx` — Shared button component with variants

### Established Patterns
- TanStack Query hooks in `src/client/hooks/` — one hook per API endpoint (e.g., `useMetrics()`, `useMetricSeries()`)
- API response types in `src/shared/types/` — shared between client and server
- Tailwind config extends default theme with custom spacing for dashboard cards

### Integration Points
- `GET /api/v1/metrics` → KPI cards (current values) and bar charts (categorical)
- `GET /api/v1/metrics/:id/series` → Line charts (time-series)
- Query params map directly to TanStack Query keys: `['metrics', { timeRange, bucket }]`

</code_context>

<deferred>
## Deferred Ideas

- WebSocket-driven chart updates — Phase 4 (currently using TanStack Query polling as bridge)
- Dashboard layout customization (drag-and-drop rearrangement) — v2, out of scope
- Chart annotations ("launched feature X here" markers) — v2 collaboration feature
- Export chart as PNG — v2, requires html2canvas or similar

</deferred>

---

*Phase: 03-dashboard*
*Context gathered: 2026-03-05*
