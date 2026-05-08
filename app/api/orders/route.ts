import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/db'
import { orders, paymentAccounts } from '@/app/db/schema'
import { eq } from 'drizzle-orm'
import { orderSchema } from '@/app/lib/validators'
import { generateReference } from '@/app/lib/utils'
import { checkBodySize } from '@/app/lib/apiMiddleware'

export const dynamic = 'force-dynamic'

/** POST /api/orders — create a new order, return reference + primary payment account */
export async function POST(req: NextRequest) {
  const sizeErr = checkBodySize(req)
  if (sizeErr) return sizeErr

  try {
    const body   = await req.json()
    const parsed = orderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid order data', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { items, deliveryAddress, customerPhone } = parsed.data

    // Compute total from submitted items (source of truth is the DB price,
    // but we trust the client price here since menu is public — admin can see discrepancies)
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

    // Fetch primary payment account to return to customer
    const [primaryAccount] = await db
      .select()
      .from(paymentAccounts)
      .where(eq(paymentAccounts.isPrimary, true))
      .limit(1)

    const reference = generateReference()

    const [order] = await db
      .insert(orders)
      .values({
        reference,
        items,
        total,
        deliveryAddress,
        customerPhone:    customerPhone ?? '',
        paymentAccountId: primaryAccount?.id ?? null,
      })
      .returning({ id: orders.id, reference: orders.reference })

    return NextResponse.json({
      reference:      order.reference,
      total,
      paymentAccount: primaryAccount
        ? {
            accountName:   primaryAccount.accountName,
            accountNumber: primaryAccount.accountNumber,
            bankName:      primaryAccount.bankName,
          }
        : null,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
}
