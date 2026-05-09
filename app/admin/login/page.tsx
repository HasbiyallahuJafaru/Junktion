'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAdminAuth } from '@/app/context/AdminAuthContext'
import styles from './Login.module.css'

const NAV_LINKS = [
  { label: 'Menu',      href: '/#menu' },
  { label: 'Our Story', href: '/#story' },
  { label: 'Find Us',   href: '/#contact' },
  { label: 'Track Order', href: '/#track' },
]

/** Inner component that reads search params — must be inside Suspense */
function LoginForm() {
  const router       = useRouter()
  const params       = useSearchParams()
  const { login, user, isLoading } = useAdminAuth()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [busy, setBusy]         = useState(false)

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(params.get('from') ?? '/admin/orders')
    }
  }, [isLoading, user, router, params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)

    try {
      const res = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      })

      let data: { error?: string; accessToken?: string; user?: { id: string; name: string; email: string; role: 'owner' | 'cashier'; mustChangePassword?: boolean } }
      try {
        data = await res.json()
      } catch {
        setError(`Server error (HTTP ${res.status}) — check Netlify function logs.`)
        return
      }

      if (!res.ok) {
        setError(data.error ?? 'Login failed.')
        return
      }

      login(data.accessToken!, data.user!)
      router.replace(params.get('from') ?? '/admin/orders')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(`Request failed: ${msg}`)
    } finally {
      setBusy(false)
    }
  }

  if (isLoading) return null

  return (
    <div className={styles.page}>
      {/* Top header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerBrand}>
            <span className={styles.wordmark}>Junktion</span>
            <span className={styles.badge}>Admin</span>
          </div>

          <nav className={styles.headerNav} aria-label="Site navigation">
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={label} href={href} className={styles.headerNavItem}>
                {label}
              </Link>
            ))}
          </nav>

          <Link href="/" className={styles.backLink}>← Back to site</Link>
        </div>
      </header>

      {/* Login card */}
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.heading}>Sign in</h1>
          <p className={styles.sub}>Sign in to access the Junktion admin dashboard.</p>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <label className={styles.label}>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="admin@junktion.ng"
                autoComplete="email"
                required
                disabled={busy}
              />
            </label>

            <label className={styles.label}>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                disabled={busy}
              />
            </label>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" disabled={busy} className={styles.btn}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

/** Admin login page — wrapped in Suspense for useSearchParams */
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
