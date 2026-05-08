import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError, checkBodySize, checkCsrf } from '@/app/lib/apiMiddleware'
import { db } from '@/app/db'
import { users } from '@/app/db/schema'
import { eq } from 'drizzle-orm'
import { updateUserSchema } from '@/app/lib/validators'
import { toSafeUser } from '@/app/lib/utils'
import bcrypt from 'bcryptjs'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const csrf = checkCsrf(req)
  if (csrf) return csrf

  const bodyErr = checkBodySize(req)
  if (bodyErr) return bodyErr

  const auth = await requireAuth(req, 'owner')
  if (isAuthError(auth)) return auth

  try {
    const body   = await req.json()
    const parsed = updateUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() }
    if (parsed.data.name)     updates.name = parsed.data.name
    if (parsed.data.password) {
      updates.passwordHash       = await bcrypt.hash(parsed.data.password, 12)
      updates.mustChangePassword = false
    }

    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, params.id))
      .returning()

    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(toSafeUser(user))
  } catch (err) {
    console.error('[admin/users PUT]', err)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
