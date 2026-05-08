# JUNKTION — Backend Specification

## Stack
- **Database**: Neon PostgreSQL (serverless)
- **ORM**: Drizzle ORM + `drizzle-kit`
- **Driver**: `@neondatabase/serverless` HTTP driver — works in Netlify Functions
- **Validation**: `zod` on every API route, no exceptions
- **Deployment**: Next.js API routes auto-become Netlify Functions

---

## Database Client — `/app/db/index.ts`

```typescript
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

---

## Schema — `/app/db/schema.ts`

```typescript
import {
  pgTable, uuid, text, integer, boolean,
  timestamp, jsonb, pgEnum, varchar, index
} from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', ['owner', 'cashier'])
export const categoryEnum = pgEnum('category', [
  'shawarma', 'sandwich', 'pasta', 'rice', 'sides', 'drinks'
])
export const orderStatusEnum = pgEnum('order_status', [
  'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'
])

export const users = pgTable('users', {
  id:           uuid('id').primaryKey().defaultRandom(),
  email:        text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name:         text('name').notNull(),
  role:         roleEnum('role').notNull().default('cashier'),
  isActive:     boolean('is_active').notNull().default(true),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
})

export const menuItems = pgTable('menu_items', {
  id:                 uuid('id').primaryKey().defaultRandom(),
  name:               text('name').notNull(),
  description:        text('description').notNull(),
  price:              integer('price').notNull(),        // kobo: 390000 = N3,900
  category:           categoryEnum('category').notNull(),
  imageUrl:           text('image_url').notNull(),
  cloudinaryPublicId: text('cloudinary_public_id').notNull(),
  isAvailable:        boolean('is_available').notNull().default(true),
  isFeatured:         boolean('is_featured').notNull().default(false),
  displayOrder:       integer('display_order').notNull().default(0),
  createdAt:          timestamp('created_at').notNull().defaultNow(),
  updatedAt:          timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  categoryIdx:  index('menu_category_idx').on(t.category),
  availableIdx: index('menu_available_idx').on(t.isAvailable),
}))

export const paymentAccounts = pgTable('payment_accounts', {
  id:            uuid('id').primaryKey().defaultRandom(),
  accountName:   text('account_name').notNull(),
  accountNumber: varchar('account_number', { length: 20 }).notNull(),
  bankName:      text('bank_name').notNull(),
  isPrimary:     boolean('is_primary').notNull().default(false),
  isActive:      boolean('is_active').notNull().default(true),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
})

export interface OrderItemJSON {
  id: string; name: string; price: number; quantity: number; category: string
}

export const orders = pgTable('orders', {
  id:               uuid('id').primaryKey().defaultRandom(),
  reference:        varchar('reference', { length: 12 }).notNull().unique(),
  items:            jsonb('items').$type<OrderItemJSON[]>().notNull(),
  total:            integer('total').notNull(),           // kobo
  deliveryAddress:  text('delivery_address').notNull(),
  customerPhone:    text('customer_phone'),
  status:           orderStatusEnum('status').notNull().default('pending'),
  paymentAccountId: uuid('payment_account_id').references(() => paymentAccounts.id),
  createdAt:        timestamp('created_at').notNull().defaultNow(),
  updatedAt:        timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  referenceIdx: index('order_reference_idx').on(t.reference),
  statusIdx:    index('order_status_idx').on(t.status),
  createdIdx:   index('order_created_idx').on(t.createdAt),
}))
```

---

## Drizzle Config — `drizzle.config.ts`

```typescript
import type { Config } from 'drizzle-kit'
export default {
  schema: './app/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: { connectionString: process.env.DATABASE_URL! },
} satisfies Config
```

---

## Zod Validators — `/app/lib/validators.ts`

```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const menuItemSchema = z.object({
  name:               z.string().min(2).max(100),
  description:        z.string().min(5).max(300),
  price:              z.number().positive().int(),       // kobo
  category:           z.enum(['shawarma','sandwich','pasta','rice','sides','drinks']),
  imageUrl:           z.string().url(),
  cloudinaryPublicId: z.string().min(1),
  isAvailable:        z.boolean().default(true),
  isFeatured:         z.boolean().default(false),
  displayOrder:       z.number().int().default(0),
})

export const menuItemUpdateSchema = menuItemSchema.partial()

export const paymentAccountSchema = z.object({
  accountName:   z.string().min(2).max(100),
  accountNumber: z.string().min(6).max(20),
  bankName:      z.string().min(2).max(100),
})

