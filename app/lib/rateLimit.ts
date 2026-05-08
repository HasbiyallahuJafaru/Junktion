import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/db'
import { loginAttempts, rateLimitLog } from '@/app/db/schema'
import { and, eq, gt, count, sql } from 'drizzle-orm'

const MAX_LOGIN_FAILURES = 5
const LOCKOUT_WINDOW_MS  = 15 * 60 * 1000  // 15 minutes

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  '/api/auth/login': { max: 5,  windowMs: 15 * 60 * 1000 },
  '/api/orders':     { max: 10, windowMs:  1 * 60 * 1000 },
  default:           { max: 30, windowMs:  1 * 60 * 1000 },
}

/** Extract real IP from Netlify forwarded headers */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  )
}

/**
 * Log this request and check if the IP is over the rate limit for this route.
 * Returns a 429 response if exceeded, null if OK.
 */
export async function applyRateLimit(
  req: NextRequest,
  route: string
): Promise<NextResponse | null> {
  const ip      = getClientIp(req)
  const limit   = LIMITS[route] ?? LIMITS['default']
  const windowStart = new Date(Date.now() - limit.windowMs)

  // Log this request (fire-and-forget style, but we await for count accuracy)
  await db.insert(rateLimitLog).values({ ip, route })

  const [{ value: requestCount }] = await db
    .select({ value: count() })
    .from(rateLimitLog)
    .where(
      and(
        eq(rateLimitLog.ip, ip),
        eq(rateLimitLog.route, route),
        gt(rateLimitLog.requestedAt, windowStart)
      )
    )

  if (Number(requestCount) > limit.max) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(limit.windowMs / 1000)) } }
    )
  }

  return null
}

/** Record a failed login attempt for this email */
export async function recordFailedLogin(email: string, ip: string): Promise<void> {
  await db.insert(loginAttempts).values({ email, ip })
}

/** Check if email has 5+ failed attempts in the last 15 minutes */
export async function isAccountLocked(email: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - LOCKOUT_WINDOW_MS)
  const [{ value: failures }] = await db
    .select({ value: count() })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.email, email),
        gt(loginAttempts.attemptedAt, windowStart)
      )
    )
  return Number(failures) >= MAX_LOGIN_FAILURES
}

/** Delete login attempt rows for this email (call on successful login) */
export async function clearLoginAttempts(email: string): Promise<void> {
  await db.delete(loginAttempts).where(eq(loginAttempts.email, email))
}

/** Trim stale rows — call fire-and-forget after a successful login */
export function pruneStaleRows(): void {
  void db.execute(sql`DELETE FROM login_attempts WHERE attempted_at < NOW() - INTERVAL '24 hours'`)
  void db.execute(sql`DELETE FROM rate_limit_log WHERE requested_at < NOW() - INTERVAL '1 hour'`)
}
