import styles from './Story.module.css'

const STATS = [
  { value: '5★',  label: 'Avg rating' },
  { value: '18',  label: 'Menu items' },
  { value: '1',   label: 'Kaduna spot' },
]

/** Story / About section — brand narrative + stats row */
export function Story() {
  return (
    <section id="story" className={styles.section} aria-label="Our story">
      {/* Decorative vertical rule */}
      <div className={styles.rule} aria-hidden="true" />

      <div className={styles.inner}>
        {/* Left col — eyebrow + headline */}
        <div className={styles.left}>
          <p className={styles.eyebrow}>Our Story</p>
          <h2 className={styles.heading}>
            We cook it<br />
            <span className={styles.accent}>different.</span>
          </h2>
        </div>

        {/* Right col — body + stats */}
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

          {/* Stats */}
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
