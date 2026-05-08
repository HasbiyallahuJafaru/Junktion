import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/app/lib/apiMiddleware'
import { db } from '@/app/db'
import { orders } from '@/app/db/schema'
import { gte, and, ne, sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, 'owner')
  if (isAuthError(auth)) return auth

  try {
    const now     = new Date()
    const day30   = new Date(now); day30.setDate(day30.getDate() - 29)
    const day7    = new Date(now); day7.setDate(day7.getDate() - 6)

    const notCancelled = ne(orders.status, 'cancelled' as const)

    // All-time summary
    const [summary] = await db
      .select({
        totalOrders:  sql<number>`count(*)::int`,
        totalRevenue: sql<number>`coalesce(sum(${orders.total}), 0)::bigint`,
        avgOrder:     sql<number>`coalesce(avg(${orders.total}), 0)::int`,
      })
      .from(orders)
      .where(notCancelled)

    // 30-day revenue by day
    const revenueByDay = await db
      .select({
        day:     sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
        revenue: sql<number>`coalesce(sum(${orders.total}), 0)::bigint`,
        count:   sql<number>`count(*)::int`,
      })
      .from(orders)
      .where(and(gte(orders.createdAt, day30), notCancelled))
      .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`)

    // Status breakdown (all-time)
    const statusBreakdown = await db
      .select({
        status: orders.status,
        count:  sql<number>`count(*)::int`,
      })
      .from(orders)
      .groupBy(orders.status)

    // Top items (last 30 days) — unroll JSONB array
    const topItems = await db.execute(sql`
      SELECT
        item->>'name'                          AS name,
        item->>'category'                      AS category,
        sum((item->>'quantity')::int)          AS total_qty,
        sum((item->>'quantity')::int * (item->>'price')::bigint) AS total_revenue
      FROM orders,
           jsonb_array_elements(items) AS item
      WHERE created_at >= ${day30}
        AND status <> 'cancelled'
      GROUP BY item->>'name', item->>'category'
      ORDER BY total_qty DESC
      LIMIT 10
    `)

    // 7-day order count
    const [week] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(and(gte(orders.createdAt, day7), notCancelled))

    return NextResponse.json({
      summary: {
        totalOrders:  summary.totalOrders,
        totalRevenue: Number(summary.totalRevenue),
        avgOrder:     summary.avgOrder,
        last7Days:    week.count,
      },
      revenueByDay: revenueByDay.map(r => ({
        day:     r.day,
        revenue: Number(r.revenue),
        count:   r.count,
      })),
      statusBreakdown,
      topItems: topItems.rows.map((r: Record<string, unknown>) => ({
        name:         r.name as string,
        category:     r.category as string,
        totalQty:     Number(r.total_qty),
        totalRevenue: Number(r.total_revenue),
      })),
    })
  } catch (err) {
    console.error('[admin/analytics GET]', err)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
