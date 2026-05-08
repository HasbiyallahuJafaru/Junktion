import { MapPin, Phone, Clock } from 'lucide-react'
import styles from './Contact.module.css'

/** Contact / Find Us section */
export function Contact() {
  return (
    <section id="contact" className={styles.section} aria-label="Find us">
      <div className={styles.inner}>
        {/* Left — heading */}
        <div className={styles.left}>
          <p className={styles.eyebrow}>Find Us</p>
          <h2 className={styles.heading}>
            Come eat.<br />
            <span className={styles.accent}>We&apos;re always on.</span>
          </h2>
        </div>

        {/* Right — details */}
        <div className={styles.right}>
          <div className={styles.detail}>
            <MapPin size={18} strokeWidth={1.5} className={styles.icon} />
            <div>
              <p className={styles.detailMain}>C10 Surame Road U/Rimi,</p>
              <p className={styles.detailMain}>GRA, Kaduna State</p>
            </div>
          </div>

          <div className={styles.detail}>
            <Phone size={18} strokeWidth={1.5} className={styles.icon} />
            <div>
              <p className={styles.detailMain}>07048785688</p>
              <p className={styles.detailMain}>08088883561</p>
            </div>
          </div>

          <div className={styles.detail}>
            <Clock size={18} strokeWidth={1.5} className={styles.icon} />
            <p className={styles.detailMain}>Open daily · 10am – 10pm</p>
          </div>

          <div className={styles.detail}>
            <span className={styles.igIcon} aria-hidden="true">IG</span>
            <a
              href="https://instagram.com/junktionkd"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              @junktionkd
            </a>
          </div>

          {/* Order CTA */}
          <a href="#menu" className={styles.orderBtn}>
            Order Now ↑
          </a>
        </div>
      </div>
    </section>
  )
}
