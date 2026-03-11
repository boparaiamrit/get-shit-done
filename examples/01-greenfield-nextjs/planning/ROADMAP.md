# Roadmap: ShopWave

## Overview

ShopWave ships in four phases: foundation (auth + app shell), product catalog, cart and checkout flow, and order management with payment processing. Each phase delivers a usable vertical slice — after Phase 2, the store is browsable; after Phase 3, customers can buy; after Phase 4, the full purchase lifecycle is complete.

## Phases

- [ ] **Phase 1: Foundation** - Auth system and app shell layout
- [ ] **Phase 2: Product Catalog** - Browsable, searchable product pages
- [ ] **Phase 3: Cart & Checkout** - Shopping cart and Stripe payment flow
- [ ] **Phase 4: Orders & Fulfillment** - Order creation, history, and confirmation emails

## Phase Details

### Phase 1: Foundation
**Goal**: Working authentication system with app shell layout — users can sign up, log in, and navigate a responsive storefront skeleton.
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria** (what must be TRUE):
  1. User can sign up with email/password and see their name in the header
  2. User can log out and log back in with persisted session
  3. User can request a password reset and set a new password via emailed link
  4. Unauthenticated user hitting /account is redirected to /login
**Plans**: 3 plans

Plans:
- [ ] 01-01: Auth system (NextAuth.js, sign up, login, JWT sessions)
- [ ] 01-02: App shell layout (header, footer, navigation, responsive grid)
- [ ] 01-03: Password reset flow (email sending, token verification, reset page)

### Phase 2: Product Catalog
**Goal**: Server-rendered product pages with search, filtering, and sorting — the store is browsable and SEO-indexed.
**Depends on**: Phase 1
**Requirements**: PROD-01, PROD-02, PROD-03, PROD-04, PROD-05
**Success Criteria** (what must be TRUE):
  1. Product listing page renders server-side with seeded data visible
  2. User can search by name and see filtered results without full page reload
  3. User can click a product and see detail page with images, description, and price
  4. User can filter by category and sort by price — URL updates reflect filters
**Plans**: 2 plans

Plans:
- [ ] 02-01: Product data model and listing page (Prisma schema, seed data, server-rendered grid)
- [ ] 02-02: Search, filter, and sort (search bar, category filter, price sort, URL state)

### Phase 3: Cart & Checkout
**Goal**: Full shopping cart with Stripe Checkout integration — customers can add items, manage their cart, and complete a payment.
**Depends on**: Phase 2
**Requirements**: CART-01, CART-02, CART-03, CART-04, CHKT-01, CHKT-02, CHKT-03
**Success Criteria** (what must be TRUE):
  1. User can add product to cart and see cart icon update with item count
  2. Cart page shows line items with quantities, individual prices, and total
  3. User can proceed to checkout and complete payment via Stripe hosted page
  4. After payment, user lands on confirmation page showing order summary
**Plans**: 3 plans

Plans:
- [ ] 03-01: Cart data model and API (Prisma CartItem model, add/update/remove endpoints)
- [ ] 03-02: Cart UI (cart page, cart icon with count, quantity controls)
- [ ] 03-03: Checkout flow (shipping form, Stripe Checkout session, confirmation page)

### Phase 4: Orders & Fulfillment
**Goal**: Order lifecycle management — orders are created from Stripe webhooks, users can view history, and confirmation emails are sent.
**Depends on**: Phase 3
**Requirements**: ORDR-01, ORDR-02, ORDR-03
**Success Criteria** (what must be TRUE):
  1. Stripe webhook creates order record when payment succeeds
  2. User can view /orders page with list of past orders and their statuses
  3. User receives confirmation email within 60 seconds of successful payment
**Plans**: 2 plans

Plans:
- [ ] 04-01: Order model and Stripe webhook (Order schema, webhook handler, cart-to-order conversion)
- [ ] 04-02: Order history and confirmation email (order list page, order detail, email via Resend)

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/3 | Not started | - |
| 2. Product Catalog | 0/2 | Not started | - |
| 3. Cart & Checkout | 0/3 | Not started | - |
| 4. Orders & Fulfillment | 0/2 | Not started | - |
