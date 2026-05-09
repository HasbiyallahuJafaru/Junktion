import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError, checkBodySize, checkCsrf } from '@/app/lib/apiMiddleware'
import { db } from '@/app/db'
import { menuItems } from '@/app/db/schema'
import { asc } from 'drizzle-orm'
import { menuItemSchema } from '@/app/lib/validators'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth

  try {
    const items = await db
      .select()
      .from(menuItems)
      .orderBy(asc(menuItems.displayOrder), asc(menuItems.createdAt))

    return NextResponse.json(items)
  } catch (err) {
    console.error('[admin/menu GET]', err)
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 })
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
    const parsed = menuItemSchema.safeParse(body)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      const field = String(issue.path[0] ?? 'input')
      return NextResponse.json({ error: `${field}: ${issue.message}` }, { status: 400 })
    }

    const [item] = await db.insert(menuItems).values(parsed.data).returning()
    return NextResponse.json(item, { status: 201 })
  } catch (err) {
    console.error('[admin/menu POST]', err)
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
}
