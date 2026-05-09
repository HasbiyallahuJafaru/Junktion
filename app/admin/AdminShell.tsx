'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  ShoppingBag, UtensilsCrossed, CreditCard,
  Users, BarChart2, LogOut,
} from 'lucide-react'
import { useAdminAuth } from '@/app/context/AdminAuthContext'
import styles from './AdminShell.module.css'

const NAV = [
  { href: '/admin/orders',    label: 'Orders',    icon: ShoppingBag,     roles: ['owner', 'cashier'] },
  { href: '/admin/menu',      label: 'Menu',      icon: UtensilsCrossed, roles: ['owner'] },
  { href: '/admin/accounts',  label: 'Accounts',  icon: CreditCard,      roles: ['owner'] },
  { href: '/admin/users',     label: 'Users',     icon: Users,           roles: ['owner'] },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2,       roles: ['owner'] },
]

/**
 * AdminShell — wraps all admin pages.
 * Redirects to /admin/login if not authenticated.
 * Shows sidebar on desktop, bottom bar on mobile.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAdminAuth()
  const pathname  = usePathname()
  const router    = useRouter()
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (!isLoading && !user && !isLoginPage) {
      router.replace(`/admin/login?from=${pathname}`)
    }
  }, [isLoading, user, isLoginPage, pathname, router])

  // Login page — render bare (no shell)
  if (isLoginPage) return <>{children}</>

  // Loading — blank screen while session restores
  if (isLoading || !user) return (
    <div className={styles.loadingScreen}>
      <span className={styles.loadingDot} />
      <span className={styles.loadingDot} />
      <span className={styles.loadingDot} />
    </div>
  )

  const visibleNav = NAV.filter((n) => n.roles.includes(user.role))

  const handleLogout = async () => {
    await logout()
    router.replace('/admin/login')
  }

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.brand}>
            <span className={styles.wordmark}>Junktion</span>
            <span className={styles.roleBadge}>{user.role}</span>
          </div>

          <nav className={styles.nav}>
            {visibleNav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`${styles.navItem} ${pathname.startsWith(href) ? styles.navItemActive : ''}`}
  
              >
                <Icon size={17} strokeWidth={1.5} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.name}</span>
            <span className={styles.userEmail}>{user.email}</span>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn} aria-label="Sign out">
            <LogOut size={16} strokeWidth={1.5} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={styles.main}>
        {/* Mobile top bar */}
        <header className={styles.mobileBar}>
          <span className={styles.mobileWordmark}>Junktion Admin</span>
          <button onClick={handleLogout} className={styles.logoutText} aria-label="Sign out">
            Logout
          </button>
        </header>

        {/* Must-change-password banner */}
        {user.mustChangePassword && (
          <div className={styles.pwBanner}>
            Your password needs to be changed.{' '}
            <a href="/admin/users" className={styles.pwLink}>Update it here →</a>
          </div>
        )}

        <div className={styles.content}>
          {children}
        </div>
      </div>

      {/* Mobile bottom tab bar — always visible nav */}
      <nav className={styles.bottomBar} aria-label="Admin navigation">
        {visibleNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.bottomTab} ${pathname.startsWith(href) ? styles.bottomTabActive : ''}`}
          >
            <Icon size={20} strokeWidth={1.5} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
