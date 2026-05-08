# JUNKTION — Security Hardening

All fixes in this file are **mandatory before production deployment**.
Apply during Phase 0C (auth setup) and Phase 15 (polish pass).

---

## Dependencies to Install

```bash
npm install @upstash/redis @upstash/ratelimit isomorphic-dompurify
npm install -D @types/isomorphic-dompurify
```

Add to `.env.local` and Netlify environment variables:
```bash
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

Get free Upstash Redis at upstash.com — no separate server, HTTP-based, works in Netlify Functions.

---

## Fix 1 — Cryptographically Secure Order Reference

**Problem**: `Math.random()` is not cryptographically random. References are guessable.

**Replace in `/app/lib/utils.ts`:**

```typescript
// REMOVE this:
export const generateReference = () =>
  'JNK-' + Math.random().toString(36).toUpperCase().slice(2, 8)

// REPLACE with:
import { randomBytes } from 'crypto'

export const generateReference = (): string => {
  const bytes = randomBytes(4)             // 4 bytes = 32 bits of entropy
  const hex   = bytes.toString('hex').toUpperCase()
  return `JNK-${hex}`                      // e.g. JNK-3FA9C2B1
}
```

---

## Fix 2 — Rate Limiting on Auth Routes

**Problem**: No limit on login attempts — brute force possible.

**Create `/app/lib/rateLimit.ts`:**

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis }     from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

/** 5 attempts per 15 minutes per IP — for login route */
export const loginLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  prefix:  'jnk:login',
})

/** 30 requests per minute per IP — for public API routes */
export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'),
  prefix:  'jnk:api',
})

/** 10 requests per minute per IP — for order creation */
export const orderLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  prefix:  'jnk:order',
})

/** Extract real IP from Netlify/Vercel headers */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  )
}

/** Apply rate limit. Returns error response if exceeded, null if OK. */
export async function applyRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<NextResponse | null> {
  const { success, limit, remaining, reset } = await limiter.limit(identifier)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit':     String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset':     String(reset),
          'Retry-After':           String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    )
  }
  return null
}
```

**Apply in `/app/api/auth/login/route.ts`** — add before any DB call:

```typescript
import { loginLimiter, getClientIp, applyRateLimit } from '@/app/lib/rateLimit'

export async function POST(req: NextRequest) {
  // Rate limit check — FIRST thing, before parsing body
  const ip      = getClientIp(req)
  const limited = await applyRateLimit(loginLimiter, ip)
  if (limited) return limited

  // ... rest of login handler unchanged
}
```

**Apply in `/app/api/orders/route.ts`:**

```typescript
import { orderLimiter, getClientIp, applyRateLimit } from '@/app/lib/rateLimit'

export async function POST(req: NextRequest) {
  const ip      = getClientIp(req)
  const limited = await applyRateLimit(orderLimiter, ip)
  if (limited) return limited

  // ... rest of order handler
}
```

---

## Fix 3 — Account Lockout After Failed Logins

**Problem**: No lockout — attacker can try unlimited passwords slowly to bypass rate limit reset.

**Add to `/app/lib/rateLimit.ts`:**

```typescript
const LOCKOUT_PREFIX  = 'jnk:lockout'
const MAX_FAILURES    = 5
const LOCKOUT_SECONDS = 15 * 60    // 15 minutes

/** Record a failed login attempt. Returns true if account should be locked. */
export async function recordFailedLogin(email: string): Promise<boolean> {
  const key     = `${LOCKOUT_PREFIX}:${email}`
  const current = await redis.incr(key)
  if (current === 1) {
    await redis.expire(key, LOCKOUT_SECONDS)
  }
  return current >= MAX_FAILURES
}

/** Check if account is locked. */
export async function isAccountLocked(email: string): Promise<boolean> {
  const key   = `${LOCKOUT_PREFIX}:${email}`
  const count = await redis.get<number>(key)
  return (count ?? 0) >= MAX_FAILURES
}

/** Clear lockout on successful login. */
export async function clearLoginAttempts(email: string): Promise<void> {
  await redis.del(`${LOCKOUT_PREFIX}:${email}`)
}
```

**Update `/app/api/auth/login/route.ts`:**

