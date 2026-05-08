'use client'

import styles from './Marquee.module.css'

const ITEMS = [
  'Shawarma',
  'Loaded Burgers',
  'Jollof Pasta',
  'Peppered Rice',
  'Crispy Sides',
  'Cold Drinks',
  'Eat. Different.',
  'Kaduna\'s Finest',
]

/** Single row of text — duplicated to create seamless loop */
function Track({ reverse = false }: { reverse?: boolean }) {
  const doubled = [...ITEMS, ...ITEMS]
  return (
    <div className={`${styles.track} ${reverse ? styles.trackReverse : ''}`}>
      {doubled.map((item, i) => (
        <span key={i} className={styles.item}>
          {item}
          <span className={styles.dot} aria-hidden="true">●</span>
        </span>
      ))}
    </div>
  )
}

/**
 * Marquee — two rows scrolling in opposite directions.
 * Pure CSS animation, no JS required.
 */
export function Marquee() {
  return (
    <section
      className={`${styles.marquee} relative overflow-hidden`}
      aria-label="Menu highlights"
    >
      {/* Top-edge fade */}
      <div className={styles.fadeTop} aria-hidden="true" />

      <Track />
      <Track reverse />

      {/* Bottom-edge fade */}
      <div className={styles.fadeBottom} aria-hidden="true" />
    </section>
  )
}
