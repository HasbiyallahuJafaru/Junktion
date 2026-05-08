import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError, checkBodySize, checkCsrf } from '@/app/lib/apiMiddleware'
import { db } from '@/app/db'
import { orders } from '@/app/db/schema'
import { eq } from 'drizzle-orm'
import { orderStatusSchema } from '@/app/lib/validators'
import { isValidTransition } from '@/app/lib/utils'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const csrf = checkCsrf(req)
  if (csrf) return csrf

  const bodyErr = checkBodySize(req)
  if (bodyErr) return bodyErr

  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth

  try {
    const body   = await req.json()
    const parsed = orderStatusSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const [existing] = await db
      .select({ id: orders.id, status: orders.status })
      .from(orders)
      .where(eq(orders.id, params.id))
      .limit(1)

    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!isValidTransition(existing.status, parsed.data.status)) {
      return NextResponse.json(
        { error: `Cannot move from ${existing.status} to ${parsed.data.status}` },
        { status: 422 }
      )
    }

    const [updated] = await db
      .update(orders)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(eq(orders.id, params.id))
      .returning({ id: orders.id, status: orders.status, updatedAt: orders.updatedAt })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[admin/orders/status PATCH]', err)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}
