import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError, checkCsrf } from '@/app/lib/apiMiddleware'
import { db } from '@/app/db'
import { paymentAccounts } from '@/app/db/schema'
import { eq, ne } from 'drizzle-orm'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const csrf = checkCsrf(req)
  if (csrf) return csrf

  const auth = await requireAuth(req, 'owner')
  if (isAuthError(auth)) return auth

  try {
    await db.transaction(async (tx) => {
      // Clear all primary flags
      await tx
        .update(paymentAccounts)
        .set({ isPrimary: false })
        .where(ne(paymentAccounts.id, params.id))

      // Set this one as primary
      await tx
        .update(paymentAccounts)
        .set({ isPrimary: true })
        .where(eq(paymentAccounts.id, params.id))
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/accounts/primary PATCH]', err)
    return NextResponse.json({ error: 'Failed to set primary' }, { status: 500 })
  }
}
