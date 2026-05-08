'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAdminAuth } from '@/app/context/AdminAuthContext'
import styles from './Login.module.css'

/** Admin login page — email + password, wires into AdminAuthContext */
export default function LoginPage() {
  const router       = useRouter()
  const params       = useSearchParams()
  const { login, user, isLoading } = useAdminAuth()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [busy, setBusy]         = useState(false)

  // Already authenticated — redirect
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
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Login failed.')
        return
      }

      login(data.accessToken, data.user)
      router.replace(params.get('from') ?? '/admin/orders')
    } catch {
      setError('Network error — check your connection.')
    } finally {
      setBusy(false)
    }
  }

  if (isLoading) return null

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.wordmark}>Junktion</span>
          <span className={styles.badge}>Admin</span>
        </div>

        <h1 className={styles.heading}>Sign in</h1>

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
  )
}
