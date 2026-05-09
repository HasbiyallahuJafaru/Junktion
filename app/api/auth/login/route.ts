import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/db'
import { users } from '@/app/db/schema'
import { eq } from 'drizzle-orm'
import { loginSchema } from '@/app/lib/validators'
import { signAccessToken, signRefreshToken, verifyPassword, setRefreshCookie } from '@/app/lib/auth'
import {
  getClientIp, applyRateLimit,
  isAccountLocked, recordFailedLogin, clearLoginAttempts, pruneStaleRows,
} from '@/app/lib/rateLimit'
import { checkBodySize } from '@/app/lib/apiMiddleware'

export async function POST(req: NextRequest) {
  try {
    const sizeError = checkBodySize(req)
    if (sizeError) return sizeError

    /* Rate limit — if DB is down fall through rather than crash */
    try {
      const limited = await applyRateLimit(req, '/api/auth/login')
      if (limited) return limited
    } catch (e) {
      console.error('[login] rate-limit check failed:', e)
    }

    let body: unknown
    try { body = await req.json() }
    catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

    const parsed = loginSchema.safeParse(body)
    if (!parsed.success)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    /* Account lock — if DB is down fall through */
    try {
      const locked = await isAccountLocked(parsed.data.email)
      if (locked)
        return NextResponse.json(
          { error: 'Account temporarily locked. Try again in 15 minutes.' },
          { status: 429 }
        )
    } catch (e) {
      console.error('[login] account-lock check failed:', e)
    }

    const [user] = await db.select().from(users)
      .where(eq(users.email, parsed.data.email)).limit(1)

    const DUMMY = '$2b$12$LKAGx7Vi5jEoTuMKMxBgaObkrsMzFXa/G3EbMQb2Y1zfHODWQFU1q'
    const hash  = user?.passwordHash ?? DUMMY
    let valid = false
    try { valid = await verifyPassword(parsed.data.password, hash) } catch { valid = false }

    const ip = getClientIp(req)

    if (!user || !user.isActive || !valid) {
      try { if (user) await recordFailedLogin(parsed.data.email, ip) } catch {}
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    try { await clearLoginAttempts(parsed.data.email) } catch {}
    pruneStaleRows()

    const payload = {
      sub:                user.id,
      email:              user.email,
      role:               user.role,
      mustChangePassword: user.mustChangePassword,
    }
    const accessToken  = await signAccessToken(payload)
    const refreshToken = await signRefreshToken(payload)
    setRefreshCookie(refreshToken)

    return NextResponse.json({
      accessToken,
      user: {
        id:                 user.id,
        name:               user.name,
        email:              user.email,
        role:               user.role,
        mustChangePassword: user.mustChangePassword,
      },
    })
  } catch (err) {
    console.error('[POST /api/auth/login]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