```typescript
import {
  loginLimiter, getClientIp, applyRateLimit,
  isAccountLocked, recordFailedLogin, clearLoginAttempts
} from '@/app/lib/rateLimit'

export async function POST(req: NextRequest) {
  // 1. IP rate limit
  const ip      = getClientIp(req)
  const limited = await applyRateLimit(loginLimiter, ip)
  if (limited) return limited

  // 2. Parse + validate
  let body: unknown
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  // 3. Account lockout check
  const locked = await isAccountLocked(parsed.data.email)
  if (locked)
    return NextResponse.json(
      { error: 'Account temporarily locked. Try again in 15 minutes.' },
      { status: 429 }
    )

  try {
    const [user] = await db.select().from(users)
      .where(eq(users.email, parsed.data.email)).limit(1)

    // Always run password check (prevents timing-based user enumeration)
    const DUMMY_HASH = '$2b$12$invalidhashpaddingtomaketiminguniform000000000000000000'
    const hash       = user?.passwordHash ?? DUMMY_HASH
    const valid      = await verifyPassword(parsed.data.password, hash)

    if (!user || !user.isActive || !valid) {
      if (user) await recordFailedLogin(parsed.data.email)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Success — clear lockout, issue tokens
    await clearLoginAttempts(parsed.data.email)

    const payload      = { sub: user.id, email: user.email, role: user.role }
    const accessToken  = await signAccessToken(payload)
    const refreshToken = await signRefreshToken(payload)
    setRefreshCookie(refreshToken)

    return NextResponse.json({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    console.error('[POST /api/auth/login]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

---

## Fix 4 — Request Body Size Limit

**Problem**: No size cap on API route bodies — large payloads can exhaust Netlify Function memory.

**Add to every API route that accepts a body** — paste at top of handler before `req.json()`:

```typescript
// Body size guard — reject payloads over 50KB
const contentLength = req.headers.get('content-length')
if (contentLength && parseInt(contentLength) > 51200) {
  return NextResponse.json({ error: 'Request too large' }, { status: 413 })
}
```

**Create a reusable helper in `/app/lib/apiMiddleware.ts`:**

```typescript
const MAX_BODY_BYTES = 51_200   // 50KB

export function checkBodySize(req: NextRequest): NextResponse | null {
  const length = req.headers.get('content-length')
  if (length && parseInt(length) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })
  }
  return null
}
```

Usage in any route:
```typescript
const sizeError = checkBodySize(req)
if (sizeError) return sizeError
```

---

## Fix 5 — Input Sanitization (XSS Prevention)

**Problem**: Text stored in DB (item descriptions, delivery addresses, user names) could contain
malicious HTML/script tags that render in admin dashboard.

**Create `/app/lib/sanitize.ts`:**

```typescript
import DOMPurify from 'isomorphic-dompurify'

/**
 * Strip all HTML tags and dangerous content from user-supplied strings.
 * Apply to any text that will be stored in the DB and later rendered.
 */
export function sanitizeText(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS:  [],       // strip ALL HTML — plain text only
    ALLOWED_ATTR:  [],
  }).trim()
}
```

**Apply in these validators** — update `/app/lib/validators.ts`:

```typescript
import { sanitizeText } from './sanitize'

// Add .transform(sanitizeText) to every user-supplied string field:
export const menuItemSchema = z.object({
  name:        z.string().min(2).max(100).transform(sanitizeText),
  description: z.string().min(5).max(300).transform(sanitizeText),
  // ... rest unchanged
})

export const orderSchema = z.object({
  items: z.array(z.object({
    name:     z.string().transform(sanitizeText),
    // ... rest unchanged
  })),
  deliveryAddress: z.string().min(5).max(500).transform(sanitizeText),
  customerPhone:   z.string().optional().transform((v) => v ? sanitizeText(v) : v),
})

export const createUserSchema = z.object({
  name:  z.string().min(2).max(100).transform(sanitizeText),
  email: z.string().email(),
  // password never sanitized — just validated as string
  password: z.string().min(8).max(100),
  role:     z.literal('cashier'),
})

export const paymentAccountSchema = z.object({
  accountName:   z.string().min(2).max(100).transform(sanitizeText),
  accountNumber: z.string().min(6).max(20).transform(sanitizeText),
  bankName:      z.string().min(2).max(100).transform(sanitizeText),
})
```

---

## Fix 6 — CSRF Protection on State-Changing Routes

**Problem**: A malicious site could trigger POST/PATCH/DELETE requests from a logged-in admin's browser.

**Strategy**: Double-submit cookie pattern — simple, stateless, works in Netlify Functions.

**Add to `/app/lib/apiMiddleware.ts`:**

```typescript
/**
 * CSRF check for state-changing admin routes.
 * Verifies that the Origin/Referer header matches our domain.
 * Add to all POST/PUT/PATCH/DELETE admin routes.
 */
