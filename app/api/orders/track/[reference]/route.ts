import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/db'
import { orders, paymentAccounts } from '@/app/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

/** GET /api/orders/track/[reference] — public order status lookup */
export async function GET(
  _req: NextRequest,
  { params }: { params: { reference: string } }
) {
  const { reference } = params

  if (!reference || !/^JNK-[A-F0-9]{8}$/.test(reference)) {
    return NextResponse.json({ error: 'Invalid reference' }, { status: 400 })
  }

  try {
    const [order] = await db
      .select({
        reference:       orders.reference,
        status:          orders.status,
        total:           orders.total,
        deliveryAddress: orders.deliveryAddress,
        createdAt:       orders.createdAt,
        updatedAt:       orders.updatedAt,
        paymentAccountId: orders.paymentAccountId,
      })
      .from(orders)
      .where(eq(orders.reference, reference))
      .limit(1)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Fetch payment account if present
    let paymentAccount = null
    if (order.paymentAccountId) {
      const [acct] = await db
        .select({
          accountName:   paymentAccounts.accountName,
          accountNumber: paymentAccounts.accountNumber,
          bankName:      paymentAccounts.bankName,
        })
        .from(paymentAccounts)
        .where(eq(paymentAccounts.id, order.paymentAccountId))
        .limit(1)
      paymentAccount = acct ?? null
    }

    return NextResponse.json({
      reference:       order.reference,
      status:          order.status,
      total:           order.total,
      deliveryAddress: order.deliveryAddress,
      createdAt:       order.createdAt,
      updatedAt:       order.updatedAt,
      paymentAccount,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}
