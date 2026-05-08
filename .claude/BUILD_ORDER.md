# JUNKTION — Build Order

Run `/check` (`npx tsc --noEmit && npm run lint`) after every phase.
Never start the next phase until the current phase passes with zero errors.

---

## Phase 0A — Scaffold + Netlify Config

```bash
npx create-next-app@latest junktion \
  --typescript --tailwind --app \
  --no-src-dir --import-alias "@/*"

npm install gsap @gsap/react lucide-react jose bcryptjs zod \
  drizzle-orm @neondatabase/serverless \
  cloudinary \
  @upstash/redis @upstash/ratelimit isomorphic-dompurify

npm install -D drizzle-kit @types/bcryptjs @types/isomorphic-dompurify
```

**Create `netlify.toml`:**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

```bash
npm install -D @netlify/plugin-nextjs
```

**Create `.env.local`** with all keys from `CONFIG.md`.

**Create `scripts/gen-keys.js`** (run once to generate RS256 keypair):
```javascript
const { generateKeyPairSync } = require('crypto')
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
console.log('PRIVATE:', Buffer.from(privateKey.export({ type: 'pkcs8', format: 'pem' })).toString('base64'))
console.log('PUBLIC:', Buffer.from(publicKey.export({ type: 'spki', format: 'pem' })).toString('base64'))
```
```bash
node scripts/gen-keys.js
# Copy output to .env.local
```

**Update `tailwind.config.ts`** with brand tokens from `DESIGN_SYSTEM.md`.
**Create `/app/styles/tokens.css`** — all CSS custom properties.
**Update `globals.css`** — import tokens, grain overlay, base reset.

### Verification
```bash
npm run dev    # runs on localhost:3000 with no errors
```

---

## Phase 0B — Database Schema + Drizzle

**Create `/app/db/schema.ts`** — full schema from `BACKEND.md`.
**Create `/app/db/index.ts`** — Neon + Drizzle client.
**Create `drizzle.config.ts`** — points to schema + DATABASE_URL.

```bash
npx drizzle-kit push:pg    # pushes schema to Neon dev database
```

**Create `scripts/seed.js`:**
- Creates one owner account: `admin@junktion.ng` / `JunktionAdmin2025!`
- Seeds all 18 menu items from `MENU_DATA.md` with placeholder Cloudinary URLs
- Seeds initial payment account: Junktion LTD / 5119991680 / Moniepoint (is_primary: true)

```bash
node scripts/seed.js    # run once after schema push
```

### Verification
```bash
npx tsc --noEmit
# Neon dashboard: confirm all 4 tables created with correct columns
# Confirm seed data visible in Neon table explorer
```

---

## Phase 0C — Auth System + Security Hardening

Read `AUTH_SYSTEM.md` and `SECURITY.md` fully before writing any file in this phase.

**Create `/app/lib/auth.ts`:**
- `signAccessToken(payload)` → 15min JWT (RS256)
- `signRefreshToken(payload)` → 7d JWT (RS256)
- `verifyToken(token)` → decoded payload or throws
- `hashPassword(plain)` → bcrypt hash, rounds 12
- `verifyPassword(plain, hash)` → boolean

**Create `/app/lib/rateLimit.ts`** (SECURITY Fix 2 + Fix 3):
- `loginLimiter` — 5 attempts / 15min per IP via Upstash
- `apiLimiter` — 30 req/min per IP
- `orderLimiter` — 10 req/min per IP
- `recordFailedLogin(email)` — increments lockout counter
- `isAccountLocked(email)` — checks if over threshold
- `clearLoginAttempts(email)` — clears on success
- `getClientIp(req)` — reads `x-forwarded-for`
- `applyRateLimit(limiter, id)` — returns 429 or null

**Create `/app/lib/sanitize.ts`** (SECURITY Fix 5):
- `sanitizeText(input)` — DOMPurify, ALLOWED_TAGS: [], strips all HTML

