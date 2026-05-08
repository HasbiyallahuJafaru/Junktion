'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './BlockTransition.module.css'

interface BlockTransitionProps {
  bg:   string  // colour above
  fill: string  // colour below
}

/** Geometric block-assembly transition between two sections. */
export function BlockTransition({ bg, fill }: BlockTransitionProps) {
  const ref           = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`${styles.wrap} ${vis ? styles.wrapVisible : ''}`}
      style={{ background: bg }}
      aria-hidden="true"
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={styles.block}
          style={{
            background: fill,
            '--i': i,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
