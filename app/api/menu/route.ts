import { NextResponse } from 'next/server'
import { db } from '@/app/db'
import { menuItems } from '@/app/db/schema'
import { eq, asc } from 'drizzle-orm'

/** GET /api/menu — returns all available menu items, ordered by display_order */
export async function GET() {
  try {
    const items = await db
      .select({
        id:           menuItems.id,
        name:         menuItems.name,
        description:  menuItems.description,
        price:        menuItems.price,
        category:     menuItems.category,
        imageUrl:     menuItems.imageUrl,
        isAvailable:  menuItems.isAvailable,
        isFeatured:   menuItems.isFeatured,
        displayOrder: menuItems.displayOrder,
        createdAt:    menuItems.createdAt,
        updatedAt:    menuItems.updatedAt,
      })
      .from(menuItems)
      .where(eq(menuItems.isAvailable, true))
      .orderBy(asc(menuItems.displayOrder))

    return NextResponse.json(
      { items },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch {
    return NextResponse.json({ error: 'Failed to load menu' }, { status: 500 })
  }
}