**Update `/app/lib/validators.ts`** (SECURITY Fix 5):
- Add `.transform(sanitizeText)` to every user-supplied string field in every schema

**Create `/app/lib/apiMiddleware.ts`** (SECURITY Fix 4 + Fix 6):
- `requireAuth(req, role?)` → AuthUser or NextResponse 401/403
- `checkBodySize(req)` → NextResponse 413 or null (50KB limit)
- `checkCsrf(req)` → NextResponse 403 or null (origin check)
- `isAuthError(result)` → type guard

**Update `/app/lib/utils.ts`** (SECURITY Fix 1 + Fix 7):
- `generateReference()` → uses `crypto.randomBytes(4)` not `Math.random()`
- `toPublicMenuItem(item)` → strips `cloudinaryPublicId`
- `toSafeUser(user)` → strips `passwordHash`

**Create `/app/api/auth/login/route.ts`** — with rate limit + lockout from SECURITY.md.
**Create `/app/api/auth/refresh/route.ts`** — POST handler.
**Create `/app/api/auth/logout/route.ts`** — POST handler (clears cookie).

**Update `middleware.ts`** (project root):
- Protects all `/admin/*` except `/admin/login`
- Reads `jnk_refresh` cookie → redirects if missing

**Update `netlify.toml`** (SECURITY Fix 8):
- Replace basic headers with full CSP + security headers suite from SECURITY.md

**Create `/app/context/AdminAuthContext.tsx`:**
- Stores accessToken in memory — never `localStorage`
- `authFetch()` auto-refreshes on 401

**Update `/app/db/schema.ts`** (SECURITY Fix 9):
- Add `mustChangePassword` boolean column to `users` table
- Re-run `npx drizzle-kit push:pg` after schema change

### Verification
```bash
npx tsc --noEmit && npm run lint
# Test: POST /api/auth/login with seed credentials → returns accessToken
# Test: POST /api/auth/refresh → returns new accessToken
# Test: GET /admin/orders (no cookie) → redirects to /admin/login
```

---

## Phase 1 — (site) layout.tsx + Nav

**Create `/app/(site)/layout.tsx`:**
- Load Syne (400,600,700,800) + DM Sans (400,500,600) via `next/font/google`
- Apply font CSS variables to `<html>`
- Wrap children in `<CartProvider>`
- Add grain overlay `<div>` (fixed, pointer-events-none, z-9999)
- Metadata: title, description, og tags from `COPY.md`

**Create `Nav.tsx`** — see `COMPONENTS.md` for full spec.

### Verification
```bash
npx tsc --noEmit && npm run lint
# Visual: Nav transparent on load, darkens after 80px scroll
```

---

## Phase 2 — Hero Section

**Create `Hero.tsx` + `Hero.module.css` + `OrbitRing.tsx`**
Full spec in `COMPONENTS.md` and `ANIMATIONS.md`.

- Orbit: pure CSS `@keyframes` — 3 food items on elliptical path
- Headline: GSAP stagger reveal on mount
- Scatter: GSAP ScrollTrigger on scroll past hero
- Source 3 Unsplash food images per `IMAGES.md`

### Verification
```bash
npx tsc --noEmit && npm run lint
# Visual: Orbit running, headline bottom-left, scatter on scroll
```

---

## Phase 3 — Marquee Strip

**Create `Marquee.tsx` + `Marquee.module.css`**
- Pure CSS infinite scroll
- `-1.5deg` rotation
- Orange background, dark text

### Verification
```bash
# Visual: Seamless loop, slight rotation, no gap
```

---

## Phase 4 — MenuWheel (Live Data)

**First: create `GET /api/menu/route.ts`**
```typescript
// Fetches: menuItems WHERE is_available = true ORDER BY display_order ASC
// Also fetches: paymentAccounts WHERE is_primary = true LIMIT 1
// Returns: { items: MenuItem[], primaryAccount: PaymentAccount | null }
```

