# ShopWave

## What This Is

A modern e-commerce storefront built for indie brands who want a fast, beautiful shopping experience without marketplace overhead. ShopWave lets customers browse products, manage a cart, and check out with Stripe — optimized for SEO and Core Web Vitals from day one.

## Core Value

Customers can discover products and complete a purchase in under 60 seconds with zero friction.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can sign up and log in with email/password
- [ ] User session persists across browser refresh
- [ ] User can reset password via email link
- [ ] User can browse products with server-rendered pages
- [ ] User can search products by name and category
- [ ] User can view detailed product page with images, description, and pricing
- [ ] User can filter products by category, price range, and availability
- [ ] User can sort product listings by price, name, or newest
- [ ] User can add products to cart and see cart update in real time
- [ ] User can adjust quantities or remove items from cart
- [ ] Cart persists across sessions for logged-in users
- [ ] User can enter shipping information during checkout
- [ ] User can pay with Stripe (card payments)
- [ ] User receives order confirmation email after purchase
- [ ] User can view order history and order status

### Out of Scope

- Admin dashboard — v2 feature, seed data via Prisma for v1
- Multi-vendor / marketplace model — single-brand store only
- Internationalization (i18n) — English-only for launch
- Native mobile app — responsive web handles mobile
- Inventory management — manual stock counts via database for v1
- Subscription/recurring payments — one-time purchases only
- Customer reviews and ratings — deferred to v2

## Context

Solo developer building for a friend's indie jewelry brand. The friend currently sells on Etsy but wants their own storefront for better margins and branding control. Target audience is US-based, mobile-heavy (60%+ traffic expected on mobile).

Next.js 15 App Router chosen for:
- Server components for fast initial loads and SEO
- Built-in image optimization for product photos
- Edge-compatible middleware for geo-based shipping
- React 19 support for concurrent features

Prisma chosen over raw SQL for type-safe database access and migration management. PostgreSQL on Neon (serverless) for Vercel compatibility.

The brand has approximately 50-200 products at launch. No need for complex search infrastructure — database queries with proper indexing are sufficient.

## Constraints

- **Tech stack**: Next.js 15, React 19, Tailwind CSS, Prisma ORM, PostgreSQL, Stripe — non-negotiable, chosen for ecosystem fit
- **Hosting**: Vercel free tier initially — limits serverless function duration to 10s, edge functions to 25MB
- **Budget**: $0/month infrastructure until revenue covers costs — rules out paid search (Algolia), paid email (SendGrid tier), paid CDN
- **Performance**: Core Web Vitals must be green (LCP < 2.5s, FID < 100ms, CLS < 0.1) — critical for SEO and conversion
- **Security**: PCI compliance via Stripe (never handle raw card data), bcrypt for passwords, CSRF protection on all mutations
- **Database**: Neon PostgreSQL serverless — connection pooling required, no long-running queries

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| App Router over Pages Router | Server components enable per-product SEO, streaming SSR improves TTFB | — Pending |
| Prisma over Drizzle | Better ecosystem, mature migrations, type generation — Drizzle is faster but less stable tooling | — Pending |
| Stripe Checkout (hosted) over Elements | Reduces PCI scope, faster to implement, handles SCA compliance automatically | — Pending |
| Email/password auth only for v1 | Simplifies launch, OAuth adds complexity with provider management — add Google/GitHub in v2 | — Pending |

---
*Last updated: 2026-03-09 after initial project setup*
