# Requirements: ShopWave

**Defined:** 2026-03-09
**Core Value:** Customers can discover products and complete a purchase in under 60 seconds with zero friction.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User session persists across browser refresh (JWT in httpOnly cookie)
- [ ] **AUTH-03**: User can reset password via email link
- [ ] **AUTH-04**: Protected routes redirect unauthenticated users to login

### Products

- [ ] **PROD-01**: User can browse products on a server-rendered listing page
- [ ] **PROD-02**: User can search products by name and category
- [ ] **PROD-03**: User can view a product detail page with images, description, price, and stock status
- [ ] **PROD-04**: User can filter products by category, price range, and availability
- [ ] **PROD-05**: User can sort product listings by price, name, or newest

### Cart

- [ ] **CART-01**: User can add a product to the cart from the product detail page
- [ ] **CART-02**: User can view all cart items with quantities and subtotal
- [ ] **CART-03**: User can adjust quantity or remove items from the cart
- [ ] **CART-04**: Cart persists across sessions for logged-in users (stored in database)

### Checkout

- [ ] **CHKT-01**: User can enter shipping address during checkout
- [ ] **CHKT-02**: User can pay via Stripe Checkout (hosted payment page)
- [ ] **CHKT-03**: User sees order confirmation page after successful payment

### Orders

- [ ] **ORDR-01**: User receives order confirmation email after purchase
- [ ] **ORDR-02**: User can view order history with status (pending, paid, shipped)
- [ ] **ORDR-03**: Order is created from cart contents when Stripe webhook confirms payment

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Wishlist

- **WISH-01**: User can add products to a wishlist
- **WISH-02**: User can view and manage their wishlist
- **WISH-03**: User receives notification when a wishlisted item goes on sale

### Reviews

- **REVW-01**: User can leave a star rating and text review on purchased products
- **REVW-02**: Product page displays aggregate rating and individual reviews
- **REVW-03**: Reviews require verified purchase

### Analytics

- **ANLT-01**: Store owner can view sales dashboard with revenue and order counts
- **ANLT-02**: Store owner can see top-selling products
- **ANLT-03**: Store owner can export order data as CSV

## Out of Scope

| Feature | Reason |
|---------|--------|
| Admin dashboard | Complexity too high for v1 — seed data via Prisma, manage via database |
| Multi-vendor marketplace | Single-brand store, multi-vendor is a different product |
| Internationalization (i18n) | English-only audience for launch, adds routing and translation complexity |
| Native mobile app | Responsive web covers mobile, native app unjustified at current scale |
| Subscription payments | One-time purchases only, subscriptions need billing portal and management UI |
| Real-time inventory sync | Manual stock via database sufficient for 50-200 products |
| Social login (OAuth) | Adds provider management complexity — defer to v2 after auth is stable |
| Guest checkout | Requires cart persistence without auth — adds edge cases, defer to v2 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| PROD-01 | Phase 2 | Pending |
| PROD-02 | Phase 2 | Pending |
| PROD-03 | Phase 2 | Pending |
| PROD-04 | Phase 2 | Pending |
| PROD-05 | Phase 2 | Pending |
| CART-01 | Phase 3 | Pending |
| CART-02 | Phase 3 | Pending |
| CART-03 | Phase 3 | Pending |
| CART-04 | Phase 3 | Pending |
| CHKT-01 | Phase 3 | Pending |
| CHKT-02 | Phase 3 | Pending |
| CHKT-03 | Phase 3 | Pending |
| ORDR-01 | Phase 4 | Pending |
| ORDR-02 | Phase 4 | Pending |
| ORDR-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0

---
*Requirements defined: 2026-03-09*
*Last updated: 2026-03-09 after initial definition*