export const orderSchema = z.object({
  items: z.array(z.object({
    id:       z.string(),
    name:     z.string(),
    price:    z.number().positive().int(),
    quantity: z.number().positive().int().max(20),
    category: z.string(),
  })).min(1),
  deliveryAddress: z.string().min(5).max(500),
  customerPhone:   z.string().optional(),
})

export const orderStatusSchema = z.object({
  status: z.enum(['pending','confirmed','preparing','ready','delivered','cancelled']),
})

export const createUserSchema = z.object({
  name:     z.string().min(2).max(100),
  email:    z.string().email(),
  password: z.string().min(8).max(100),
  role:     z.literal('cashier'),
})

export const reorderSchema = z.object({
  order: z.array(z.object({
    id:           z.string().uuid(),
    displayOrder: z.number().int(),
  })),
})
```

---

## Utilities — `/app/lib/utils.ts`

```typescript
export const koboToNaira = (k: number) => k / 100
export const nairaToKobo = (n: number) => Math.round(n * 100)
export const formatPrice  = (k: number) => `\u20a6${(k/100).toLocaleString('en-NG')}`
export const generateReference = () =>
  'JNK-' + Math.random().toString(36).toUpperCase().slice(2, 8)

export const VALID_TRANSITIONS: Record<string, string[]> = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready'],
  ready:     ['delivered'],
  delivered: [],
  cancelled: [],
}
export const isValidTransition = (from: string, to: string) =>
  VALID_TRANSITIONS[from]?.includes(to) ?? false
```

---

## API Middleware — `/app/lib/apiMiddleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'

export interface AuthUser { id: string; role: 'owner' | 'cashier'; email: string }

export async function requireAuth(
  req: NextRequest,
  requiredRole?: 'owner'
): Promise<AuthUser | NextResponse> {
  const header = req.headers.get('Authorization')
  if (!header?.startsWith('Bearer '))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const user = await verifyToken(header.slice(7)) as unknown as AuthUser
    if (requiredRole === 'owner' && user.role !== 'owner')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return user
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}

export const isAuthError = (r: AuthUser | NextResponse): r is NextResponse =>
  r instanceof NextResponse
```

---

## Standard API Route Pattern

```typescript
export async function POST(req: NextRequest) {
  // 1. Auth
  const user = await requireAuth(req, 'owner')
  if (isAuthError(user)) return user

  // 2. Validate
  let body: unknown
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const parsed = mySchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  // 3. DB
  try {
    const result = await db.insert(table).values(parsed.data).returning()
    return NextResponse.json(result[0], { status: 201 })
  } catch (err) {
    console.error('[route]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

---

## Analytics Query — `/app/api/admin/analytics/route.ts`

```typescript
// Range: 7d | 30d | 90d
// All monetary values returned in Naira (convert from kobo before returning)

// Daily revenue — raw SQL via Drizzle:
const daily = await db.execute(sql`
  SELECT
    DATE(created_at) as date,
    COUNT(*) as order_count,
    SUM(total) as revenue_kobo
  FROM orders
  WHERE created_at >= ${rangeStart}
    AND status != 'cancelled'
  GROUP BY DATE(created_at)
  ORDER BY date ASC
`)

// Top items — unnest jsonb array:
const topItems = await db.execute(sql`
  SELECT
    item->>'name' as name,
    SUM((item->>'quantity')::int) as units_sold,
    SUM((item->>'price')::int * (item->>'quantity')::int) as revenue_kobo
  FROM orders,
       jsonb_array_elements(items) as item
  WHERE created_at >= ${rangeStart}
    AND status != 'cancelled'
  GROUP BY item->>'name'
  ORDER BY units_sold DESC
  LIMIT 10
`)
```

---

## Seed Script — `scripts/seed.js`

```javascript
const { neon } = require('@neondatabase/serverless')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

async function seed() {
  const sql = neon(process.env.DATABASE_URL)
  const hash = await bcrypt.hash('JunktionAdmin2025!', 12)

  await sql`
    INSERT INTO users (email, password_hash, name, role)
    VALUES ('admin@junktion.ng', ${hash}, 'Junktion Admin', 'owner')
    ON CONFLICT (email) DO NOTHING
  `
  await sql`
    INSERT INTO payment_accounts (account_name, account_number, bank_name, is_primary)
    VALUES ('Junktion LTD', '5119991680', 'Moniepoint', true)
    ON CONFLICT DO NOTHING
  `
  console.log('Done. Login: admin@junktion.ng / JunktionAdmin2025!')
  console.log('Change this password after first login.')
}
seed().catch(console.error)
```
