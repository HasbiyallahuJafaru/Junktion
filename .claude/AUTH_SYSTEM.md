# JUNKTION — Auth System

## Overview

- **Algorithm**: RS256 (asymmetric) — private key signs, public key verifies
- **Library**: `jose` (works in Next.js edge + Node.js — no native crypto issues)
- **Access token**: 15 minutes, stored in memory (AdminAuthContext)
- **Refresh token**: 7 days, stored in httpOnly cookie (cannot be read by JS)
- **Password hashing**: bcryptjs, 12 rounds
- **Route protection**: Next.js `middleware.ts` (edge) + `apiMiddleware.ts` (per-route)

---

## Key Generation — `scripts/gen-keys.js`

Run once. Copy output to `.env.local` and Netlify environment variables.

```javascript
const { generateKeyPairSync } = require('crypto')

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding:  { type: 'spki',  format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
})

// Base64 encode for safe storage in env vars
console.log('JWT_PRIVATE_KEY=' + Buffer.from(privateKey).toString('base64'))
console.log('JWT_PUBLIC_KEY='  + Buffer.from(publicKey).toString('base64'))
```

```bash
node scripts/gen-keys.js >> .env.local
```

---

## Auth Helpers — `/app/lib/auth.ts`

```typescript
import { SignJWT, jwtVerify, importPKCS8, importSPKI } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const ALGORITHM = 'RS256'
const ACCESS_TTL  = '15m'
const REFRESH_TTL = '7d'
const REFRESH_COOKIE = 'jnk_refresh'

interface TokenPayload {
  sub: string           // user ID
  email: string
  role: 'owner' | 'cashier'
}

/** Decode PEM from base64 env var */
function getPrivateKey() {
  const pem = Buffer.from(process.env.JWT_PRIVATE_KEY!, 'base64').toString('utf8')
  return importPKCS8(pem, ALGORITHM)
}

function getPublicKey() {
  const pem = Buffer.from(process.env.JWT_PUBLIC_KEY!, 'base64').toString('utf8')
  return importSPKI(pem, ALGORITHM)
}

/** Sign a short-lived access token */
export async function signAccessToken(payload: TokenPayload): Promise<string> {
  const key = await getPrivateKey()
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(key)
}

/** Sign a long-lived refresh token */
export async function signRefreshToken(payload: TokenPayload): Promise<string> {
  const key = await getPrivateKey()
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TTL)
    .sign(key)
}

/** Verify any token — throws on invalid/expired */
export async function verifyToken(token: string): Promise<TokenPayload> {
  const key = await getPublicKey()
  const { payload } = await jwtVerify(token, key)
  return payload as unknown as TokenPayload
}

/** Hash password with bcrypt */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}

/** Verify password against hash */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

/** Set refresh token as httpOnly cookie */
export function setRefreshCookie(token: string): void {
  cookies().set(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 24 * 7,   // 7 days in seconds
    path:     '/',
  })
}

/** Get refresh token from cookie */
export function getRefreshCookie(): string | undefined {
  return cookies().get(REFRESH_COOKIE)?.value
}

/** Clear refresh token cookie */
export function clearRefreshCookie(): void {
  cookies().set(REFRESH_COOKIE, '', { maxAge: 0, path: '/' })
}
```

---

## Login Route — `/app/api/auth/login/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/db'
import { users } from '@/app/db/schema'
import { eq } from 'drizzle-orm'
import { loginSchema } from '@/app/lib/validators'
import {
  verifyPassword, signAccessToken, signRefreshToken, setRefreshCookie
} from '@/app/lib/auth'

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 422 })

  try {
    const [user] = await db.select().from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1)

    if (!user || !user.isActive)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const valid = await verifyPassword(parsed.data.password, user.passwordHash)
    if (!valid)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const payload = { sub: user.id, email: user.email, role: user.role }
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

## Refresh Route — `/app/api/auth/refresh/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/app/db'
import { users } from '@/app/db/schema'
import { eq } from 'drizzle-orm'
import { verifyToken, signAccessToken, getRefreshCookie } from '@/app/lib/auth'

export async function POST() {
  const token = getRefreshCookie()
  if (!token)
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 })

  try {
    const payload = await verifyToken(token)

    // Confirm user still active in DB
    const [user] = await db.select().from(users)
      .where(eq(users.id, payload.sub))
      .limit(1)

    if (!user || !user.isActive)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const accessToken = await signAccessToken({
      sub: user.id, email: user.email, role: user.role
    })

    return NextResponse.json({ accessToken })
  } catch {
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
  }
}
```

---

## Logout Route — `/app/api/auth/logout/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { clearRefreshCookie } from '@/app/lib/auth'

export async function POST() {
  clearRefreshCookie()
  return NextResponse.json({ success: true })
}
```

---

## Next.js Middleware — `middleware.ts` (project root)

Runs at the edge — protects all `/admin/*` routes.
Does NOT verify JWT (edge doesn't have crypto for RS256 easily).
Just checks if refresh cookie exists. Full verification happens per-route.

```typescript
import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only protect admin routes (not login page)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const refreshToken = req.cookies.get('jnk_refresh')
    if (!refreshToken) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

---

## Admin Auth Context — `/app/context/AdminAuthContext.tsx`

```typescript
'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface AdminUser { id: string; name: string; email: string; role: 'owner' | 'cashier' }

interface AdminAuthContextType {
  user: AdminUser | null
  accessToken: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  /** Use this for all admin API calls */
  authFetch: (url: string, options?: RequestInit) => Promise<Response>
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // On mount: try to restore session from refresh cookie
  useEffect(() => {
    async function restore() {
      try {
        const res = await fetch('/api/auth/refresh', { method: 'POST' })
        if (res.ok) {
          const data = await res.json()
          setAccessToken(data.accessToken)
          // Decode user from token payload (no sensitive data needed)
          const payload = JSON.parse(atob(data.accessToken.split('.')[1]))
          setUser({ id: payload.sub, email: payload.email, role: payload.role, name: '' })
        }
      } finally {
        setIsLoading(false)
      }
    }
    restore()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error || 'Login failed' }
    setAccessToken(data.accessToken)
    setUser(data.user)
    return {}
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setAccessToken(null)
    setUser(null)
    router.push('/admin/login')
  }, [router])

  /** Wraps fetch with Authorization header. Auto-refreshes on 401. */
  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const doFetch = (token: string) =>
      fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

    let res = await doFetch(accessToken!)
    if (res.status === 401) {
      // Try token refresh
      const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' })
      if (refreshRes.ok) {
        const { accessToken: newToken } = await refreshRes.json()
        setAccessToken(newToken)
        res = await doFetch(newToken)
      } else {
        logout()
      }
    }
    return res
  }, [accessToken, logout])

  return (
    <AdminAuthContext.Provider value={{ user, accessToken, isLoading, login, logout, authFetch }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth(): AdminAuthContextType {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
```
