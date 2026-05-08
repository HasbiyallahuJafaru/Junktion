'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
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

      {/* Liquid splash drops */}
      <div className={styles.splashes} aria-hidden="true">

        {/* Splash 1 — upper right, large crown */}
        <svg className={`${styles.splash} ${styles.splash1}`} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M80 140 C50 135 28 112 30 84 C32 56 48 38 62 28 C72 20 78 10 80 6 C82 10 88 20 98 28 C112 38 128 56 130 84 C132 112 110 135 80 140Z" fill="white" fillOpacity="0.07"/>
          <path d="M80 140 C50 135 28 112 30 84 C32 56 48 38 62 28 C72 20 78 10 80 6 C82 10 88 20 98 28 C112 38 128 56 130 84 C132 112 110 135 80 140Z" stroke="white" strokeOpacity="0.12" strokeWidth="1"/>
          {/* crown spikes */}
          <path d="M56 34 C53 22 58 12 62 6 C63 14 60 26 56 34Z" fill="white" fillOpacity="0.09"/>
          <path d="M104 34 C107 22 102 12 98 6 C97 14 100 26 104 34Z" fill="white" fillOpacity="0.09"/>
          <path d="M36 68 C24 62 16 52 18 44 C26 50 32 62 36 68Z" fill="white" fillOpacity="0.09"/>
          <path d="M124 68 C136 62 144 52 142 44 C134 50 128 62 124 68Z" fill="white" fillOpacity="0.09"/>
          {/* satellite drops */}
          <ellipse cx="44" cy="18" rx="5" ry="7" fill="white" fillOpacity="0.1"/>
          <ellipse cx="116" cy="18" rx="5" ry="7" fill="white" fillOpacity="0.1"/>
          <ellipse cx="20" cy="50" rx="4" ry="6" fill="white" fillOpacity="0.08"/>
          <ellipse cx="140" cy="50" rx="4" ry="6" fill="white" fillOpacity="0.08"/>
          <ellipse cx="80" cy="2" rx="4" ry="5" fill="white" fillOpacity="0.11"/>
        </svg>

        {/* Splash 2 — upper left, tilted */}
        <svg className={`${styles.splash} ${styles.splash2}`} viewBox="0 0 120 130" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M60 118 C36 112 16 92 18 68 C20 44 34 28 46 20 C54 14 58 6 60 2 C62 6 66 14 74 20 C86 28 100 44 102 68 C104 92 84 112 60 118Z" fill="white" fillOpacity="0.06"/>
          <path d="M60 118 C36 112 16 92 18 68 C20 44 34 28 46 20 C54 14 58 6 60 2 C62 6 66 14 74 20 C86 28 100 44 102 68 C104 92 84 112 60 118Z" stroke="white" strokeOpacity="0.1" strokeWidth="1"/>
          <path d="M42 26 C38 15 42 6 46 1 C47 9 44 20 42 26Z" fill="white" fillOpacity="0.08"/>
          <path d="M78 26 C82 15 78 6 74 1 C73 9 76 20 78 26Z" fill="white" fillOpacity="0.08"/>
          <path d="M20 55 C10 48 4 38 6 30 C14 36 18 48 20 55Z" fill="white" fillOpacity="0.08"/>
          <ellipse cx="32" cy="10" rx="4" ry="6" fill="white" fillOpacity="0.09"/>
          <ellipse cx="88" cy="10" rx="4" ry="6" fill="white" fillOpacity="0.09"/>
          <ellipse cx="8" cy="42" rx="3" ry="5" fill="white" fillOpacity="0.07"/>
        </svg>

        {/* Splash 3 — mid right, small tight */}
        <svg className={`${styles.splash} ${styles.splash3}`} viewBox="0 0 90 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M45 90 C26 85 10 68 12 50 C14 32 25 20 34 14 C39 10 43 4 45 1 C47 4 51 10 56 14 C65 20 76 32 78 50 C80 68 64 85 45 90Z" fill="white" fillOpacity="0.08"/>
          <path d="M45 90 C26 85 10 68 12 50 C14 32 25 20 34 14 C39 10 43 4 45 1 C47 4 51 10 56 14 C65 20 76 32 78 50 C80 68 64 85 45 90Z" stroke="white" strokeOpacity="0.13" strokeWidth="0.8"/>
          <path d="M30 18 C27 10 30 3 34 0 C34 7 32 14 30 18Z" fill="white" fillOpacity="0.1"/>
          <path d="M60 18 C63 10 60 3 56 0 C56 7 58 14 60 18Z" fill="white" fillOpacity="0.1"/>
          <path d="M14 38 C6 33 2 24 4 18 C10 23 13 32 14 38Z" fill="white" fillOpacity="0.09"/>
          <ellipse cx="22" cy="6" rx="3" ry="5" fill="white" fillOpacity="0.1"/>
          <ellipse cx="68" cy="6" rx="3" ry="5" fill="white" fillOpacity="0.1"/>
          <ellipse cx="4" cy="26" rx="2.5" ry="4" fill="white" fillOpacity="0.08"/>
        </svg>

        {/* Splash 4 — lower left, wide flat */}
        <svg className={`${styles.splash} ${styles.splash4}`} viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M90 100 C55 96 20 78 14 56 C8 34 22 18 38 10 C52 4 68 0 90 0 C112 0 128 4 142 10 C158 18 172 34 166 56 C160 78 125 96 90 100Z" fill="white" fillOpacity="0.05"/>
          <path d="M90 100 C55 96 20 78 14 56 C8 34 22 18 38 10 C52 4 68 0 90 0 C112 0 128 4 142 10 C158 18 172 34 166 56 C160 78 125 96 90 100Z" stroke="white" strokeOpacity="0.09" strokeWidth="1"/>
          <path d="M30 14 C22 6 20 -2 24 -6 C26 2 28 10 30 14Z" fill="white" fillOpacity="0.07" transform="translate(0,6)"/>
          <path d="M150 14 C158 6 160 -2 156 -6 C154 2 152 10 150 14Z" fill="white" fillOpacity="0.07" transform="translate(0,6)"/>
          <path d="M8 50 C-2 44 -6 34 -2 26 C6 34 8 44 8 50Z" fill="white" fillOpacity="0.07"/>
          <path d="M172 50 C182 44 186 34 182 26 C174 34 172 44 172 50Z" fill="white" fillOpacity="0.07"/>
          <ellipse cx="14" cy="20" rx="5" ry="7" fill="white" fillOpacity="0.07"/>
          <ellipse cx="166" cy="20" rx="5" ry="7" fill="white" fillOpacity="0.07"/>
          <ellipse cx="90" cy="106" rx="8" ry="5" fill="white" fillOpacity="0.06"/>
        </svg>

        {/* Splash 5 — centre top, tiny droplet cluster */}
        <svg className={`${styles.splash} ${styles.splash5}`} viewBox="0 0 70 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M35 72 C20 67 8 54 9 40 C10 26 18 16 25 10 C29 7 33 2 35 0 C37 2 41 7 45 10 C52 16 60 26 61 40 C62 54 50 67 35 72Z" fill="white" fillOpacity="0.09"/>
          <path d="M35 72 C20 67 8 54 9 40 C10 26 18 16 25 10 C29 7 33 2 35 0 C37 2 41 7 45 10 C52 16 60 26 61 40 C62 54 50 67 35 72Z" stroke="white" strokeOpacity="0.14" strokeWidth="0.7"/>
          <path d="M22 13 C19 6 22 0 25 -2 C25 5 24 10 22 13Z" fill="white" fillOpacity="0.11" transform="translate(0,2)"/>
          <path d="M48 13 C51 6 48 0 45 -2 C45 5 46 10 48 13Z" fill="white" fillOpacity="0.11" transform="translate(0,2)"/>
          <ellipse cx="14" cy="10" rx="3" ry="4.5" fill="white" fillOpacity="0.1"/>
          <ellipse cx="56" cy="10" rx="3" ry="4.5" fill="white" fillOpacity="0.1"/>
          <ellipse cx="35" cy="-2" rx="2.5" ry="3.5" fill="white" fillOpacity="0.12" transform="translate(0,2)"/>
          <ellipse cx="6" cy="30" rx="2" ry="3" fill="white" fillOpacity="0.08"/>
          <ellipse cx="64" cy="30" rx="2" ry="3" fill="white" fillOpacity="0.08"/>
        </svg>

        {/* Splash 6 — lower right, elongated */}
        <svg className={`${styles.splash} ${styles.splash6}`} viewBox="0 0 100 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 130 C28 124 10 104 12 78 C14 52 26 34 37 22 C43 16 48 6 50 2 C52 6 57 16 63 22 C74 34 86 52 88 78 C90 104 72 124 50 130Z" fill="white" fillOpacity="0.07"/>
          <path d="M50 130 C28 124 10 104 12 78 C14 52 26 34 37 22 C43 16 48 6 50 2 C52 6 57 16 63 22 C74 34 86 52 88 78 C90 104 72 124 50 130Z" stroke="white" strokeOpacity="0.11" strokeWidth="0.9"/>
          <path d="M34 26 C30 15 33 6 37 2 C37 10 36 20 34 26Z" fill="white" fillOpacity="0.09"/>
          <path d="M66 26 C70 15 67 6 63 2 C63 10 64 20 66 26Z" fill="white" fillOpacity="0.09"/>
          <path d="M14 60 C4 54 -2 42 0 34 C8 40 12 52 14 60Z" fill="white" fillOpacity="0.08"/>
          <path d="M86 60 C96 54 102 42 100 34 C92 40 88 52 86 60Z" fill="white" fillOpacity="0.08"/>
          <ellipse cx="24" cy="10" rx="3.5" ry="5.5" fill="white" fillOpacity="0.09"/>
          <ellipse cx="76" cy="10" rx="3.5" ry="5.5" fill="white" fillOpacity="0.09"/>
          <ellipse cx="4" cy="46" rx="2.5" ry="4" fill="white" fillOpacity="0.07"/>
          <ellipse cx="96" cy="46" rx="2.5" ry="4" fill="white" fillOpacity="0.07"/>
        </svg>

      </div>

      {/* Orange radial glow */}
      <div className={styles.glow} aria-hidden="true" />

      {/* Large decorative background text */}
      <div className={`hero-bg-text ${styles.bgText}`} aria-hidden="true">
        <span className={styles.bgWord}>EAT.</span>
        <span className={`${styles.bgWord} ${styles.bgWordAccent}`}>DIFF<span className={styles.bgWordOutline}>ERENT.</span></span>
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
