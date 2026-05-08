import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/app/lib/apiMiddleware'
import { db } from '@/app/db'
import { orders, paymentAccounts } from '@/app/db/schema'
import { desc, eq, and, sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'))

    const offset = (page - 1) * PAGE_SIZE

    const where = status && VALID_STATUSES.includes(status)
      ? eq(orders.status, status as typeof orders.status._.data)
      : undefined

    const [rows, [{ count }]] = await Promise.all([
      db
        .select({
          id:              orders.id,
          reference:       orders.reference,
          status:          orders.status,
          total:           orders.total,
          deliveryAddress: orders.deliveryAddress,
          customerPhone:   orders.customerPhone,
          items:           orders.items,
          createdAt:       orders.createdAt,
          updatedAt:       orders.updatedAt,
          paymentAccount: {
            id:            paymentAccounts.id,
            accountName:   paymentAccounts.accountName,
            accountNumber: paymentAccounts.accountNumber,
            bankName:      paymentAccounts.bankName,
          },
        })
        .from(orders)
        .leftJoin(paymentAccounts, eq(orders.paymentAccountId, paymentAccounts.id))
        .where(where)
        .orderBy(desc(orders.createdAt))
        .limit(PAGE_SIZE)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .where(where),
    ])

    return NextResponse.json({
      orders: rows,
      page,
      pageSize: PAGE_SIZE,
      total: count,
      pages: Math.ceil(count / PAGE_SIZE),
    })
  } catch (err) {
    console.error('[admin/orders GET]', err)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
