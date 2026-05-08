# JUNKTION — Image Guide

## Strategy

All food images are **circular crops** — every image must be sourced/cropped as a square (1:1).
Use `next/image` with `objectFit: 'cover'` + `borderRadius: '50%'` on the wrapper.

---

## Image Requirements

| Use | Dimensions | Format | Priority |
|---|---|---|---|
| Hero orbit items (×3) | 240×240px | WebP | `priority` |
| MenuWheel items (×8) | 400×400px | WebP | lazy |
| Story photos (×3) | 800×1000px | WebP | lazy |
| OG image | 1200×630px | JPG | — |

---

## Sourcing Guide (Unsplash/Pexels — Free)

Search these exact terms for best results:

### Hero Orbit (3 items)
1. `shawarma wrap overhead food photography dark background`
2. `bbq chicken wings food photography black background`
3. `loaded fries french fries food close up`

### MenuWheel Carousel (8 featured items)
1. `chicken shawarma wrap food photography`
2. `beef shawarma flatbread food`
3. `chicken sandwich soft bun food photography`
4. `creamy pasta chicken cheese food photography`
5. `chinese fried rice chicken bowl food`
6. `loaded fries chicken bites food photography`
7. `bbq chicken wings food photography`
8. `beef wrap sandwich food close up`

### Story Section (3 photos)
1. Staff team photo — use actual photo from flyer (`/mnt/user-data/uploads/192951.jpg`)
2. `food close up shawarma wrap restaurant`
3. `restaurant exterior night warm lighting`

---

## next/image Usage Pattern

```tsx
// Circular food item (MenuWheel, Hero orbit)
<div className={styles.foodCircle}>
  <Image
    src={`/images/${item.image}`}
    alt={item.name}
    fill
    sizes="(max-width: 768px) 120px, 180px"
    className={styles.foodImage}
  />
</div>
```

```css
/* CSS Module */
.foodCircle {
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  /* Width/height set by parent's scale transform */
}

.foodImage {
  object-fit: cover;
  object-position: center;
}
```

---

## Placeholder Strategy

Until real photos arrive, use Unsplash source URLs directly in `menu.ts`:

```typescript
// Temporary — replace with /images/[filename] before launch
image: 'https://images.unsplash.com/photo-[ID]?w=400&h=400&fit=crop&crop=center'
```

**Do NOT use** `picsum.photos` or `placeholder.com` — they break the food aesthetic.
Use real food photography even as placeholders.

---

## Staff Photos (from flyer)

The flyer images are available at:
- `/mnt/user-data/uploads/192951.jpg` — Customer Service Week (team photo)
- `/mnt/user-data/uploads/192955.jpg` — Junktion Challenge flyer

Copy the team photo to `/public/images/team.jpg` for use in the Story section:
```bash
cp /mnt/user-data/uploads/192951.jpg public/images/team.jpg
```

Crop to show just the 3 staff members — `object-position: center top` in CSS.

---

## OG Image

Create before launch:
- Dimensions: 1200×630px
- Background: `#0D0D0D`
- Center: JUNKTION wordmark in white Syne 800
- Orange glow behind wordmark
- 2–3 food items floating around text
- Save to `/public/og-image.jpg`
