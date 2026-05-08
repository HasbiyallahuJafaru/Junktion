# JUNKTION — Claude Code Master Instructions

## Project Identity
Restaurant website for **Junktion** — premium street food, Kaduna, Nigeria.
Tagline: "Eat. Different." — Primary action: Order online → WhatsApp confirmation.

---

## Deployment: Single Netlify Project (Non-Negotiable)

One Next.js 14 App Router project. Everything on Netlify. Nothing else.

```
/app/(site)/     ← public website
/app/admin/      ← admin dashboard (protected)
/app/api/        ← API routes → Netlify Functions (automatic)
/app/db/         ← Drizzle ORM + Neon serverless
```

**Never suggest:** separate Express server, Render, Railway, Docker,
NestJS, or any deployment outside this single Next.js project.

Netlify Function timeout: 10s free / 26s pro. Keep all API routes under 8s.

---

## Non-Negotiable Frontend Rules

1. No cards — no `rounded-xl bg-* p-*` panel patterns anywhere
2. No symmetry — every section breaks the grid intentionally
3. No Inter, Roboto, Arial — Syne + DM Sans only
4. No equal-column grids — asymmetric layouts only
5. No inline style sprawl — CSS Modules for animation scenes, Tailwind for layout
6. No Lorem ipsum — use copy from `COPY.md`

---

## Non-Negotiable Security Rules

Read `SECURITY.md` in full before writing any API route. Every fix is mandatory.

1. **Rate limit all auth routes** — `loginLimiter` from `@upstash/ratelimit` on every login attempt
2. **Account lockout** — lock after 5 failed attempts per email, 15min cooldown via Upstash Redis
3. **Cryptographic references** — `crypto.randomBytes(4)` for order references, never `Math.random()`
4. **Body size guard** — `checkBodySize(req)` at top of every route that accepts a body
5. **Sanitize all user text** — `sanitizeText()` via DOMPurify on every string stored in DB
6. **CSRF check** — `checkCsrf(req)` on all admin POST/PUT/PATCH/DELETE routes
7. **Strip sensitive fields** — `cloudinaryPublicId`, `passwordHash` never in public API responses
8. **mustChangePassword** — seed account must change password on first login
9. **CSP headers** — full Content-Security-Policy in `netlify.toml` as specified in `SECURITY.md`
10. **public_id validation** — regex check before any Cloudinary delete operation

---

## Non-Negotiable Backend Rules

1. **Neon serverless only** — `@neondatabase/serverless` + `drizzle-orm/neon-http`
   Never use `pg`, `postgres`, or any pooling library (breaks in Netlify Functions)
2. **Zod on every route** — validate ALL inputs before any DB call. No exceptions.
3. **Prices in kobo** — ₦3,900 stored as `390000`. Naira only at display layer.
4. **Secrets never reach browser** — `DATABASE_URL`, `JWT_PRIVATE_KEY`,
   `CLOUDINARY_API_SECRET` stay server-side only
5. **JWT RS256 via `jose`** — access token 15min, refresh token 7d httpOnly cookie
6. **bcrypt rounds: 12** — all password hashing
7. **Atomic transactions** — multi-row operations use Drizzle transactions
8. **Role check after JWT verify** — owner-only routes return 403 for cashiers

---

## Code Standards

- Next.js 14 App Router — `/app` directory, no `/src`
- Tailwind CSS + CSS Modules for 3D/animation scenes
- GSAP + ScrollTrigger for scroll animation; CSS `@keyframes` for loops
- `next/font/google` — Syne + DM Sans
- `next/image` always — never raw `<img>`
- `lucide-react` for all icons
- Max 300 lines per file — split to subcomponents when exceeded
- JSDoc on every component and every non-obvious function
- Named exports for components, default export for pages
- Every API route: try/catch, returns `{ error: string }` on failure

---

## Required Environment Variables

```bash
# Database
DATABASE_URL=                      # Neon connection string

# Auth (RS256 key pair — generate with: node scripts/gen-keys.js)
JWT_PRIVATE_KEY=                   # PEM format, base64 encoded
JWT_PUBLIC_KEY=                    # PEM format, base64 encoded

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME= # safe to expose — used in upload widget
```