export function checkCsrf(req: NextRequest): NextResponse | null {
  const origin  = req.headers.get('origin')
  const referer = req.headers.get('referer')
  const host    = req.headers.get('host')

  // Skip CSRF check in development
  if (process.env.NODE_ENV === 'development') return null

  const allowed = [
    `https://${host}`,
    process.env.NEXT_PUBLIC_SITE_URL,
  ].filter(Boolean)

  const source = origin || referer
  if (!source || !allowed.some((a) => source.startsWith(a!))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}
```

**Add to `.env.local`:**
```bash
NEXT_PUBLIC_SITE_URL=https://junktion.netlify.app
```

**Apply to all admin mutation routes** — add after `requireAuth`:
```typescript
const csrfError = checkCsrf(req)
if (csrfError) return csrfError
```

Routes that need this: all `POST`, `PUT`, `PATCH`, `DELETE` under `/app/api/admin/`

---

## Fix 7 — Strip Sensitive Fields from API Responses

**Problem**: `cloudinaryPublicId`, `passwordHash`, `paymentAccountId` should never leave the server in public responses.

**Add to `/app/lib/utils.ts`:**

```typescript
/** Strip server-only fields before sending menu items to public API */
export function toPublicMenuItem(item: typeof menuItems.$inferSelect) {
  const { cloudinaryPublicId, ...rest } = item
  return rest
}

/** Strip password hash before sending user data anywhere */
export function toSafeUser(user: typeof users.$inferSelect) {
  const { passwordHash, ...rest } = user
  return rest
}
```

**Apply in `GET /api/menu/route.ts`:**
```typescript
const publicItems = items.map(toPublicMenuItem)
return NextResponse.json({ items: publicItems, primaryAccount })
```

---

## Fix 8 — Security Headers (CSP + Full Suite)

**Update `netlify.toml`** — replace the basic headers block with:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=(), payment=()"
    X-XSS-Protection = "1; mode=block"
    Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"
    Content-Security-Policy = """
      default-src 'self';
      script-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: https://res.cloudinary.com https://images.unsplash.com;
      connect-src 'self' https://api.cloudinary.com https://*.upstash.io https://*.neon.tech;
      frame-src https://www.google.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
    """

[[headers]]
  for = "/admin/*"
  [headers.values]
    Cache-Control = "no-store, no-cache, must-revalidate"
    X-Robots-Tag = "noindex, nofollow"

[[headers]]
  for = "/api/*"
  [headers.values]
    Cache-Control = "no-store"
```

---

## Fix 9 — mustChangePassword Flag (Seed Account)

**Problem**: Seed password `JunktionAdmin2025!` stays forever if owner forgets to change it.

**Add column to users schema in `/app/db/schema.ts`:**

```typescript
export const users = pgTable('users', {
  // ... existing fields
  mustChangePassword: boolean('must_change_password').notNull().default(false),
})
```

**Update seed script** to set flag on the owner account:
```javascript
await sql`
  INSERT INTO users (email, password_hash, name, role, must_change_password)
  VALUES ('admin@junktion.ng', ${hash}, 'Junktion Admin', 'owner', true)
  ON CONFLICT (email) DO NOTHING
`
```

**Add to `signAccessToken` payload and check in admin layout:**
```typescript
// In admin layout — check after auth restore:
if (user.mustChangePassword) {
  redirect('/admin/change-password')
}
```

**Create `/admin/change-password` page** — simple form:
- Current password + new password + confirm
- On success: `PATCH /api/admin/users/me/password` → sets `mustChangePassword: false`

---

## Fix 10 — Cloudinary public_id URL Safety

**Problem**: `DELETE /api/admin/upload/[publicId]` uses a URL param that could contain path traversal if not validated.

**Update the route:**
```typescript
// Validate public_id format before passing to Cloudinary
const publicId = decodeURIComponent(params.publicId)

// Only allow: alphanumeric, hyphens, underscores, forward slashes (for folder paths)
if (!/^[\w\-\/]+$/.test(publicId)) {
  return NextResponse.json({ error: 'Invalid public ID' }, { status: 400 })
}
```

---

## Security Checklist (Run Before Production)

```
[ ] Fix 1:  crypto.randomBytes reference generation
[ ] Fix 2:  Upstash rate limiting on login + order routes
[ ] Fix 3:  Account lockout after 5 failed attempts
[ ] Fix 4:  Body size check on all POST/PUT routes
[ ] Fix 5:  DOMPurify sanitization on all user text inputs
[ ] Fix 6:  CSRF origin check on all admin mutation routes
[ ] Fix 7:  Sensitive fields stripped from public responses
[ ] Fix 8:  Full CSP + security headers in netlify.toml
[ ] Fix 9:  mustChangePassword on seed account
[ ] Fix 10: public_id path validation on Cloudinary delete

Additional before launch:
[ ] Change seed password immediately after first login
[ ] Rotate JWT keypair — never commit gen-keys.js output to git
[ ] Set Neon database to reject connections except from Netlify IPs
[ ] Enable Cloudinary "Allowed fetch domains" whitelist in dashboard
[ ] Add NEXT_PUBLIC_SITE_URL to Netlify env vars
[ ] Add UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN to Netlify env vars
```
