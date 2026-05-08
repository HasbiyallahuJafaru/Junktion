'use client'

import { useRef } from 'react'
import { useScrollReveal } from '@/app/hooks/useScrollReveal'
import styles from './Contact.module.css'

function IconLocation() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.icon} aria-hidden="true">
      <path d="M10 1.667A5.833 5.833 0 0 1 15.833 7.5c0 4.375-5.833 10.833-5.833 10.833S4.167 11.875 4.167 7.5A5.833 5.833 0 0 1 10 1.667Z" stroke="#F15A22" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="10" cy="7.5" r="2" fill="#F15A22"/>
    </svg>
  )
}

function IconPhone() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.icon} aria-hidden="true">
      <path d="M3.333 3.333h3.334l1.666 4.167-2.083 1.25a9.167 9.167 0 0 0 4.167 4.167l1.25-2.084 4.166 1.667v3.333A1.667 1.667 0 0 1 14.167 17.5C7.073 17.5 2.5 12.927 2.5 5.833a1.667 1.667 0 0 1 .833-1.5Z" stroke="#F15A22" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}

function IconClock() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.icon} aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="#F15A22" strokeWidth="1.5"/>
      <path d="M10 5.833V10l2.917 2.083" stroke="#F15A22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconInstagram() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.icon} aria-hidden="true">
      <rect x="2.5" y="2.5" width="15" height="15" rx="4.5" stroke="#F15A22" strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="3.333" stroke="#F15A22" strokeWidth="1.5"/>
      <circle cx="14.583" cy="5.417" r="0.833" fill="#F15A22"/>
    </svg>
  )
}

export function Contact() {
  const ref = useRef<HTMLElement>(null)

  useScrollReveal(ref, [`.${styles.eyebrow}`, `.${styles.heading}`], {
    y: 36, stagger: 0.1, start: 'top 82%',
  })

  useScrollReveal(ref, [`.${styles.detail}`, `.${styles.orderBtn}`], {
    y: 32, stagger: 0.1, start: 'top 80%',
  })

  return (
    <section ref={ref} id="contact" className={styles.section} aria-label="Find us">
      <div className={styles.inner}>
        <div className={styles.left}>
          <p className={styles.eyebrow}>Find Us</p>
          <h2 className={styles.heading}>
            Come eat.<br />
            <span className={styles.accent}>We&apos;re always on.</span>
          </h2>
        </div>

        <div className={styles.right}>
          <div className={styles.detail}>
            <IconLocation />
            <div>
              <p className={styles.detailMain}>C10 Surame Road U/Rimi,</p>
              <p className={styles.detailMain}>GRA, Kaduna State</p>
            </div>
          </div>

          <div className={styles.detail}>
            <IconPhone />
            <div>
              <p className={styles.detailMain}>07048785688</p>
              <p className={styles.detailMain}>08088883561</p>
            </div>
          </div>

          <div className={styles.detail}>
            <IconClock />
            <p className={styles.detailMain}>Open daily · 10am – 10pm</p>
          </div>

          <div className={styles.detail}>
            <IconInstagram />
            <a
              href="https://instagram.com/junktionkd"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              @junktionkd
            </a>
          </div>

          <a href="#menu" className={styles.orderBtn}>Order Now ↑</a>
        </div>
      </div>
    </section>
  )
}
