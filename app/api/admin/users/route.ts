import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError, checkBodySize, checkCsrf } from '@/app/lib/apiMiddleware'
import { db } from '@/app/db'
import { users } from '@/app/db/schema'
import { asc } from 'drizzle-orm'
import { createUserSchema } from '@/app/lib/validators'
import { toSafeUser } from '@/app/lib/utils'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, 'owner')
  if (isAuthError(auth)) return auth

  try {
    const rows = await db
      .select()
      .from(users)
      .orderBy(asc(users.createdAt))

    return NextResponse.json(rows.map(toSafeUser))
  } catch (err) {
    console.error('[admin/users GET]', err)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
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
    const parsed = createUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12)

    const [user] = await db
      .insert(users)
      .values({
        name:               parsed.data.name,
        email:              parsed.data.email,
        passwordHash,
        role:               'cashier',
        mustChangePassword: true,
      })
      .returning()

    return NextResponse.json(toSafeUser(user), { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('unique')) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }
    console.error('[admin/users POST]', err)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
