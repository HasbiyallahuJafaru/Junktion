'use client'

import {
  createContext, useContext, useState, useCallback,
  useEffect, type ReactNode,
} from 'react'

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'owner' | 'cashier'
  mustChangePassword?: boolean
}

interface AdminAuthState {
  accessToken: string | null
  user: AdminUser | null
  isLoading: boolean
}

interface AdminAuthContextValue extends AdminAuthState {
  login: (token: string, user: AdminUser) => void
  logout: () => Promise<void>
  /** Fetch with auto-refresh on 401 */
  authFetch: (url: string, init?: RequestInit) => Promise<Response>
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminAuthState>({
    accessToken: null,
    user:        null,
    isLoading:   true,
  })

  /** On mount, try to restore session via refresh token cookie */
  useEffect(() => {
    async function restore() {
      try {
        const res = await fetch('/api/auth/refresh', { method: 'POST' })
        if (res.ok) {
          const data = await res.json()
          setState({ accessToken: data.accessToken, user: data.user ?? null, isLoading: false })
        } else {
          setState((s) => ({ ...s, isLoading: false }))
        }
      } catch {
        setState((s) => ({ ...s, isLoading: false }))
      }
    }
    restore()
  }, [])

  const login = useCallback((token: string, user: AdminUser) => {
    setState({ accessToken: token, user, isLoading: false })
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setState({ accessToken: null, user: null, isLoading: false })
  }, [])

  const authFetch = useCallback(async (url: string, init: RequestInit = {}): Promise<Response> => {
    const doFetch = (token: string) =>
      fetch(url, {
        ...init,
        headers: {
          ...init.headers,
          Authorization: `Bearer ${token}`,
        },
      })

    let res = await doFetch(state.accessToken ?? '')

    if (res.status === 401) {
      const refresh = await fetch('/api/auth/refresh', { method: 'POST' })
      if (refresh.ok) {
        const { accessToken } = await refresh.json()
        setState((s) => ({ ...s, accessToken }))
        res = await doFetch(accessToken)
      }
    }

    return res
  }, [state.accessToken])

  return (
    <AdminAuthContext.Provider value={{ ...state, login, logout, authFetch }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider')
  return ctx
}