**Create `MenuWheel.tsx` + `WheelItem.tsx` + `useWheelScroll.ts`**
Full spec in `COMPONENTS.md`. Arc position math in `DESIGN_SYSTEM.md`.

MenuWheel fetches from `/api/menu` on mount — no hardcoded data.
Items with `is_available: false` never appear (filtered server-side).

### Verification
```bash
npx tsc --noEmit && npm run lint
# Test: 5 items visible on arc, scroll advances, center CTA appears
# Test: infinite loop after 8 items
# Test: touch swipe works on mobile viewport
```

---

## Phase 5 — Cart State + Order Drawer

**Create `/app/context/CartContext.tsx`** — full implementation from `ORDER_FLOW.md`.
**Create `OrderDrawer.tsx` + `CartItem.tsx`** — specs in `COMPONENTS.md`.

### Verification
```bash
npx tsc --noEmit && npm run lint
# Test: Add item → drawer opens → qty controls → total updates
# Test: Delivery address input works
# Test: Place Order disabled when address empty
```

---

## Phase 6 — POST /api/orders + Modal + WhatsApp

**Create `POST /api/orders/route.ts`:**
```typescript
// 1. Validate with orderSchema (zod)
// 2. Fetch primary payment account from DB
// 3. Generate reference: 'JNK-' + random 6 chars
// 4. Insert order to DB
// 5. Return: { success, reference, total, paymentAccount }
```

**Create `OrderModal.tsx`** — spec in `COMPONENTS.md`.
Shows: item list, total, delivery address, bank details (from API response).
WhatsApp message includes order reference.

**Update WhatsApp message** to include reference:
```
*Order Ref:* JNK-A3F9KL
```

### Verification
```bash
npx tsc --noEmit && npm run lint
# Test: Full order flow → reference returned → modal shows bank details
# Test: WhatsApp link opens correct pre-drafted message with reference
# Test: Cart clears after send
# Test: Order visible in Neon DB
```

---

## Phase 7 — Order Tracking Page

**Create `GET /api/orders/track/[reference]/route.ts`:**
```typescript
// Fetch order WHERE reference = param
// Return: { reference, status, items, total, deliveryAddress, createdAt, updatedAt }
// 404 if not found
```

**Create `/app/(site)/track/[reference]/page.tsx`:**
- Status display: large status badge (Syne 700, orange when active)
- Status timeline: 5 steps (pending → confirmed → preparing → ready → delivered)
  Active step glows orange, past steps muted, future steps very muted
- Order summary below timeline (items + total)
- Page auto-refreshes every 30 seconds (client-side `setInterval`)
- No card borders — everything on dark surface

### Verification
```bash
# Test: /track/JNK-XXXXXX shows correct order
# Test: Status updates in admin reflect here within 30s
# Test: Invalid reference shows 404 message (not error page)
```

---

## Phase 8 — Story + Contact + Footer

**Create `Story.tsx`, `Contact.tsx`, `Footer.tsx`**
Full specs in `COMPONENTS.md` and `ANIMATIONS.md`.

### Verification
```bash
npx tsc --noEmit && npm run lint
npm run build    # full build check before moving to admin
```

---

## Phase 9 — Admin Login + Shell Layout

**Create `/app/admin/login/page.tsx`:**
- Full-screen dark page — `#0D0D0D` background
- Junktion wordmark centered top
- Email + password inputs (underline only, no box)
- "Sign In" button — orange, Syne 700
- Error state: shake animation + red message below button
- On success: stores accessToken in AdminAuthContext → redirects to `/admin/orders`

**Create `/app/admin/layout.tsx`:**
- Auth gate: if no accessToken → redirect to `/admin/login`
- Sidebar navigation (left, 240px):
  - Logo top
  - Links: Orders · Menu · Accounts · Analytics · Staff
  - Staff link: visible to owner only
  - Bottom: user name + role badge + logout button