Set in `.env.local` for dev. Add to Netlify Environment Variables for production.

---

## Project File Structure

```
/app
  /(site)/
    layout.tsx              ← fonts, grain, CartProvider, metadata
    page.tsx                ← all section components
    /track/[reference]/
      page.tsx              ← customer order status page
    /components/
      nav/    hero/    marquee/
      menu/   order/   story/
      contact/  footer/
  /admin/
    layout.tsx              ← admin shell + auth gate
    /login/page.tsx
    /orders/page.tsx
    /menu/page.tsx
    /menu/new/page.tsx
    /menu/[id]/edit/page.tsx
    /accounts/page.tsx
    /users/page.tsx
    /analytics/page.tsx
  /api/
    /auth/login/route.ts
    /auth/refresh/route.ts
    /auth/logout/route.ts
    /menu/route.ts                    ← GET public
    /menu/[id]/route.ts               ← GET public
    /orders/route.ts                  ← POST public
    /orders/track/[reference]/route.ts ← GET public
    /admin/menu/route.ts              ← POST owner
    /admin/menu/[id]/route.ts         ← PUT DELETE owner
    /admin/menu/[id]/toggle/route.ts  ← PATCH owner
    /admin/menu/[id]/feature/route.ts ← PATCH owner
    /admin/menu/reorder/route.ts      ← PUT owner
    /admin/upload/sign/route.ts       ← POST owner
    /admin/upload/[publicId]/route.ts ← DELETE owner
    /admin/accounts/route.ts          ← GET POST owner
    /admin/accounts/[id]/route.ts     ← PUT DELETE owner
    /admin/accounts/[id]/primary/route.ts ← PATCH owner
    /admin/orders/route.ts            ← GET cashier+owner
    /admin/orders/[id]/status/route.ts ← PATCH cashier+owner
    /admin/orders/summary/route.ts    ← GET cashier+owner
    /admin/analytics/route.ts         ← GET owner
    /admin/users/route.ts             ← GET POST owner
    /admin/users/[id]/toggle/route.ts ← PATCH owner
  /db/
    index.ts                ← Neon + Drizzle client
    schema.ts               ← all table definitions + enums
  /lib/
    auth.ts                 ← JWT sign/verify, token helpers
    validators.ts           ← all Zod schemas
    cloudinary.ts           ← server-side Cloudinary helpers
    apiMiddleware.ts        ← JWT extraction + role enforcement
    utils.ts                ← formatPrice, generateReference, koboToNaira
  /context/
    CartContext.tsx          ← client cart state
    AdminAuthContext.tsx     ← admin JWT in memory
  /hooks/
    useCart.ts
    useAdminAuth.ts
    useScrollTrigger.ts
  /styles/
    globals.css
    tokens.css
  /data/
    config.ts               ← non-secret: address, phone, social
/drizzle/                   ← generated migrations
/scripts/
  gen-keys.js               ← RS256 keypair generator
  seed.js                   ← seed owner account + initial menu
drizzle.config.ts
netlify.toml
middleware.ts               ← Next.js edge middleware, protects /admin/*
```

---

## Build Order

```
Phase 0A → Scaffold + Netlify config + env setup
Phase 0B → DB schema + Drizzle + seed script
Phase 0C → Auth system (JWT helpers + login API + middleware)
Phase 1  → (site) layout + Nav
Phase 2  → Hero
Phase 3  → Marquee
Phase 4  → MenuWheel (live from /api/menu)
Phase 5  → Cart state + OrderDrawer
Phase 6  → POST /api/orders + OrderModal + WhatsApp
Phase 7  → /track/[reference] page
Phase 8  → Story + Contact + Footer
Phase 9  → Admin login + shell layout
Phase 10 → Admin orders page
Phase 11 → Admin menu management + Cloudinary upload
Phase 12 → Admin payment accounts
Phase 13 → Admin user management
Phase 14 → Admin analytics
Phase 15 → Polish: mobile, grain, scroll triggers, build check
```

Full phase details in `BUILD_ORDER.md`.
