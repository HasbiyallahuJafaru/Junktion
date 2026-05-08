import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, type JwtPayload } from './auth'

export interface AuthUser {
  id: string
  role: 'owner' | 'cashier'
  email: string
  mustChangePassword?: boolean
}

const MAX_BODY_BYTES = 51_200  // 50KB

/** Reject payloads over 50KB */
export function checkBodySize(req: NextRequest): NextResponse | null {
  const length = req.headers.get('content-length')
  if (length && parseInt(length) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })
  }
  return null
}

/** CSRF protection for admin mutation routes */
export function checkCsrf(req: NextRequest): NextResponse | null {
  if (process.env.NODE_ENV === 'development') return null

  const origin  = req.headers.get('origin')
  const referer = req.headers.get('referer')
  const host    = req.headers.get('host')

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

/** Extract Bearer token, verify JWT, optionally enforce owner role */
export async function requireAuth(
  req: NextRequest,
  requiredRole?: 'owner'
): Promise<AuthUser | NextResponse> {
  const header = req.headers.get('Authorization')
  if (!header?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const payload = await verifyToken(header.slice(7)) as JwtPayload
    const user: AuthUser = {
      id:                 payload.sub,
      role:               payload.role,
      email:              payload.email,
      mustChangePassword: payload.mustChangePassword,
    }
    if (requiredRole === 'owner' && user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return user
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}

/** Type guard — true if requireAuth returned an error response */
export const isAuthError = (r: AuthUser | NextResponse): r is NextResponse =>
  r instanceof NextResponse
