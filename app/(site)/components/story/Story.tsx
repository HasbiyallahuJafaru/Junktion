'use client'

import { useRef } from 'react'
import { useScrollReveal } from '@/app/hooks/useScrollReveal'
import styles from './Story.module.css'

const STATS = [
  { value: '5★',  label: 'Avg rating' },
  { value: '18',  label: 'Menu items' },
  { value: '1',   label: 'Kaduna spot' },
]

/** Story / About section — brand narrative + stats row, with scroll reveal. */
export function Story() {
  const ref = useRef<HTMLElement>(null)

  useScrollReveal(ref, [`.${styles.eyebrow}`, `.${styles.heading}`], {
    y: 36, stagger: 0.1, start: 'top 80%',
  })

  useScrollReveal(ref, [`.${styles.body}`, `.${styles.stats}`], {
    y: 40, stagger: 0.14, start: 'top 78%',
  })

  return (
    <section ref={ref} id="story" className={styles.section} aria-label="Our story">
      <div className={styles.rule} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.left}>
          <p className={styles.eyebrow}>Our Story</p>
          <h2 className={styles.heading}>
            We cook it<br />
            <span className={styles.accent}>different.</span>
          </h2>
        </div>

        <div className={styles.right}>
          <p className={styles.body}>
            Junktion started as one idea: Kaduna deserves better junk food.
            Not the kind you forget. The kind you tell people about.
          </p>
          <p className={styles.body}>
            Everything on the menu is made to hit. Shawarma you can&apos;t
            put down. Fries that are actually loaded. Wings that show up
            hot, every time. That&apos;s what we&apos;re here for.
          </p>

          <div className={styles.stats}>
            {STATS.map((s) => (
              <div key={s.label} className={styles.stat}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
