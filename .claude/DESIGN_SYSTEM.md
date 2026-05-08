# JUNKTION — Design System

## Color Tokens

```css
/* /app/styles/tokens.css */
:root {
  /* Brand */
  --color-orange:        #F15A22;
  --color-orange-dim:    #F15A2214;   /* 8% opacity — glow backgrounds */
  --color-orange-mid:    #F15A2240;   /* 25% opacity — hover states */

  /* Surfaces */
  --color-base:          #0D0D0D;     /* page background */
  --color-surface-1:     #111111;     /* menu section, drawer */
  --color-surface-2:     #1A1A1A;     /* subtle elevation */
  --color-surface-3:     #222222;     /* dividers, inputs */
  --color-footer:        #080808;     /* footer */

  /* Text */
  --color-text-primary:  #F5F0EB;     /* warm off-white — headings */
  --color-text-body:     #C8C4BF;     /* body copy */
  --color-text-muted:    #6B6760;     /* labels, timestamps, metadata */
  --color-text-orange:   #F15A22;     /* accent text, prices */

  /* Functional */
  --color-border:        #1A1A1A;     /* section borders */
  --color-overlay:       rgba(0,0,0,0.6);  /* drawer backdrop */
}
```

---

## Typography

```css
/* Font stack — loaded via next/font/google in layout.tsx */
--font-display: 'Syne', sans-serif;    /* headlines, logo, prices */
--font-body:    'DM Sans', sans-serif; /* body, labels, UI */
```

### Scale (Modular — 1.333 ratio)
```css
--text-xs:   0.694rem;   /* 11px — labels, tracking */
--text-sm:   0.833rem;   /* 13px — metadata, captions */
--text-base: 1rem;       /* 16px — body */
--text-md:   1.2rem;     /* 19px — lead text */
--text-lg:   1.44rem;    /* 23px — subheadings */
--text-xl:   1.728rem;   /* 28px — section titles */
--text-2xl:  2.074rem;   /* 33px — large titles */
--text-3xl:  2.488rem;   /* 40px — hero subtext */
--text-hero: clamp(4rem, 11vw, 9rem);  /* hero headline — fluid */
```

### Usage Rules
- **Syne 800**: Hero headline, section wordmarks, price in focus
- **Syne 700**: Section labels (small, tracked), nav logo
- **Syne 600**: Item names in focus, modal headers
- **DM Sans 600**: CTAs, nav links, button text
- **DM Sans 400**: Body copy, descriptions, addresses
- **DM Sans 400 muted**: Metadata, timestamps, secondary info

### Letter Spacing
```css
--tracking-tight:  -0.02em;  /* hero headlines */
--tracking-normal: 0em;
--tracking-wide:   0.08em;   /* section labels like "THE MENU" */
--tracking-wider:  0.15em;   /* small caps labels */
```

---

## Spacing System

```css
--space-1:   4px;
--space-2:   8px;
--space-3:   12px;
--space-4:   16px;
--space-5:   24px;
--space-6:   32px;
--space-7:   48px;
--space-8:   64px;
--space-9:   96px;
--space-10:  128px;
--space-11:  192px;
```

---

## Animation Tokens

```css
--ease-organic:    cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-snap:       cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-smooth:     cubic-bezier(0.4, 0, 0.2, 1);

--duration-fast:   150ms;
--duration-base:   300ms;
--duration-slow:   500ms;
--duration-orbit:  20s;
--duration-marquee: 18s;
```

---

## Grain Overlay

Add to `globals.css` — renders on fixed layer above all content:

```css
/* Grain SVG filter */
.grain-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 128px 128px;
}
```

---

## Tailwind Config Extensions

