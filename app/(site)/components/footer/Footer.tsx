import styles from './Footer.module.css'

const LINKS = [
  { label: 'Menu',    href: '#menu' },
  { label: 'Story',   href: '#story' },
  { label: 'Find Us', href: '#contact' },
]

/** Site footer */
export function Footer() {
  return (
    <footer className={styles.footer} aria-label="Site footer">
      <div className={styles.inner}>
        {/* Top row */}
        <div className={styles.top}>
          <span className={styles.wordmark}>Junktion</span>
          <nav className={styles.nav} aria-label="Footer navigation">
            {LINKS.map((l) => (
              <a key={l.label} href={l.href} className={styles.navLink}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className={styles.divider} aria-hidden="true" />

        {/* Bottom row */}
        <div className={styles.bottom}>
          <p className={styles.tagline}>Eat. Different.</p>
          <p className={styles.copy}>© 2025 Junktion LTD · Kaduna, Nigeria</p>
        </div>
      </div>
    </footer>
  )
}
