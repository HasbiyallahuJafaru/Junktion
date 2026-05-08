import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError, checkBodySize, checkCsrf } from '@/app/lib/apiMiddleware'
import { db } from '@/app/db'
import { paymentAccounts } from '@/app/db/schema'
import { eq } from 'drizzle-orm'
import { paymentAccountSchema } from '@/app/lib/validators'

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
    const parsed = paymentAccountSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const [account] = await db
      .update(paymentAccounts)
      .set(parsed.data)
      .where(eq(paymentAccounts.id, params.id))
      .returning()

    if (!account) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(account)
  } catch (err) {
    console.error('[admin/accounts PUT]', err)
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 })
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
    const [account] = await db
      .delete(paymentAccounts)
      .where(eq(paymentAccounts.id, params.id))
      .returning({ id: paymentAccounts.id, isPrimary: paymentAccounts.isPrimary })

    if (!account) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (account.isPrimary) {
      return NextResponse.json(
        { error: 'Cannot delete the primary account. Set another account as primary first.' },
        { status: 422 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/accounts DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
