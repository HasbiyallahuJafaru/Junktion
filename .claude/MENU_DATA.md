# JUNKTION — Menu Data

## Source File: `/app/data/menu.ts`

Copy this exactly into the file:

```typescript
/** All Junktion menu items. Add image paths once food PNGs are sourced. */

export type MenuCategory =
  | 'shawarma'
  | 'sandwich'
  | 'pasta'
  | 'rice'
  | 'sides'
  | 'drinks'

export interface MenuItem {
  /** Unique slug — used as cart item ID */
  id: string
  name: string
  description: string
  price: number
  category: MenuCategory
  /** Path relative to /public/images/ — swap when real photos arrive */
  image: string
  /** Show in the hero carousel wheel */
  featured: boolean
}

export const MENU_ITEMS: MenuItem[] = [
  // ─── SHAWARMA ──────────────────────────────────────────────────
  {
    id: 'reg-chicken-shawarma',
    name: 'Regular Chicken Shawarma',
    description: 'Tender grilled chicken with signature sauce.',
    price: 3900,
    category: 'shawarma',
    image: 'shawarma-chicken.jpg',
    featured: true,
  },
  {
    id: 'large-chicken-shawarma',
    name: 'Large Chicken Shawarma',
    description: 'Tender grilled chicken with signature sauce.',
    price: 4900,
    category: 'shawarma',
    image: 'shawarma-chicken-large.jpg',
    featured: false,
  },
  {
    id: 'mini-beef-shawarma',
    name: 'Mini Beef Shawarma',
    description: 'Juicy spiced beef with signature sauce.',
    price: 2200,
    category: 'shawarma',
    image: 'shawarma-beef-mini.jpg',
    featured: false,
  },
  {
    id: 'reg-beef-shawarma',
    name: 'Regular Beef Shawarma',
    description: 'Juicy spiced beef with signature sauce.',
    price: 3700,
    category: 'shawarma',
    image: 'shawarma-beef.jpg',
    featured: true,
  },
  {
    id: 'large-beef-shawarma',
    name: 'Large Beef Shawarma',
    description: 'Juicy spiced beef with signature sauce.',
    price: 4700,
    category: 'shawarma',
    image: 'shawarma-beef-large.jpg',
    featured: false,
  },

  // ─── SANDWICH ──────────────────────────────────────────────────
  {
    id: 'chicken-sandwich',
    name: 'Chicken Sandwich',
    description: 'Soft bun with shredded chicken and creamy sauce.',
    price: 6500,
    category: 'sandwich',
    image: 'chicken-sandwich.jpg',
    featured: true,
  },
  {
    id: 'beef-sandwich',
    name: 'Beef Sandwich',
    description: 'Soft bun with beef and creamy sauce.',
    price: 6000,
    category: 'sandwich',
    image: 'beef-sandwich.jpg',
    featured: false,
  },

  // ─── PASTA & NOODLES ───────────────────────────────────────────
  {
    id: 'creamy-pasta',
    name: 'Creamy Pasta',
    description: 'Rich creamy sauce with chicken and cheese.',
    price: 7500,
    category: 'pasta',
    image: 'creamy-pasta.jpg',
    featured: true,
  },
  {
    id: 'noodles',
    name: 'Noodles',
    description: 'Stir-fried noodles with sausage.',
    price: 3500,
    category: 'pasta',
    image: 'noodles.jpg',
    featured: false,
  },

  // ─── RICE DISH ─────────────────────────────────────────────────
  {
    id: 'junktion-rice',
    name: 'Junktion Rice',
    description: 'Flavored Chinese rice with chicken chunks.',
    price: 5000,
    category: 'rice',
    image: 'junktion-rice.jpg',
    featured: true,
  },

  // ─── SIDES & SNACKS ────────────────────────────────────────────
  {
    id: 'loaded-fries',
    name: 'Loaded Fries',
    description: 'Crispy fries with chicken bites and sauce.',
    price: 6000,
    category: 'sides',
    image: 'loaded-fries.jpg',
    featured: true,
  },
  {
    id: 'cheese-toppings',
    name: 'Cheese Toppings',
    description: 'Cheese toppings for loaded fries.',
    price: 800,
    category: 'sides',
    image: 'cheese-toppings.jpg',
    featured: false,
  },
  {
    id: 'wings-6',
    name: 'Wings (6 Pieces)',
    description: 'BBQ chicken wings served hot.',
    price: 4500,
    category: 'sides',
    image: 'wings.jpg',
    featured: true,
  },
  {
    id: 'wings-12',
    name: 'Wings (12 Pieces)',
    description: 'BBQ chicken wings served hot.',
    price: 8500,
    category: 'sides',
    image: 'wings-12.jpg',
    featured: false,
  },

  // ─── DRINKS ────────────────────────────────────────────────────
  {
    id: 'water',
    name: 'Water',
    description: 'Bottled water.',
    price: 300,
    category: 'drinks',
    image: 'water.jpg',
    featured: false,
  },
  {
    id: 'soft-drinks',
    name: 'Soft Drinks',
    description: 'Chilled soft drinks.',
    price: 500,
    category: 'drinks',
    image: 'soft-drink.jpg',
    featured: false,
  },
]

/** Items shown in the MenuWheel carousel (featured: true) */
export const FEATURED_ITEMS = MENU_ITEMS.filter((item) => item.featured)

/** Group all items by category */
export const MENU_BY_CATEGORY = MENU_ITEMS.reduce(
  (acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  },
  {} as Record<MenuCategory, MenuItem[]>,
)

/** Format price as Nigerian Naira */
export const formatPrice = (price: number): string =>
  `₦${price.toLocaleString('en-NG')}`
```

---

## Carousel Item Count

The MenuWheel uses `FEATURED_ITEMS` — 8 items marked `featured: true`:

1. Regular Chicken Shawarma — ₦3,900
2. Regular Beef Shawarma — ₦3,700
3. Chicken Sandwich — ₦6,500
4. Creamy Pasta — ₦7,500
5. Junktion Rice — ₦5,000
6. Loaded Fries — ₦6,000
7. Wings (6 Pieces) — ₦4,500
8. Loaded Fries — ₦6,000

8 items loops cleanly (8 × 3 = 24 in the infinite array).

---

## Image Sourcing Notes

Until real photos are provided, source from Unsplash/Pexels:
- All images must be square crops (1:1 ratio) — they render as circles
- Minimum 400×400px
- Warm-toned food photography preferred (matches orange brand)
- Store in `/public/images/`

Search terms per item:
- `shawarma wrap food photography`
- `beef sandwich food close up`
- `creamy pasta chicken`
- `chinese fried rice chicken`
- `loaded fries chicken restaurant`
- `bbq wings food photography`