- Main content area: right of sidebar
- Admin color scheme: `#0A0A0A` base, `#141414` sidebar, orange accents
- Typography: Syne for labels, DM Sans for data — consistent with main site

### Verification
```bash
# Test: /admin → redirects to /admin/login (no cookie)
# Test: Login with seed credentials → lands on /admin/orders
# Test: Sidebar shows/hides Staff link based on role
# Test: Logout clears session → back to /admin/login
```

---

## Phase 10 — Admin Orders Page

**Create `/app/admin/orders/page.tsx`:**

Top strip (summary bar):
- Today's order count · Today's revenue · Pending count
- Fetches from `GET /api/admin/orders/summary`
- Auto-refreshes every 60 seconds

Order list:
- Table layout: Reference · Items summary · Total · Address · Status · Time · Action
- Filter tabs: All · Pending · Confirmed · Preparing · Ready · Delivered
- Status badge: color-coded (pending=amber, confirmed=blue, preparing=orange, ready=green, delivered=muted)
- Action: dropdown to update status (valid next statuses only — no jumping from pending to delivered)
- Fetches from `GET /api/admin/orders?status=X`

**Create `GET /api/admin/orders/route.ts`**
**Create `PATCH /api/admin/orders/[id]/status/route.ts`**
**Create `GET /api/admin/orders/summary/route.ts`**

Status transition validation (server-side):
```typescript
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['preparing', 'cancelled'],
  preparing:  ['ready'],
  ready:      ['delivered'],
  delivered:  [],
  cancelled:  [],
}
```

### Verification
```bash
# Test: Orders placed on frontend appear here
# Test: Status update reflects on tracking page
# Test: Cashier can update status (200)
# Test: Cashier cannot access /admin/menu (redirect or 403)
```

---

## Phase 11 — Admin Menu Management + Cloudinary

**Create `/app/admin/menu/page.tsx`:**
- Item list: image circle · name · category · price · available toggle · featured toggle · edit · delete
- "Add Item" button → `/admin/menu/new`
- Drag-to-reorder: updates `displayOrder` via PUT `/api/admin/menu/reorder`

**Create `/app/admin/menu/new/page.tsx`** and **`/admin/menu/[id]/edit/page.tsx`**:
Form fields:
- Name, description (textarea), price (₦ input), category (select)
- Availability toggle, featured toggle
- Image upload: Cloudinary unsigned upload widget
  1. User picks file
  2. Browser calls `POST /api/admin/upload/sign` → gets signature
  3. Browser uploads directly to Cloudinary with signature
  4. Cloudinary returns `secure_url` + `public_id`
  5. These are stored in form state, submitted with the rest of the form

**Create all menu admin API routes** per `BACKEND.md`.

On item delete:
1. Delete from DB
2. Call `DELETE /api/admin/upload/[publicId]` → removes from Cloudinary

### Verification
```bash
# Test: Upload image → appears in Cloudinary dashboard
# Test: New item appears in /api/menu (public)
# Test: Toggle availability → item disappears from public menu
# Test: Delete item → removed from Cloudinary + DB
```

---

## Phase 12 — Admin Payment Accounts

**Create `/app/admin/accounts/page.tsx`:**
- List all accounts: name · number · bank · primary badge · active toggle · edit · delete
- "Add Account" form inline (slide down, no modal)
- Set Primary button: confirms with inline prompt before switching
- Cannot delete primary account (button disabled with tooltip)
- Cannot delete last active account

**Create all accounts API routes** per `BACKEND.md`.

### Verification
```bash
# Test: Add account → appears in list
# Test: Set primary → old primary loses badge, new one gets it
# Test: Primary account appears in /api/menu response
# Test: Primary account shown in order modal on frontend
```

---

## Phase 13 — Admin User Management (Owner Only)

