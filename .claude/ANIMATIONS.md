# JUNKTION — Animation Specifications

## Principles

1. **Motion serves meaning** — every animation reveals, guides, or delights. No decorative noise.
2. **Performance only** — animate `transform` and `opacity` exclusively. Never `width`, `height`, `top`, `left`, `margin`.
3. **Cleanup always** — every GSAP instance and event listener gets killed/removed in `useEffect` cleanup.
4. **One hero moment** — the orbit scatter on Hero→Menu scroll is the signature animation. Nothing else competes with it.

---

## Hero — Orbit Animation

**Type**: Pure CSS `@keyframes`
**No JS required** — runs on load, no ScrollTrigger

```css
/* In Hero.module.css */

.orbitRing {
  /* Squish container to make ellipse */
  transform: scale(1, 0.42);
  width: 380px;
  height: 380px;
  position: absolute;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
}

.orbitItem {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120px;
  height: 120px;
  margin: -60px 0 0 -60px;
  animation: orbit var(--orbit-duration, 20s) linear infinite;
  animation-delay: var(--orbit-delay, 0s);
}

/* Counter-squish the image so it stays circular */
.orbitItem img {
  transform: scale(1, 2.381); /* 1 / 0.42 */
  border-radius: 50%;
  object-fit: cover;
}

@keyframes orbit {
  from {
    transform: rotate(var(--orbit-start)) translateX(190px) rotate(calc(-1 * var(--orbit-start)));
  }
  to {
    transform: rotate(calc(var(--orbit-start) + 360deg))
               translateX(190px)
               rotate(calc(-1 * (var(--orbit-start) + 360deg)));
  }
}

/* Apply per item */
.orbitItem:nth-child(1) { --orbit-start: 0deg;   --orbit-delay: 0s; }
.orbitItem:nth-child(2) { --orbit-start: 120deg;  --orbit-delay: 0s; }
.orbitItem:nth-child(3) { --orbit-start: 240deg;  --orbit-delay: 0s; }
```

---

## Hero — Headline Reveal

**Type**: GSAP stagger on mount
**Trigger**: Fires once on component mount (not scroll)

```typescript
// In Hero.tsx useEffect
import { gsap } from 'gsap'

useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.from('.hero-headline span', {
      y: 80,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: 'power3.out',
      delay: 0.3,
    })
    gsap.from('.hero-subline', {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      delay: 0.8,
    })
  }, heroRef)

  return () => ctx.revert()
}, [])
```

**JSX structure** (each word in a `<span>` for stagger):
```tsx
<h1 className="hero-headline">
  <span>Eat.</span>
  <span>Different.</span>
</h1>
```

---

## Hero → Menu Transition: Orbit Scatter

**Type**: GSAP ScrollTrigger
**Trigger**: Hero section scrolls out of view

```typescript
useEffect(() => {
  const ctx = gsap.context(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'center top',
        end: 'bottom top',
        scrub: 1,
      },
    })

    // Scatter 3 orbit items in different directions
    tl.to('.orbit-item-1', { x: -300, y: -200, opacity: 0, scale: 0.5 }, 0)
    tl.to('.orbit-item-2', { x: 200,  y: -300, opacity: 0, scale: 0.5 }, 0)
    tl.to('.orbit-item-3', { x: 100,  y: 200,  opacity: 0, scale: 0.5 }, 0)
    tl.to('.hero-headline', { y: -60, opacity: 0 }, 0)
  }, heroRef)

  return () => ctx.revert()
}, [])
```

---

## Marquee Strip

**Type**: Pure CSS `@keyframes`

```css
/* Marquee.module.css */
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

.track {
  display: flex;
  width: max-content;
  animation: marquee 18s linear infinite;
}

/* Two identical text blocks = seamless loop */
/* .track contains [text][text] — translateX(-50%) = one full width */
```

---

## MenuWheel — Item Transition

**Type**: CSS transitions on transform + opacity
**Triggered by**: JS state change (`activeIndex` updates)

```css
/* WheelItem.module.css */
.item {
  transition:
    transform 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
    opacity 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform, opacity;
}
```

```typescript
// In WheelItem.tsx — apply arc position as inline style
const style = {
  transform: `translateX(${pos.x}px) translateY(${pos.y}px) scale(${pos.scale})`,
  opacity: pos.opacity,
}
```

---

## MenuWheel — CTA Reveal (Center Item)

**Type**: CSS transitions
**Trigger**: `isCenter` prop changes

```css
/* WheelItem.module.css */
.itemInfo {
  transform: translateY(12px);
  opacity: 0;
  transition:
    transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
    opacity 200ms ease;
  pointer-events: none;
}

.itemInfo.visible {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}
```

---

## Order Drawer — Slide In

**Type**: CSS transitions on transform
**Trigger**: `isOpen` prop

```css
/* OrderDrawer.module.css */
.drawer {
  transform: translateX(100%);
  transition: transform 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.drawer.open {
  transform: translateX(0);
}

.backdrop {
  opacity: 0;
  transition: opacity 300ms ease;
  pointer-events: none;
}

.backdrop.open {
  opacity: 1;
  pointer-events: auto;
}
```

---

## Story — Line Reveal

**Type**: GSAP ScrollTrigger + SplitText approach
**Trigger**: Section enters viewport

```typescript
// Story.tsx useEffect — manual line splitting
useEffect(() => {
  const ctx = gsap.context(() => {
    // Wrap each line in .story-line spans before this
    gsap.from('.story-line', {
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.story-text',
        start: 'top 75%',
        once: true,
      },
    })

    // Stats count-up
    gsap.from('.stat-number', {
      textContent: 0,
      duration: 1.5,
      ease: 'power2.out',
      snap: { textContent: 1 },
      scrollTrigger: {
        trigger: '.stats-row',
        start: 'top 80%',
        once: true,
      },
    })
  }, storyRef)

  return () => ctx.revert()
}, [])
```

---

## Nav — Scroll State

**Type**: CSS class toggle via JS
**Trigger**: `window.scrollY`

```typescript
// Nav.tsx useEffect
useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 80)
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
  return () => window.removeEventListener('scroll', handleScroll)
}, [])
```

```css
/* Nav transitions */
.nav {
  transition: background-color 300ms ease, backdrop-filter 300ms ease;
}
.nav.scrolled {
  background-color: rgba(13, 13, 13, 0.9);
  backdrop-filter: blur(12px);
}
```

---

## WhatsApp FAB — Pulse

**Type**: Pure CSS `@keyframes`

```css
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.08); }
}

.whatsappFab {
  animation: pulse 2.5s ease-in-out infinite;
}
.whatsappFab:hover {
  animation: none;
  transform: scale(1.12);
  transition: transform 200ms ease;
}
```

---

## GSAP ScrollTrigger — Global Setup

Add to `layout.tsx` or a `useGSAP` utility:

```typescript
// /app/hooks/useScrollTrigger.ts
'use client'
import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function useGSAPSetup() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])
}
```

Call `useGSAPSetup()` in `layout.tsx` or `page.tsx`.
