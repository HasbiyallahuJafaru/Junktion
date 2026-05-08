import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Junktion — Eat. Different.',
  description: 'Premium street food in Kaduna, Nigeria.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Junktion — Eat. Different.',
    description: 'Premium street food in Kaduna, Nigeria. Order shawarma, pasta, rice and more online.',
    type: 'website',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'Junktion' }],
  },
  twitter: {
    card: 'summary',
    title: 'Junktion — Eat. Different.',
    description: 'Premium street food in Kaduna, Nigeria.',
    images: ['/logo.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="bg-base text-text-body font-body antialiased overflow-x-hidden" suppressHydrationWarning>
        <div className="grain-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  )
}
