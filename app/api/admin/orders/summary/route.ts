import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/app/lib/apiMiddleware'
import { db } from '@/app/db'
import { orders } from '@/app/db/schema'
import { sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth

  try {
    const rows = await db
      .select({
        status: orders.status,
        count:  sql<number>`count(*)::int`,
      })
      .from(orders)
      .groupBy(orders.status)

    const summary: Record<string, number> = {
      pending: 0, confirmed: 0, preparing: 0,
      ready: 0, delivered: 0, cancelled: 0,
    }
    for (const r of rows) summary[r.status] = r.count

    return NextResponse.json(summary)
  } catch (err) {
    console.error('[admin/orders/summary GET]', err)
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 })
  }
}
