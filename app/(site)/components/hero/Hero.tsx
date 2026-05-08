'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { OrbitRing } from './OrbitRing'
import styles from './Hero.module.css'

/**
 * Hero section — full viewport, orbit animation + headline reveal.
 * Mount animations use CSS @keyframes (no JS dependency, StrictMode-safe).
 * ScrollTrigger scatters orbit items as user scrolls past.
 */
export function Hero() {
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      // Scroll-only: scatter orbit items and fade headline out as user scrolls away
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'center top',
          end: 'bottom top',
          scrub: 1,
        },
      })

      tl.to('.orbit-item-1', { x: -300, y: -200, opacity: 0, scale: 0.5 }, 0)
      tl.to('.orbit-item-2', { x: 200,  y: -300, opacity: 0, scale: 0.5 }, 0)
      tl.to('.orbit-item-3', { x: 100,  y: 200,  opacity: 0, scale: 0.5 }, 0)
      tl.to('.hero-headline', { y: -60, opacity: 0 }, 0)
    }, heroRef)

    return () => {
      try {
        ScrollTrigger.getAll().forEach((t) => t.kill())
        ctx.revert()
      } catch (_) {
        // StrictMode double-invoke can cause revert to run on already-unmounted nodes
      }
    }
  }, [])

  return (
    <section
      ref={heroRef}
      className={`relative min-h-screen overflow-hidden flex items-end ${styles.heroGradient}`}
      aria-label="Hero"
    >
      {/* Organic background shapes */}
      <div className={styles.bgShapes} aria-hidden="true">
        {/* Large ring — upper right, mostly off-screen */}
        <div className={styles.ringLarge} />
        {/* Medium ring — left side, mid-height */}
        <div className={styles.ringMid} />
        {/* Filled blob — lower centre */}
        <div className={styles.blobLow} />
        {/* Thin arc — upper left */}
        <div className={styles.arcThin} />
        {/* Small solid dot cluster */}
        <div className={styles.dotA} />
        <div className={styles.dotB} />
      </div>

      {/* Orange radial glow */}
      <div className={styles.glow} aria-hidden="true" />

      {/* Orbit */}
      <OrbitRing />

      {/* Headline — bottom-left anchored */}
      <div className="relative z-10 px-6 md:px-12 pb-16 md:pb-24 max-w-2xl">
        <h1
          className={`hero-headline font-display font-black leading-none tracking-tight text-text-primary mb-4 ${styles.headlineReveal}`}
          style={{ fontSize: 'clamp(4rem, 11vw, 9rem)' }}
        >
          <span className={`block ${styles.revealLine}`}>Eat.</span>
          <span className={`block text-orange ${styles.revealLine} ${styles.revealLine2}`}>Different.</span>
        </h1>

        <p className={`hero-subline font-body text-text-muted text-lg md:text-xl mb-8 ${styles.fadeUp} ${styles.fadeUpDelay1}`}>
          Kaduna&apos;s junk food spot.
        </p>

        <a
          href="#menu"
          className={`hero-cta font-body font-medium text-sm text-text-muted hover:text-orange transition-colors tracking-wider ${styles.fadeUp} ${styles.fadeUpDelay2}`}
          aria-label="Scroll to menu"
        >
          See the Menu ↓
        </a>
      </div>
    </section>
  )
}
