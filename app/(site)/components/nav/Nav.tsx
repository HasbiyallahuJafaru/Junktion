'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Menu, X } from 'lucide-react'
import { useCart } from '@/app/context/CartContext'

const navLinks = [
  { label: 'Menu',      href: '#menu' },
  { label: 'Our Story', href: '#story' },
  { label: 'Contact',   href: '#contact' },
]

/**
 * Nav — fixed top bar with scroll transparency, cart, track-order modal,
 * Order Now CTA, and a subtle Admin link.
 */
export function Nav() {
  const [scrolled, setScrolled]       = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [trackOpen, setTrackOpen]     = useState(false)
  const [ref, setRef]                 = useState('')
  const { itemCount, openDrawer }     = useCart()
  const router                        = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
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
    if (trimmed) {
      setTrackOpen(false)
      setRef('')
      router.push(`/track/${trimmed}`)
    }
  }

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
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-body text-sm font-medium text-text-muted hover:text-text-primary transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => setTrackOpen(true)}
              className="font-body text-sm font-medium text-text-muted hover:text-orange transition-colors duration-200"
            >
              Track Order
            </button>
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Subtle admin link */}
            <a
              href="/admin/orders"
              className="font-body text-xs font-medium text-[#3A3A3A] hover:text-text-muted transition-colors duration-200 tracking-wider"
            >
              Admin
            </a>

            {/* Cart */}
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

            {/* Order Now CTA */}
            <a
              href="#menu"
              className="font-body text-sm font-semibold text-base bg-transparent border border-text-primary/20 hover:border-orange hover:text-orange text-text-primary px-5 py-2 rounded-full transition-all duration-200"
            >
              Order Now
            </a>
          </div>

          {/* Mobile right */}
          <div className="flex md:hidden items-center gap-2">
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
            <button
              className="flex items-center justify-center w-10 h-10 text-text-primary"
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
            <button
              onClick={() => { setMobileOpen(false); setTrackOpen(true) }}
              className="font-display font-bold text-4xl text-left text-text-primary hover:text-orange transition-colors"
            >
              Track Order
            </button>
          </nav>

          <div className="px-8 pb-12 flex items-center justify-between">
            <p className="font-body text-sm text-text-muted tracking-wider uppercase">
              Kaduna, Nigeria
            </p>
            <a
              href="/admin/orders"
              className="font-body text-xs text-[#3A3A3A] hover:text-text-muted transition-colors"
            >
              Admin
            </a>
          </div>
        </div>
      )}

      {/* Track order modal */}
      {trackOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-5"
          onClick={() => setTrackOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Track your order"
        >
          <div
            className="relative bg-[#111] border border-[#1F1F1F] rounded-2xl p-8 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-body text-xs font-medium tracking-[0.12em] uppercase text-[#6B6760] mb-4">
              Track your order
            </p>
            <form onSubmit={handleTrack} className="flex gap-2">
              <input
                className="flex-1 font-body text-sm text-text-primary bg-base border border-[#2A2A2A] rounded-lg px-4 py-3 outline-none focus:border-orange transition-colors placeholder:text-[#3A3A3A]"
                placeholder="e.g. JNK-A3F9"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                className="font-body text-sm font-semibold text-[#0D0D0D] bg-orange hover:bg-[#FF6A2F] rounded-lg px-5 py-3 transition-colors"
              >
                Go →
              </button>
            </form>
            <button
              className="absolute top-3 right-4 text-xs text-[#3A3A3A] hover:text-[#6B6760] transition-colors"
              onClick={() => setTrackOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  )
}