```typescript
// tailwind.config.ts
extend: {
  colors: {
    orange: {
      DEFAULT: '#F15A22',
      dim: '#F15A2214',
      mid: '#F15A2240',
    },
    base: '#0D0D0D',
    surface: {
      1: '#111111',
      2: '#1A1A1A',
      3: '#222222',
    },
    text: {
      primary: '#F5F0EB',
      body: '#C8C4BF',
      muted: '#6B6760',
    },
  },
  fontFamily: {
    display: ['var(--font-syne)', 'sans-serif'],
    body: ['var(--font-dm-sans)', 'sans-serif'],
  },
}
```

---

## Asymmetry Rules

Every section must break the grid in at least one of these ways:

| Rule | Example |
|---|---|
| Offset headline | `margin-left: -2vw` — bleeds slightly off left edge |
| Unequal columns | 55% / 38% not 50% / 50% |
| Rotated element | `transform: rotate(-1.5deg)` on marquee strip |
| Overlapping layers | Photo bleeds into next section via negative margin |
| Anchor variance | Text anchored bottom-left, NOT center |
| Size contrast | 1 element dramatically larger than its neighbors |

---

## Organic Dividers (Between Sections)

Never use straight horizontal lines between sections. Use:

```css
/* SVG wave divider — inline in component */
/* Or CSS clip-path blob */
.section-divider {
  clip-path: ellipse(55% 100% at 50% 100%);
  /* or */
  clip-path: polygon(0 0, 100% 0, 100% 85%, 75% 100%, 25% 88%, 0 95%);
}
```

---

## MenuWheel Arc — Position Math

```typescript
// Pixel offsets per arc position (5 items visible)
// y offset creates upward arc curve toward center
export const ARC_POSITIONS = [
  { x: -340, y: 60,  scale: 0.35, opacity: 0.20 }, // far left
  { x: -180, y: 20,  scale: 0.60, opacity: 0.55 }, // near left
  { x: 0,    y: 0,   scale: 1.00, opacity: 1.00 }, // center (hero)
  { x: 180,  y: 20,  scale: 0.60, opacity: 0.55 }, // near right
  { x: 340,  y: 60,  scale: 0.35, opacity: 0.20 }, // far right
] as const

// Mobile arc (smaller offsets)
export const ARC_POSITIONS_MOBILE = [
  { x: -200, y: 40,  scale: 0.30, opacity: 0.15 },
  { x: -110, y: 15,  scale: 0.55, opacity: 0.50 },
  { x: 0,    y: 0,   scale: 1.00, opacity: 1.00 },
  { x: 110,  y: 15,  scale: 0.55, opacity: 0.50 },
  { x: 200,  y: 40,  scale: 0.30, opacity: 0.15 },
] as const
```

---

## Hero Orbit — CSS Keyframes

```css
/* Three items, each delayed by 6.67s (20s / 3) */
@keyframes orbit {
  from { transform: rotate(var(--orbit-start)) translateX(190px) rotate(calc(-1 * var(--orbit-start))); }
  to   { transform: rotate(calc(var(--orbit-start) + 360deg)) translateX(190px) rotate(calc(-1 * (var(--orbit-start) + 360deg))); }
}

.orbit-item-1 { --orbit-start: 0deg;    animation: orbit 20s linear infinite; }
.orbit-item-2 { --orbit-start: 120deg;  animation: orbit 20s linear infinite; }
.orbit-item-3 { --orbit-start: 240deg;  animation: orbit 20s linear infinite; }

/* Ellipse: squish the Y axis on the orbit container */
.orbit-ring {
  transform: scale(1, 0.42); /* converts circle orbit to ellipse */
}
.orbit-item img {
  transform: scale(1, calc(1 / 0.42)); /* counter-squish to keep images circular */
}
```

---

## Z-Index Scale

```css
--z-base:      0;
--z-content:   10;
--z-sticky:    100;    /* Nav */
--z-drawer:    200;    /* Order drawer */
--z-modal:     300;    /* Order modal */
--z-toast:     400;    /* Toast notification */
--z-grain:     9999;   /* Grain overlay — always on top */
```