**Create `/app/admin/users/page.tsx`:**
- Visible only to owner (redirect cashier to /admin/orders)
- List: name · email · role · status · last login · deactivate toggle
- "Add Staff" form: name, email, password, role (cashier only — no owner creation via UI)
- Deactivated users cannot log in (check `is_active` in login route)

**Create all user admin API routes** per `BACKEND.md`.

### Verification
```bash
# Test: Cashier visiting /admin/users → redirected
# Test: Create cashier account → can log in
# Test: Deactivate cashier → login returns 401
```

---

## Phase 14 — Admin Analytics (Owner Only)

**Create `/app/admin/analytics/page.tsx`:**

Layout (no cards — data sits on dark surfaces):
- Range selector: 7 days · 30 days · 90 days (tabs, top right)
- Summary row: Total Revenue · Total Orders · Avg Order Value
  (3 stats, unequal widths, Syne 800 numbers in orange)
- Revenue chart: line chart, daily revenue over selected range
  Use `recharts` (`npm install recharts`) — dark themed, orange line
- Top Items table: item name · units sold · total revenue
  Ranked list, no equal columns

**Create `GET /api/admin/analytics/route.ts`:**
```typescript
// Query: orders WHERE created_at >= rangeStart
// AND status NOT IN ('cancelled')
// Compute:
//   dailyRevenue: group by DATE(created_at), sum(total), count(*)
//   topItems: unnest items jsonb, group by name, sum qty + sum revenue
//   totals: sum all revenue, count orders, avg order value
// Convert all kobo values to Naira before returning
```

### Verification
```bash
# Test: Analytics shows correct totals matching orders page
# Test: Range selector changes data
# Test: Cashier visiting /admin/analytics → redirected
```

---

## Phase 15 — Polish Pass

### Security Final Check (from SECURITY.md)
- [ ] Fix 1: `crypto.randomBytes` used in `generateReference()` — not `Math.random()`
- [ ] Fix 2: Upstash rate limiting active on `/api/auth/login` and `/api/orders`
- [ ] Fix 3: Account lockout tested — 5 failures → 429 for 15min
- [ ] Fix 4: `checkBodySize()` called in every POST/PUT route
- [ ] Fix 5: `sanitizeText()` applied to all user-supplied strings via Zod `.transform()`
- [ ] Fix 6: `checkCsrf()` on all admin mutation routes in production
- [ ] Fix 7: `toPublicMenuItem()` used in `GET /api/menu` — no `cloudinaryPublicId` in response
- [ ] Fix 8: Full CSP headers visible in Netlify deploy headers tab
- [ ] Fix 9: Seed account has `mustChangePassword: true` — change-password page works
- [ ] Fix 10: Cloudinary `public_id` regex validated before delete call

### Tasks
- [ ] Grain overlay: verify renders across all sections
- [ ] GSAP: `ScrollTrigger.refresh()` on window resize
- [ ] Mobile (375px, 390px, 430px):
  - Nav hamburger + overlay
  - Hero: orbit shrinks to 260px, headline scales
  - MenuWheel: touch swipe, mobile arc offsets
  - OrderDrawer: full-width, scrollable
  - Story: stacks vertically
  - Contact: map 300px height
  - Admin: sidebar collapses to bottom tab bar on mobile
- [ ] Accessibility: `aria-label` on all interactive elements, AA contrast
- [ ] API error states: all admin pages handle fetch errors gracefully
- [ ] Loading states: skeleton loaders on admin tables (not spinners)
- [ ] Final build:
```bash
npm run build
# 0 errors, 0 warnings
npx tsc --noEmit
```

### Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Link to Netlify project (first time)
netlify init

# Add env vars to Netlify
netlify env:set DATABASE_URL "..."
netlify env:set JWT_PRIVATE_KEY "..."
# ... all vars from CONFIG.md

# Deploy
netlify deploy --prod
```
