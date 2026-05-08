import type { Metadata } from 'next'
import { CartProvider } from '@/app/context/CartContext'

export const metadata: Metadata = {
  title: 'Junktion — Eat. Different.',
  description: 'Premium street food in Kaduna, Nigeria. Order shawarma, pasta, rice and more online.',
  openGraph: {
    title: 'Junktion — Eat. Different.',
    description: 'Premium street food in Kaduna, Nigeria.',
    type: 'website',
  },
}

/**
 * Site layout — wraps all public-facing pages in the CartProvider.
 * No html/body here; those live in the root app/layout.tsx.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  )
}
