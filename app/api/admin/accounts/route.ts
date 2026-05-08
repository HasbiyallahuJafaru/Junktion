import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError, checkBodySize, checkCsrf } from '@/app/lib/apiMiddleware'
import { db } from '@/app/db'
import { paymentAccounts } from '@/app/db/schema'
import { asc } from 'drizzle-orm'
import { paymentAccountSchema } from '@/app/lib/validators'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, 'owner')
  if (isAuthError(auth)) return auth

  try {
    const accounts = await db
      .select()
      .from(paymentAccounts)
      .orderBy(asc(paymentAccounts.createdAt))

    return NextResponse.json(accounts)
  } catch (err) {
    console.error('[admin/accounts GET]', err)
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
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
      .insert(paymentAccounts)
      .values(parsed.data)
      .returning()

    return NextResponse.json(account, { status: 201 })
  } catch (err) {
    console.error('[admin/accounts POST]', err)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
