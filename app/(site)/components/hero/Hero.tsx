'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { OrbitRing } from './OrbitRing'
import styles from './Hero.module.css'

/**
 * Hero section — full viewport, orbit animation + GSAP headline reveal.
 * ScrollTrigger scatters orbit items as user scrolls past.
 */
export function Hero() {
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      // Headline stagger reveal on mount
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

      gsap.from('.hero-cta', {
        y: 16,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        delay: 1.1,
      })

      // Orbit scatter on scroll
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

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen bg-base overflow-hidden flex items-end"
      aria-label="Hero"
    >
      {/* Orange radial glow */}
      <div className={styles.glow} aria-hidden="true" />

      {/* Orbit */}
      <OrbitRing />

      {/* Headline — bottom-left anchored */}
      <div className="relative z-10 px-6 md:px-12 pb-16 md:pb-24 max-w-2xl">
        <h1
          className="hero-headline font-display font-black leading-none tracking-tight text-text-primary mb-4"
          style={{ fontSize: 'clamp(4rem, 11vw, 9rem)' }}
        >
          <span className="block">Eat.</span>
          <span className="block text-orange">Different.</span>
        </h1>

        <p className="hero-subline font-body text-text-muted text-lg md:text-xl mb-8">
          Kaduna&apos;s junk food spot.
        </p>

        <a
          href="#menu"
          className="hero-cta font-body font-medium text-sm text-text-muted hover:text-orange transition-colors tracking-wider"
          aria-label="Scroll to menu"
        >
          See the Menu ↓
        </a>
      </div>
    </section>
  )
}
