import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError, checkCsrf } from '@/app/lib/apiMiddleware'
import { db } from '@/app/db'
import { menuItems } from '@/app/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const csrf = checkCsrf(req)
  if (csrf) return csrf

  const auth = await requireAuth(req, 'owner')
  if (isAuthError(auth)) return auth

  try {
    const [existing] = await db
      .select({ isAvailable: menuItems.isAvailable })
      .from(menuItems)
      .where(eq(menuItems.id, params.id))
      .limit(1)

    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const [updated] = await db
      .update(menuItems)
      .set({ isAvailable: !existing.isAvailable, updatedAt: new Date() })
      .where(eq(menuItems.id, params.id))
      .returning({ id: menuItems.id, isAvailable: menuItems.isAvailable })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[admin/menu/toggle PATCH]', err)
    return NextResponse.json({ error: 'Failed to toggle' }, { status: 500 })
  }
}
