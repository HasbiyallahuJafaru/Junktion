import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { eq } from 'drizzle-orm'
import { db } from '@/app/db'
import { users } from '@/app/db/schema'
import { verifyToken, signAccessToken } from '@/app/lib/auth'

export async function POST(_req: NextRequest) {
  const token = cookies().get('jnk_refresh')?.value
  if (!token)
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 })

  try {
    const payload = await verifyToken(token)

    // Fetch fresh user data so name/role changes are reflected immediately
    const [user] = await db.select().from(users)
      .where(eq(users.id, payload.sub as string)).limit(1)

    if (!user || !user.isActive)
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 401 })

    const accessToken = await signAccessToken({
      sub:                user.id,
      email:              user.email,
      role:               user.role,
      mustChangePassword: user.mustChangePassword,
    })

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
  } catch {
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
  }
}
