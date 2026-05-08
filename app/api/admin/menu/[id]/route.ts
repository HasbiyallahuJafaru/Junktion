import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError, checkBodySize, checkCsrf } from '@/app/lib/apiMiddleware'
import { db } from '@/app/db'
import { menuItems } from '@/app/db/schema'
import { eq } from 'drizzle-orm'
import { menuItemUpdateSchema } from '@/app/lib/validators'
import { deleteCloudinaryAsset } from '@/app/lib/cloudinary'

const PUBLIC_ID_RE = /^[a-zA-Z0-9_\-/.]+$/

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
    const parsed = menuItemUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const [item] = await db
      .update(menuItems)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(menuItems.id, params.id))
      .returning()

    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(item)
  } catch (err) {
    console.error('[admin/menu PUT]', err)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const csrf = checkCsrf(req)
  if (csrf) return csrf

  const auth = await requireAuth(req, 'owner')
  if (isAuthError(auth)) return auth

  try {
    const [item] = await db
      .delete(menuItems)
      .where(eq(menuItems.id, params.id))
      .returning({ cloudinaryPublicId: menuItems.cloudinaryPublicId })

    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (item.cloudinaryPublicId && PUBLIC_ID_RE.test(item.cloudinaryPublicId)) {
      await deleteCloudinaryAsset(item.cloudinaryPublicId)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/menu DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}
