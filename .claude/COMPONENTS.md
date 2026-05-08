# JUNKTION — Component Contracts

Every component listed here has a defined interface.
Build exactly to spec — no added props, no removed props.

---

## `<Nav />`

```typescript
// No props — reads cart from CartContext
// Location: /app/components/nav/Nav.tsx

// Behavior:
// - Transparent background when window.scrollY < 80
// - backdrop-blur + bg-base/90 when scrollY >= 80
// - Cart badge shows count from useCart()
// - Mobile: hamburger at <768px → full-screen overlay
```

---

## `<Hero />`

```typescript
// No props
// Location: /app/components/hero/Hero.tsx

// Contains:
// - <OrbitRing /> — the 3 orbiting food items
// - Headline: "Eat. Different." — bottom-left anchored
// - Subline + scroll CTA
// - GSAP ScrollTrigger: scatters orbit items on scroll
// - Orange radial glow: CSS background on hero container
```

---

## `<OrbitRing />`

```typescript
// No props
// Location: /app/components/hero/OrbitRing.tsx

// Renders 3 circular food images on elliptical orbit
// Pure CSS animation — no JS
// Items: shawarma, wings, loaded fries
// Each 120px diameter, circular crop
// Orbit ellipse: 380px wide × 160px tall (transform: scale(1, 0.42) on container)
```

---

## `<Marquee />`

```typescript
// No props
// Location: /app/components/marquee/Marquee.tsx

// Full-width orange strip
// Text repeated twice for seamless loop
// transform: rotate(-1.5deg) — bleeds past edges
// overflow: hidden on wrapper to clip the bleed
```

---

## `<MenuWheel />`

```typescript
// No props — reads FEATURED_ITEMS from menu.ts
// Location: /app/components/menu/MenuWheel.tsx

// State:
// activeIndex: number — which item is at center (0 to items.length - 1)
// isAnimating: boolean — prevents double-fire during transition

// Renders 5 items at a time using ARC_POSITIONS from DESIGN_SYSTEM
// Infinite loop: items array = [...FEATURED_ITEMS, ...FEATURED_ITEMS, ...FEATURED_ITEMS]
// activeIndex wraps with modulo

// Contains: <WheelItem /> × 5 (visible window of infinite array)
// Contains: useWheelScroll() hook
```

---

## `<WheelItem />`

```typescript
interface WheelItemProps {
  item: MenuItem
  position: -2 | -1 | 0 | 1 | 2   // arc position
  isCenter: boolean                  // true when position === 0
  onOrder: (item: MenuItem) => void  // fires when "Order →" clicked
}
// Location: /app/components/menu/WheelItem.tsx

// Renders:
// - Circle image (180px center, scaled down per arc position)
// - Orange border ring: only when isCenter === true
// - Name + price + "Order →": only when isCenter === true
//   Reveal: translateY(12px → 0) + opacity 0 → 1, 200ms
```

---

## `useWheelScroll`

```typescript
interface UseWheelScrollReturn {
  activeIndex: number
  advance: () => void    // move to next item
  retreat: () => void    // move to previous item
}

function useWheelScroll(
  itemCount: number,
  containerRef: React.RefObject<HTMLDivElement>
): UseWheelScrollReturn

// Location: /app/components/menu/useWheelScroll.ts

// Handles:
// 1. Mouse wheel: addEventListener 'wheel', deltaY > 0 → advance, < 0 → retreat
// 2. Touch: touchstart/touchend, deltaX > 30 → advance/retreat
// 3. Auto-rotate: setInterval 3000ms → advance (paused on hover/touch)
// 4. Cleanup: removes all listeners + clears interval on unmount
```

---

## `<OrderDrawer />`

```typescript
interface OrderDrawerProps {
  isOpen: boolean
  onClose: () => void
}
// Location: /app/components/order/OrderDrawer.tsx

// Slides in from right: translateX(100% → 0)
// Backdrop: fixed overlay, onClick → onClose
// Reads cart from useCart()
// Contains <CartItem /> for each item in cart
// Delivery address input → setDeliveryAddress()
// "Place Order" → opens <OrderModal />
```

---

## `<CartItem />`

```typescript
interface CartItemProps {
  item: CartItem   // from CartContext
}
// Location: /app/components/order/CartItem.tsx

// Renders: name + qty controls (− qty +) + line price
// updateQty(id, 0) removes item from cart
// No card — content on drawer surface directly
```

---

## `<OrderModal />`

```typescript
interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void   // fires WhatsApp link + clearCart()
}
// Location: /app/components/order/OrderModal.tsx

// Centered modal over dimmed drawer
// Shows: item list, total, delivery address, bank details
// "I've Paid — Send Order on WhatsApp" → buildWhatsAppLink(buildOrderMessage(...))
// Opens in new tab: window.open(url, '_blank')
// Then: onConfirm() → clearCart() + close modal + close drawer + show toast
```

---

## `useCart`

```typescript
// Location: /app/context/CartContext.tsx

// Exported hook: useCart()
// Must be used inside <CartProvider>

// Returns CartContextType (see BUILD_ORDER.md Phase 5)
// addItem: if item already exists, increments quantity
// total: computed from items.reduce(sum + price * qty, 0)
```

---

## `<Story />`

```typescript
// No props
// Location: /app/components/story/Story.tsx

// Photo column: 55vw, left — 3 stacked images with blob clip-paths
// Text block: 38vw, right, anchored at 30% height
// GSAP ScrollTrigger: line-by-line text reveal on scroll enter
// Stats row: 3 unequal-width stat blocks below body copy
```

---

## `<Contact />`

```typescript
// No props
// Location: /app/components/contact/Contact.tsx

// Full-bleed map iframe (dark filtered)
// Overlay gradient: left half solid #0D0D0D, right half transparent
// Contact details sit on solid half
// WhatsApp FAB: fixed bottom-right, pulse animation
```

---

## `<Footer />`

```typescript
// No props
// Location: /app/components/footer/Footer.tsx

// 3 unequal columns: 50% · 25% · 25%
// No account number visible here
```

---

## Prop Naming Conventions

```typescript
// Booleans: is*, has*, can*, should*
isOpen, isCenter, isAnimating, hasItems

// Handlers: on*
onClose, onOrder, onConfirm

// Data: noun only
item, items, index, position

// Refs: *Ref
containerRef, drawerRef
```
