import { useEffect, RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface Options {
  /** Pixels to travel upward on reveal (default 48) */
  y?: number
  /** Stagger between each matched element (default 0.12) */
  stagger?: number
  /** ScrollTrigger start position (default "top 82%") */
  start?: string
  /** Animation duration in seconds (default 0.75) */
  duration?: number
}

/**
 * Fade-up reveal for elements matching `selectors` inside `containerRef`.
 * Uses GSAP context for clean StrictMode-safe cleanup.
 */
export function useScrollReveal(
  containerRef: RefObject<HTMLElement>,
  selectors: string[],
  options: Options = {}
) {
  useEffect(() => {
    if (!containerRef.current) return

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.from(selectors, {
        y:          options.y        ?? 48,
        opacity:    0,
        duration:   options.duration ?? 0.75,
        ease:       'power2.out',
        stagger:    options.stagger  ?? 0.12,
        scrollTrigger: {
          trigger: containerRef.current,
          start:   options.start ?? 'top 82%',
          once:    true,
        },
      })
    }, containerRef)

    return () => {
      try { ctx.revert() } catch (_) { /* StrictMode double-invoke */ }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
