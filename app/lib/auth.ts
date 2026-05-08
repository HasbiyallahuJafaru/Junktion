import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const getPrivateKey = () => {
  const b64 = process.env.JWT_PRIVATE_KEY
  if (!b64) throw new Error('JWT_PRIVATE_KEY not set')
  return new TextEncoder().encode(Buffer.from(b64, 'base64').toString('utf-8'))
}

const getPublicKey = () => {
  const b64 = process.env.JWT_PUBLIC_KEY
  if (!b64) throw new Error('JWT_PUBLIC_KEY not set')
  return new TextEncoder().encode(Buffer.from(b64, 'base64').toString('utf-8'))
}

/** Kept for forward compatibility */
export { getPublicKey }

export interface JwtPayload {
  sub: string
  email: string
  role: 'owner' | 'cashier'
  mustChangePassword?: boolean
}

/** Sign a 15-minute access token */
export async function signAccessToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getPrivateKey())
}

/** Sign a 7-day refresh token */
export async function signRefreshToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getPrivateKey())
}

/** Verify a token and return its payload */
export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getPrivateKey())
  return payload as unknown as JwtPayload
}

/** Hash a password with bcrypt rounds 12 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}

/** Verify a password against a bcrypt hash */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

/** Set the httpOnly refresh cookie */
export function setRefreshCookie(token: string): void {
  cookies().set('jnk_refresh', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })
}

/** Clear the refresh cookie */
export function clearRefreshCookie(): void {
  cookies().delete('jnk_refresh')
}
