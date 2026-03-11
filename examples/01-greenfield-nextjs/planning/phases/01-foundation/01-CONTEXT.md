# Phase 1: Foundation - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Authentication system and app shell layout for the ShopWave storefront. Users can sign up, log in, reset their password, and navigate a responsive storefront skeleton. This phase establishes the auth infrastructure, protected route pattern, and visual shell that all subsequent phases build on. Product pages, cart, and checkout are separate phases.

</domain>

<auto_decisions>
## Auto-Decided (locked unless overridden)

### Auth Strategy
- **NextAuth.js (Auth.js v5) as auth framework**: De facto standard for Next.js App Router auth (4), handles session management, CSRF, and cookie security out of the box (3) — avoids reinventing auth middleware
- **Credentials provider for email/password**: Project scope is email/password only for v1 (5), NextAuth credentials provider is purpose-built for this (1)
- **bcrypt for password hashing with cost factor 12**: Industry standard (4), cost 12 balances security vs serverless function time limits (3)
- **httpOnly secure cookies for session token**: Prevents XSS token theft (4), NextAuth default behavior (1)

### Layout Architecture
- **App Router route groups for layout segmentation**: `(auth)` group for login/signup pages (no header), `(store)` group for main storefront (with header/footer) — standard Next.js 15 pattern (1), clean URL structure (4)
- **Root layout with metadata, fonts, and global providers**: Single source for `<html>`, Tailwind globals, and session provider — Next.js convention (1)
- **Mobile-first responsive with Tailwind breakpoints**: 60%+ traffic expected on mobile per project context (5), Tailwind's mobile-first approach matches (4)

### Security Defaults
- **CSRF protection via NextAuth built-in token**: Enabled by default in NextAuth, covers all auth mutations (4), no custom implementation needed (1)
- **Rate limiting on /api/auth/* endpoints via middleware**: Prevents brute force on login — 5 attempts per minute per IP using upstash/ratelimit (4), critical for production auth (3)
- **Input validation with Zod on all auth forms**: Type-safe server-side validation (4), catches malformed input before it reaches the database (3), Zod is already the Next.js ecosystem standard (1)
- **Passwords require minimum 8 characters, 1 uppercase, 1 number**: OWASP baseline (4), balances security with UX (3)

</auto_decisions>

<recommendations>
## Accepted Recommendations

### Session Strategy
- **Recommendation**: JWT sessions over database sessions
- **Rationale**: JWT sessions require no database lookup on every request — critical for Vercel Edge compatibility and serverless cold start performance. Solo developer on free tier means minimizing infrastructure. JWT payload carries userId and role, avoiding a round-trip per page load.
- **Alternatives considered**: Database sessions if the app needs instant session revocation (e.g., "log out all devices" feature), or if token payload becomes too large (> 4KB cookie limit)
- **Deep-think factors**: Vercel free tier constraint (5), serverless architecture fit (3), solo dev simplicity (4)

### Form Handling
- **Recommendation**: React Hook Form with Zod resolver for auth forms
- **Rationale**: React Hook Form provides uncontrolled form performance (no re-renders on every keystroke), Zod resolver shares validation schemas between client and server. The combo has the best TypeScript DX in the React ecosystem.
- **Alternatives considered**: Conform if progressive enhancement is needed (works without JS), native FormData with server actions if forms are very simple (< 3 fields)
- **Deep-think factors**: Type-safe client+server validation (4), React ecosystem standard (1), DX for solo dev (3)

### Loading States
- **Recommendation**: Next.js Suspense boundaries with Tailwind skeleton screens
- **Rationale**: Suspense is built into the App Router — `loading.tsx` files provide automatic skeleton states. No additional library needed. Skeleton screens provide better perceived performance than spinners, and Tailwind makes them trivial to build.
- **Alternatives considered**: React Query with placeholder data if client-side caching becomes important (Phase 3+ for cart state), plain loading spinners if skeleton design time is a concern
- **Deep-think factors**: Built into App Router (1), superior UX for e-commerce (4), zero additional dependencies (3)

### Email Delivery for Password Reset
- **Recommendation**: Resend for transactional email
- **Rationale**: Resend has a generous free tier (100 emails/day), a clean React-based email template API, and is built by the Vercel ecosystem community. Perfect fit for a solo dev on a budget who needs password reset emails now and order confirmation emails in Phase 4.
- **Alternatives considered**: Nodemailer with Gmail SMTP if zero cost is essential (but rate limits and deliverability issues), SendGrid if volume exceeds Resend free tier
- **Deep-think factors**: Free tier budget constraint (5), reusable for Phase 4 order emails (3), ecosystem fit (1)

</recommendations>

<decisions>
## Must-Ask Decisions

### Auth providers for v1
- Email/password only — no OAuth providers
- User chose to keep it simple for launch: "Let's just do email and password. I'll add Google login later when I know people actually want it."
- OAuth (Google, GitHub) explicitly deferred to v2

### Brand identity and color scheme
- Minimal design, dark mode as default theme
- Primary accent color: #7C3AED (purple-600 equivalent)
- User specified: "I want it to feel premium but not corporate. Think Vercel's site but with purple instead of white."
- Font: Inter for body text, system font stack fallback

### Password reset token expiry
- 1 hour expiry for password reset tokens
- User chose 1 hour over 24 hours: "I'd rather people request a new link than have a stale token sitting in their inbox for a day"

</decisions>

<specifics>
## Specific Ideas

- "I want it to feel premium but not corporate — like Vercel's site but with purple instead of white"
- Dark mode should be the default, with a toggle in the header for light mode
- The login page should be clean — centered card on a gradient background, no sidebar
- "Signup should ask for name, email, password only — nothing else. I hate long signup forms."

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing codebase

### Established Patterns
- None yet — this phase establishes the foundational patterns (route groups, auth middleware, component structure)

### Integration Points
- Prisma schema will be created in this phase (User model) and extended in Phase 2 (Product model) and Phase 3 (Cart model)
- NextAuth session provider wraps the app — all subsequent phases access session via `auth()` server-side or `useSession()` client-side
- Rate limiting middleware pattern established here will be reused for API routes in later phases

</code_context>

<deferred>
## Deferred Ideas

- OAuth login (Google, GitHub) — v2, after validating email/password adoption
- Two-factor authentication — v2, after user base grows
- Account deletion / GDPR data export — v2, legal requirement can wait for MVP
- Profile avatar upload — Phase 2 or later, not needed for auth

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-09*
