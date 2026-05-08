import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, signAccessToken } from '@/app/lib/auth'

export async function POST(_req: NextRequest) {
  const token = cookies().get('jnk_refresh')?.value
  if (!token)
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 })

  try {
    const payload     = await verifyToken(token)
    const accessToken = await signAccessToken({
      sub:                payload.sub,
      email:              payload.email,
      role:               payload.role,
      mustChangePassword: payload.mustChangePassword,
    })
    return NextResponse.json({ accessToken })
  } catch {
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
  }
}
