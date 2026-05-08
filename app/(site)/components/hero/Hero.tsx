'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { OrbitRing } from './OrbitRing'
import styles from './Hero.module.css'

/**
 * Hero section — full viewport, large decorative background text,
 * orbit food images centred over it, headline + dual CTAs below.
 */
export function Hero() {
  const heroRef    = useRef<HTMLElement>(null)
  const [trackOpen, setTrackOpen] = useState(false)
  const [ref, setRef]             = useState('')
  const router = useRouter()

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
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
      tl.to('.hero-content',  { y: -80, opacity: 0 }, 0)
      tl.to('.hero-bg-text',  { y: -40, opacity: 0 }, 0)
    }, heroRef)

    return () => {
      try {
        ScrollTrigger.getAll().forEach((t) => t.kill())
        ctx.revert()
      } catch (_) {}
    }
  }, [])

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = ref.trim()
    if (trimmed) router.push(`/track/${trimmed}`)
  }

  return (
    <section
      ref={heroRef}
      className={`relative min-h-screen overflow-hidden flex flex-col items-center justify-center ${styles.heroGradient}`}
      aria-label="Hero"
    >
      {/* Organic background shapes */}
      <div className={styles.bgShapes} aria-hidden="true">
        <div className={styles.ringLarge} />
        <div className={styles.ringMid} />
        <div className={styles.blobLow} />
        <div className={styles.arcThin} />
        <div className={styles.dotA} />
        <div className={styles.dotB} />
      </div>

      {/* White paint splashes */}
      <div className={styles.splashes} aria-hidden="true">
        <div className={styles.splashA} />
        <div className={styles.splashB} />
        <div className={styles.splashC} />
        <div className={styles.splashD} />
      </div>

      {/* Orange radial glow */}
      <div className={styles.glow} aria-hidden="true" />

      {/* Large decorative background text */}
      <div className={`hero-bg-text ${styles.bgText}`} aria-hidden="true">
        <span className={styles.bgWord}>EAT.</span>
        <span className={`${styles.bgWord} ${styles.bgWordAccent}`}>DIFF<span className={styles.bgWordOutline}>ERENT.</span></span>
      </div>

      {/* Orbit — centred over the background text */}
      <div className={styles.orbitWrap}>
        <OrbitRing />
      </div>

      {/* Hero content — centre-bottom */}
      <div className={`hero-content relative z-10 flex flex-col items-center text-center px-6 mt-auto pb-16 md:pb-24`}>
        <h1
          className={`font-display font-black leading-none tracking-tight text-text-primary mb-4 ${styles.headlineReveal}`}
          style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
        >
          <span className={`block ${styles.revealLine}`}>Kaduna&apos;s</span>
          <span className={`block text-orange ${styles.revealLine} ${styles.revealLine2}`}>Junk Food Spot.</span>
        </h1>

        <p className={`font-body text-text-muted text-lg md:text-xl mb-10 max-w-sm ${styles.fadeUp} ${styles.fadeUpDelay1}`}>
          Bold flavors. No apologies. Order online, pick up hot.
        </p>

        <div className={`flex flex-wrap items-center justify-center gap-4 ${styles.fadeUp} ${styles.fadeUpDelay2}`}>
          <a
            href="#menu"
            className={styles.btnPrimary}
          >
            <span className={styles.btnDot} />
            Order Now
          </a>

          <button
            onClick={() => setTrackOpen(true)}
            className={styles.btnGhost}
          >
            Track Your Order
          </button>
        </div>
      </div>

      {/* Track order modal */}
      {trackOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setTrackOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Track your order"
        >
          <div
            className={styles.modalBox}
            onClick={(e) => e.stopPropagation()}
          >
            <p className={styles.modalLabel}>Enter your order reference</p>
            <form onSubmit={handleTrack} className={styles.modalForm}>
              <input
                className={styles.modalInput}
                placeholder="e.g. JNK-A3F9"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                autoFocus
              />
              <button type="submit" className={styles.modalBtn}>Go →</button>
            </form>
            <button
              className={styles.modalClose}
              onClick={() => setTrackOpen(false)}
              aria-label="Close"
            >✕</button>
          </div>
        </div>
      )}
    </section>
  )
}
