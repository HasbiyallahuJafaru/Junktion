import type { Metadata } from 'next'
import { CartProvider } from '@/app/context/CartContext'
import { DrawerMount } from '@/app/(site)/components/order/DrawerMount'

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
 * Site layout — wraps all public-facing pages in CartProvider.
 * DrawerMount renders the cart drawer globally (outside the page scroll).
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <DrawerMount />
    </CartProvider>
  )
}
