'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Power, X, KeyRound } from 'lucide-react'
import { useAdminAuth } from '@/app/context/AdminAuthContext'
import styles from './Users.module.css'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'owner' | 'cashier'
  isActive: boolean
  mustChangePassword: boolean
  lastLoginAt: string | null
  createdAt: string
}

// ── Create user drawer ────────────────────────────────────────────────────────

interface CreateDrawerProps {
  open: boolean
  token: string | null
  onClose: () => void
  onCreated: (user: AdminUser) => void
}

function CreateDrawer({ open, token, onClose, onCreated }: CreateDrawerProps) {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    if (open) { setName(''); setEmail(''); setPassword(''); setError('') }
  }, [open])

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password) { setError('All fields are required'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email, password, role: 'cashier' }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to create user')
      } else {
        onCreated(await res.json())
      }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {open && <div className={styles.backdrop} onClick={onClose} />}
      <div className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <div>
            <div className={styles.drawerTitle}>New Staff Account</div>
            <div className={styles.drawerSubtitle}>Role: Cashier — can view and update orders</div>
          </div>
          <button onClick={onClose} className={styles.closeBtn}><X size={18} /></button>
        </div>

        <div className={styles.drawerBody}>
          <div className={styles.field}>
            <label className={styles.label}>Full name</label>
            <input className={styles.input} value={name}
              onChange={e => setName(e.target.value)} placeholder="e.g. Aisha Bello" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="aisha@junktion.ng" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Temporary password</label>
            <input className={styles.input} type="password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" />
            <span className={styles.hint}>
              Staff will be prompted to change this on first login.
            </span>
          </div>
          {error && <div className={styles.formError}>{error}</div>}
        </div>

        <div className={styles.drawerFooter}>
          <button onClick={onClose} className={styles.cancelBtn}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className={styles.submitBtn}>
            {saving ? 'Creating…' : 'Create account'}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Edit / reset password drawer ──────────────────────────────────────────────

interface EditDrawerProps {
  open: boolean
  user: AdminUser | null
  token: string | null
  onClose: () => void
  onUpdated: (user: AdminUser) => void
}

function EditDrawer({ open, user, token, onClose, onUpdated }: EditDrawerProps) {
  const [name, setName]         = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    if (open && user) { setName(user.name); setPassword(''); setError('') }
  }, [open, user])

  const handleSubmit = async () => {
    if (!user) return
    const body: Record<string, string> = {}
    if (name.trim() && name !== user.name) body.name = name
    if (password) body.password = password
    if (!Object.keys(body).length) { onClose(); return }

    setSaving(true); setError('')
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to update')
      } else {
        onUpdated(await res.json())
      }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {open && <div className={styles.backdrop} onClick={onClose} />}
      <div className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <div>
            <div className={styles.drawerTitle}>Edit User</div>
            {user && <div className={styles.drawerSubtitle}>{user.email}</div>}
          </div>
          <button onClick={onClose} className={styles.closeBtn}><X size={18} /></button>
        </div>

        <div className={styles.drawerBody}>
          <div className={styles.field}>
            <label className={styles.label}>Name</label>
            <input className={styles.input} value={name}
              onChange={e => setName(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>New password</label>
            <input className={styles.input} type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Leave blank to keep current" />
            <span className={styles.hint}>
              Setting a new password will clear the "must change password" flag.
            </span>
          </div>
          {error && <div className={styles.formError}>{error}</div>}
        </div>

        <div className={styles.drawerFooter}>
          <button onClick={onClose} className={styles.cancelBtn}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className={styles.submitBtn}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { accessToken: token, user: self } = useAdminAuth()

  const [userList, setUserList]       = useState<AdminUser[]>([])
  const [loading, setLoading]         = useState(true)
  const [createOpen, setCreateOpen]   = useState(false)
  const [editing, setEditing]         = useState<AdminUser | null>(null)
  const [toggling, setToggling]       = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setUserList(await res.json())
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleToggle = async (user: AdminUser) => {
    setToggling(user.id)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const d = await res.json()
        setUserList(prev => prev.map(u => u.id === user.id ? { ...u, isActive: d.isActive } : u))
      }
    } finally {
      setToggling(null)
    }
  }

  const handleCreated = (user: AdminUser) => {
    setUserList(prev => [...prev, user])
    setCreateOpen(false)
  }

  const handleUpdated = (updated: AdminUser) => {
    setUserList(prev => prev.map(u => u.id === updated.id ? updated : u))
    setEditing(null)
  }

  function fmtDate(iso: string | null) {
    if (!iso) return 'Never'
    return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <h1 className={styles.heading}>Users</h1>
        <button onClick={() => setCreateOpen(true)} className={styles.addBtn}>
          <Plus size={15} /> Add staff
        </button>
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loadingDots}>
            <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
          </div>
        ) : (
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {userList.length === 0 ? (
                <tr className={styles.emptyRow}>
                  <td colSpan={6}>No users found.</td>
                </tr>
              ) : (
                userList.map(u => (
                  <tr key={u.id}>
                    <td className={styles.nameCell}>
                      {u.name}
                      {u.id === self?.id && <span className={styles.youLabel}>you</span>}
                      {u.mustChangePassword && <span className={styles.mustChangeBadge}>pwd reset</span>}
                    </td>
                    <td className={styles.emailCell}>{u.email}</td>
                    <td>
                      <span className={`${styles.roleBadge} ${u.role === 'owner' ? styles.roleOwner : styles.roleCashier}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${u.isActive ? styles.statusActive : styles.statusInactive}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{fmtDate(u.lastLoginAt)}</td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button
                          onClick={() => setEditing(u)}
                          className={styles.actionBtn}
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        <button
                          onClick={() => setEditing(u)}
                          className={`${styles.actionBtn} ${styles.actionBtnOrange}`}
                          title="Reset password"
                        >
                          <KeyRound size={12} />
                        </button>
                        <button
                          onClick={() => handleToggle(u)}
                          disabled={toggling === u.id || u.id === self?.id}
                          className={`${styles.actionBtn} ${!u.isActive ? styles.actionBtnOrange : styles.actionBtnRed}`}
                          title={u.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Power size={12} />
                          {toggling === u.id ? '…' : u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <CreateDrawer
        open={createOpen}
        token={token}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />

      <EditDrawer
        open={editing !== null}
        user={editing}
        token={token}
        onClose={() => setEditing(null)}
        onUpdated={handleUpdated}
      />
    </div>
  )
}
