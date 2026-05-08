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
  const sizeError = checkBodySize(req)
  if (sizeError) return sizeError

  const limited = await applyRateLimit(req, '/api/auth/login')
  if (limited) return limited

  let body: unknown
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const locked = await isAccountLocked(parsed.data.email)
  if (locked)
    return NextResponse.json(
      { error: 'Account temporarily locked. Try again in 15 minutes.' },
      { status: 429 }
    )

  try {
    const [user] = await db.select().from(users)
      .where(eq(users.email, parsed.data.email)).limit(1)

    const DUMMY = '$2b$12$invalidhashpaddingtomaketiminguniform000000000000000000'
    const hash  = user?.passwordHash ?? DUMMY
    const valid = await verifyPassword(parsed.data.password, hash)

    const ip = getClientIp(req)

    if (!user || !user.isActive || !valid) {
      if (user) await recordFailedLogin(parsed.data.email, ip)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    await clearLoginAttempts(parsed.data.email)
    pruneStaleRows()  // fire-and-forget cleanup

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
