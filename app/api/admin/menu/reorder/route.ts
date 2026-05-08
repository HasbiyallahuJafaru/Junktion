import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError, checkBodySize, checkCsrf } from '@/app/lib/apiMiddleware'
import { db } from '@/app/db'
import { menuItems } from '@/app/db/schema'
import { eq } from 'drizzle-orm'
import { reorderSchema } from '@/app/lib/validators'

export async function PUT(req: NextRequest) {
  const csrf = checkCsrf(req)
  if (csrf) return csrf

  const bodyErr = checkBodySize(req)
  if (bodyErr) return bodyErr

  const auth = await requireAuth(req, 'owner')
  if (isAuthError(auth)) return auth

  try {
    const body   = await req.json()
    const parsed = reorderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    await db.transaction(async (tx) => {
      for (const { id, displayOrder } of parsed.data.order) {
        await tx
          .update(menuItems)
          .set({ displayOrder, updatedAt: new Date() })
          .where(eq(menuItems.id, id))
      }
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/menu/reorder PUT]', err)
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 })
  }
}
