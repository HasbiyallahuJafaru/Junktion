'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Menu, X } from 'lucide-react'
import { useCart } from '@/app/context/CartContext'
import styles from './Nav.module.css'

const navLinks = [
  { label: 'Menu',      href: '#menu' },
  { label: 'Our Story', href: '#story' },
  { label: 'Find Us',   href: '#contact' },
]

/**
 * Nav — fixed top bar styled after the reference design:
 * logo mark + wordmark left, all-caps links centre-right,
 * orange "• Order Now" pill far right.
 */
export function Nav() {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [trackOpen, setTrackOpen]   = useState(false)
  const [ref, setRef]               = useState('')
  const { itemCount, openDrawer }   = useCart()
  const router                      = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = ref.trim()
    if (trimmed) { setTrackOpen(false); setRef(''); router.push(`/track/${trimmed}`) }
  }

  return (
    <>
      <nav
        className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}
        aria-label="Main navigation"
      >
        <div className={styles.inner}>
          {/* Logo mark + wordmark */}
          <a href="/" className={styles.brand} aria-label="Junktion — home">
            <Image
              src="/logo.png"
              alt="Junktion logo"
              width={48}
              height={48}
              className={styles.logoImg}
              priority
            />
            <span className={styles.wordmark}>Junktion</span>
          </a>

          {/* Desktop links */}
          <div className={styles.links}>
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className={styles.link}>
                {link.label}
              </a>
            ))}
            <button onClick={() => setTrackOpen(true)} className={styles.link}>
              Track Order
            </button>
            <a href="/admin/orders" className={styles.adminLink}>Admin</a>
          </div>

          {/* Right actions */}
          <div className={styles.actions}>
            {/* Cart */}
            <button
              onClick={openDrawer}
              className={styles.cartBtn}
              aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className={styles.cartBadge}>
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Order Now CTA */}
            <a href="#menu" className={styles.orderBtn}>
              <span className={styles.orderDot} aria-hidden="true" />
              Order Now
            </a>

            {/* Mobile hamburger */}
            <button
              className={styles.hamburger}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className={styles.mobileOverlay}>
          <div className={styles.mobileHeader}>
            <a href="/" className={styles.brand} onClick={() => setMobileOpen(false)}>
              <Image src="/logo.png" alt="" width={44} height={44} className={styles.logoImg} />
              <span className={styles.wordmark}>Junktion</span>
            </a>
            <button onClick={() => setMobileOpen(false)} className={styles.closeBtn} aria-label="Close">
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          <nav className={styles.mobileLinks} aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={styles.mobileLink}
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => { setMobileOpen(false); setTrackOpen(true) }}
              className={styles.mobileLink}
            >
              Track Order
            </button>
          </nav>

          <div className={styles.mobileFooter}>
            <a href="#menu" className={styles.orderBtn} onClick={() => setMobileOpen(false)}>
              <span className={styles.orderDot} aria-hidden="true" />
              Order Now
            </a>
            <a href="/admin/orders" className={styles.adminLink}>Admin →</a>
          </div>
        </div>
      )}

      {/* Track order modal */}
      {trackOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setTrackOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Track your order"
        >
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
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
            <button className={styles.modalClose} onClick={() => setTrackOpen(false)} aria-label="Close">✕</button>
          </div>
        </div>
      )}
    </>
  )
}
