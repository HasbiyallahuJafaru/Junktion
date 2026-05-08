'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, Menu, X } from 'lucide-react'
import { useCart } from '@/app/context/CartContext'

const navLinks = [
  { label: 'Menu',      href: '#menu' },
  { label: 'Our Story', href: '#story' },
  { label: 'Contact',   href: '#contact' },
]

/**
 * Nav — fixed top navigation bar for the public site.
 *
 * Behaviour:
 * - Transparent on load; gains `bg-base/95 backdrop-blur-sm` after 80px scroll.
 * - Desktop: wordmark left, links centre-right, cart + no hamburger.
 * - Mobile: wordmark left, cart + hamburger right; hamburger opens full-screen overlay.
 * - Cart badge shows item count (capped display at "9+").
 */
export function Nav() {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { itemCount, openDrawer }   = useCart()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          scrolled
            ? 'bg-base/95 backdrop-blur-sm border-b border-surface-2'
            : 'bg-transparent'
        }`}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between px-6 md:px-12 h-16">
          {/* Wordmark */}
          <a
            href="/"
            className="font-display font-bold text-lg tracking-[0.15em] text-text-primary uppercase"
            aria-label="Junktion — home"
          >
            Junktion
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-body text-sm font-medium text-text-muted hover:text-text-primary transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={openDrawer}
              className="relative flex items-center justify-center w-10 h-10 text-text-primary hover:text-orange transition-colors"
              aria-label={`Open cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange rounded-full flex items-center justify-center text-[10px] font-display font-bold text-white">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 text-text-primary"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[150] bg-base flex flex-col">
          <div className="flex items-center justify-between px-6 h-16 border-b border-surface-2">
            <span className="font-display font-bold text-lg tracking-[0.15em] text-text-primary uppercase">
              Junktion
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center w-10 h-10 text-text-primary"
              aria-label="Close menu"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          <nav
            className="flex flex-col justify-center flex-1 px-8 gap-8"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-display font-bold text-4xl text-text-primary hover:text-orange transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="px-8 pb-12">
            <p className="font-body text-sm text-text-muted tracking-wider uppercase">
              Kaduna, Nigeria
            </p>
          </div>
        </div>
      )}
    </>
  )
}
