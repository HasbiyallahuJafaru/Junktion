# JUNKTION — Order Flow

## Complete Flow

```
[MenuWheel center item]
        │ "Order →" clicked
        ▼
[OrderDrawer slides in from right]
        │ user adjusts quantities
        │ user enters delivery address (min 5 chars)
        │ "Place Order" clicked
        ▼
[POST /api/orders]
        │ validates items + address
        │ fetches primary payment account from DB
        │ generates reference: JNK-XXXXXX
        │ inserts order to Neon (status: 'pending')
        │ returns { reference, total, paymentAccount }
        ▼
[OrderModal appears]
        │ shows: items, total, delivery address
        │ reveals: bank account details
        │ shows: order reference (JNK-XXXXXX)
        │ user transfers payment manually
        │ "I've Paid — Send Order on WhatsApp" clicked
        ▼
[WhatsApp opens — pre-drafted message]
        │ includes: items, total, address, reference, "Transferred ✅"
        ▼
[Cart cleared + drawer + modal closed]
[Toast: "Order sent! Ref: JNK-XXXXXX"]
        │
        ▼
Customer can track at: junktion.netlify.app/track/JNK-XXXXXX
```

---

## CartContext — `/app/context/CartContext.tsx`

```typescript
'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface CartItem {
  id: string; name: string; price: number   // price in kobo
  quantity: number; category: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  total: number               // kobo
  itemCount: number
  deliveryAddress: string
  setDeliveryAddress: (v: string) => void
  clearCart: () => void
  isDrawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const addItem = useCallback((newItem: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === newItem.id)
      if (existing)
        return prev.map((i) => i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...newItem, quantity: 1 }]
    })
    setIsDrawerOpen(true)
  }, [])

  const removeItem  = useCallback((id: string) =>
    setItems((p) => p.filter((i) => i.id !== id)), [])

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty <= 0) setItems((p) => p.filter((i) => i.id !== id))
    else setItems((p) => p.map((i) => i.id === id ? { ...i, quantity: qty } : i))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setDeliveryAddress('')
  }, [])

  const total     = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const itemCount = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQty,
      total, itemCount, deliveryAddress, setDeliveryAddress,
      clearCart, isDrawerOpen,
      openDrawer:  () => setIsDrawerOpen(true),
      closeDrawer: () => setIsDrawerOpen(false),
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
```

---

## POST /api/orders — Route Handler

```typescript
// /app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/db'
import { orders, paymentAccounts } from '@/app/db/schema'
import { eq } from 'drizzle-orm'
import { orderSchema } from '@/app/lib/validators'
import { generateReference } from '@/app/lib/utils'

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const parsed = orderSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  try {
    // Get primary payment account
    const [account] = await db.select().from(paymentAccounts)
      .where(eq(paymentAccounts.isPrimary, true))
      .limit(1)

    const reference = generateReference()
    const total = parsed.data.items.reduce(
      (s, i) => s + i.price * i.quantity, 0
    )

    const [order] = await db.insert(orders).values({
      reference,
      items:           parsed.data.items,
      total,
      deliveryAddress: parsed.data.deliveryAddress,
      customerPhone:   parsed.data.customerPhone,
      paymentAccountId: account?.id,
    }).returning()

    return NextResponse.json({
      success:   true,
      reference: order.reference,
      total:     order.total,
      paymentAccount: account ? {
        accountName:   account.accountName,
        accountNumber: account.accountNumber,
        bankName:      account.bankName,
      } : null,
    }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/orders]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

---

## Order Tracking — `/app/(site)/track/[reference]/page.tsx`

```tsx
// Server component — fetches order server-side
// Falls back to client polling for status updates

import { db } from '@/app/db'
import { orders } from '@/app/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import TrackingClient from './_components/TrackingClient'

export default async function TrackPage({
  params
}: { params: { reference: string } }) {
  const [order] = await db.select().from(orders)
    .where(eq(orders.reference, params.reference.toUpperCase()))
    .limit(1)

  if (!order) notFound()

  return <TrackingClient initialOrder={order} />
}
```

**`TrackingClient` component:**
- Receives `initialOrder` as prop
- Polls `GET /api/orders/track/[reference]` every 30 seconds
- Updates status display without full page reload

**Status timeline visual:**
```
● pending → ● confirmed → ● preparing → ● ready → ● delivered
```
- Past steps: orange filled circle
- Active step: orange filled circle + pulsing ring
- Future steps: muted empty circle
- Cancelled: all circles red, "Order Cancelled" message

---

## Order Modal Spec

Triggered after successful `POST /api/orders` response.

```
ORDER SUMMARY           [✕]

• Regular Chicken Shawarma × 2    ₦7,800
• Loaded Fries × 1                ₦6,000
• Wings (6 Pieces) × 1            ₦4,500

────────────────────────────────────
Delivery to: 15 Independence Way, GRA

TOTAL                         ₦18,300

Transfer your total to:
  Junktion LTD
  5119991680
  Moniepoint

Order Ref: JNK-A3F9KL
(Keep this to track your order)

[I've Paid — Send Order on WhatsApp]
```

**Styling:**
- Background `#0D0D0D`, no card border
- Account number: Syne 800, orange, large
- Reference: Syne 600, muted, small — copy-to-clipboard on click
- CTA button: full-width, orange, Syne 700

---

## Validation Rules

```typescript
// Place Order button disabled when:
const canPlaceOrder = items.length > 0 && deliveryAddress.trim().length >= 5

// Disabled state: orange button at 40% opacity, cursor-not-allowed
// Shake animation on click when disabled
```

---

## Toast After WhatsApp Opens

```typescript
// page.tsx or layout
const [toast, setToast] = useState<{ message: string; ref?: string } | null>(null)

// After modal confirms:
setToast({ message: 'Order sent!', ref: reference })
setTimeout(() => setToast(null), 5000)
```

```tsx
{toast && (
  <div className={styles.toast}>
    <span>{toast.message}</span>
    {toast.ref && <span className={styles.toastRef}>Ref: {toast.ref}</span>}
  </div>
)}
```

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| No primary payment account set | Modal shows "Contact us to confirm payment details" |
| Order API fails | Toast error: "Something went wrong. Try again." |
| Delivery address too short | "Place Order" button disabled |
| WhatsApp not installed | `web.whatsapp.com` opens in new tab |
| Same item added twice | Quantity increments, no duplicate row |
| User closes modal (no WhatsApp) | Order still saved in DB as 'pending' |
| Invalid tracking reference | `notFound()` → 404 page |
