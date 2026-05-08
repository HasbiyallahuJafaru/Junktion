import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Junktion — Eat. Different.',
  description: 'Premium street food in Kaduna, Nigeria.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
