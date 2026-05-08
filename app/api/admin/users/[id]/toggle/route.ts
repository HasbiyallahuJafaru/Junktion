import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError, checkCsrf } from '@/app/lib/apiMiddleware'
import { db } from '@/app/db'
import { users } from '@/app/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const csrf = checkCsrf(req)
  if (csrf) return csrf

  const auth = await requireAuth(req, 'owner')
  if (isAuthError(auth)) return auth

  // Prevent owners from deactivating themselves
  if (params.id === auth.id) {
    return NextResponse.json({ error: 'Cannot deactivate your own account' }, { status: 422 })
  }

  try {
    const [existing] = await db
      .select({ isActive: users.isActive, role: users.role })
      .from(users)
      .where(eq(users.id, params.id))
      .limit(1)

    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const [updated] = await db
      .update(users)
      .set({ isActive: !existing.isActive, updatedAt: new Date() })
      .where(eq(users.id, params.id))
      .returning({ id: users.id, isActive: users.isActive })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[admin/users/toggle PATCH]', err)
    return NextResponse.json({ error: 'Failed to toggle user' }, { status: 500 })
  }
}
