import { NextResponse } from 'next/server'
import { db } from '@/app/db'
import { menuItems } from '@/app/db/schema'
import { eq, asc } from 'drizzle-orm'
import { toPublicMenuItem } from '@/app/lib/utils'

export const dynamic = 'force-dynamic'

/** GET /api/menu — returns all available menu items, ordered by display_order */
export async function GET() {
  try {
    const items = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.isAvailable, true))
      .orderBy(asc(menuItems.displayOrder))

    return NextResponse.json({ items: items.map(toPublicMenuItem) })
  } catch {
    return NextResponse.json({ error: 'Failed to load menu' }, { status: 500 })
  }
}
