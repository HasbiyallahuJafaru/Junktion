'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Star, X } from 'lucide-react'
import { useAdminAuth } from '@/app/context/AdminAuthContext'
import styles from './Accounts.module.css'

// ── Types ─────────────────────────────────────────────────────────────────────

interface PaymentAccount {
  id: string
  accountName: string
  accountNumber: string
  bankName: string
  isPrimary: boolean
  isActive: boolean
}

interface FormState {
  accountName: string
  accountNumber: string
  bankName: string
}

const BLANK: FormState = { accountName: '', accountNumber: '', bankName: '' }

// ── Form drawer ───────────────────────────────────────────────────────────────

interface FormDrawerProps {
  open: boolean
  account: PaymentAccount | null
  token: string | null
  onClose: () => void
  onSaved: (account: PaymentAccount) => void
}

function FormDrawer({ open, account, token, onClose, onSaved }: FormDrawerProps) {
  const [form, setForm]     = useState<FormState>(BLANK)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    if (open) {
      setForm(account
        ? { accountName: account.accountName, accountNumber: account.accountNumber, bankName: account.bankName }
        : BLANK)
      setError('')
    }
  }, [open, account])

  const set = (k: keyof FormState, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.accountName.trim() || !form.accountNumber.trim() || !form.bankName.trim()) {
      setError('All fields are required'); return
    }
    setSaving(true); setError('')
    try {
      const url    = account ? `/api/admin/accounts/${account.id}` : '/api/admin/accounts'
      const method = account ? 'PUT' : 'POST'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to save')
      } else {
        onSaved(await res.json())
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
          <span className={styles.drawerTitle}>{account ? 'Edit Account' : 'New Account'}</span>
          <button onClick={onClose} className={styles.closeBtn}><X size={18} /></button>
        </div>

        <div className={styles.drawerBody}>
          <div className={styles.field}>
            <label className={styles.label}>Bank name</label>
            <input className={styles.input} value={form.bankName}
              onChange={e => set('bankName', e.target.value)}
              placeholder="e.g. First Bank" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Account number</label>
            <input className={styles.input} value={form.accountNumber}
              onChange={e => set('accountNumber', e.target.value)}
              placeholder="e.g. 3012345678" inputMode="numeric" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Account name</label>
            <input className={styles.input} value={form.accountName}
              onChange={e => set('accountName', e.target.value)}
              placeholder="e.g. Junktion Foods Ltd" />
          </div>

          {error && <div className={styles.formError}>{error}</div>}
        </div>

        <div className={styles.drawerFooter}>
          <button onClick={onClose} className={styles.cancelBtn}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className={styles.submitBtn}>
            {saving ? 'Saving…' : account ? 'Save changes' : 'Add account'}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Delete confirm ────────────────────────────────────────────────────────────

interface DeleteModalProps {
  account: PaymentAccount | null
  token: string | null
  onClose: () => void
  onDeleted: (id: string) => void
}

function DeleteModal({ account, token, onClose, onDeleted }: DeleteModalProps) {
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState('')

  if (!account) return null

  const handleDelete = async () => {
    setBusy(true); setError('')
    try {
      const res = await fetch(`/api/admin/accounts/${account.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to delete')
      } else {
        onDeleted(account.id)
      }
    } catch {
      setError('Network error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalTitle}>Delete account?</div>
        <div className={styles.modalBody}>
          Remove <strong style={{ color: '#F5F0EB' }}>{account.bankName} · {account.accountNumber}</strong>?
          This cannot be undone. Orders linked to this account will retain the reference.
        </div>
        {error && <div className={styles.modalError}>{error}</div>}
        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.modalCancelBtn}>Cancel</button>
          <button onClick={handleDelete} disabled={busy} className={styles.modalDeleteBtn}>
            {busy ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AccountsPage() {
  const { accessToken: token } = useAdminAuth()

  const [accounts, setAccounts]     = useState<PaymentAccount[]>([])
  const [loading, setLoading]       = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing]       = useState<PaymentAccount | null>(null)
  const [deleting, setDeleting]     = useState<PaymentAccount | null>(null)
  const [settingPrimary, setSettingPrimary] = useState<string | null>(null)

  const fetchAccounts = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/accounts', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setAccounts(await res.json())
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchAccounts() }, [fetchAccounts])

  const handleSetPrimary = async (id: string) => {
    setSettingPrimary(id)
    try {
      const res = await fetch(`/api/admin/accounts/${id}/primary`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setAccounts(prev => prev.map(a => ({ ...a, isPrimary: a.id === id })))
      }
    } finally {
      setSettingPrimary(null)
    }
  }

  const handleSaved = (saved: PaymentAccount) => {
    setAccounts(prev => {
      const exists = prev.find(a => a.id === saved.id)
      return exists ? prev.map(a => a.id === saved.id ? saved : a) : [...prev, saved]
    })
    setDrawerOpen(false)
    setEditing(null)
  }

  const handleDeleted = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id))
    setDeleting(null)
  }

  const openAdd  = () => { setEditing(null); setDrawerOpen(true) }
  const openEdit = (a: PaymentAccount) => { setEditing(a); setDrawerOpen(true) }
  const closeDrawer = () => { setDrawerOpen(false); setEditing(null) }

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <h1 className={styles.heading}>Payment Accounts</h1>
        <button onClick={openAdd} className={styles.addBtn}>
          <Plus size={15} /> Add account
        </button>
      </div>

      <div className={styles.hint}>
        The <strong>primary</strong> account is shown to customers at checkout and on the order tracking page.
        Only one account can be primary at a time.
      </div>

      {loading ? (
        <div className={styles.loadingDots}>
          <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
        </div>
      ) : accounts.length === 0 ? (
        <div className={styles.emptyMsg}>No payment accounts yet. Add one to start receiving orders.</div>
      ) : (
        <div className={styles.list}>
          {accounts.map(account => (
            <div key={account.id} className={`${styles.card} ${account.isPrimary ? styles.cardPrimary : ''}`}>
              <div className={styles.cardInfo}>
                <div className={styles.cardTop}>
                  <span className={styles.cardBank}>{account.bankName}</span>
                  {account.isPrimary && <span className={styles.primaryBadge}>Primary</span>}
                  {!account.isActive && <span className={styles.inactiveBadge}>Inactive</span>}
                </div>
                <div className={styles.cardNumber}>{account.accountNumber}</div>
                <div className={styles.cardName}>{account.accountName}</div>
              </div>

              <div className={styles.cardActions}>
                {!account.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(account.id)}
                    disabled={settingPrimary === account.id}
                    className={`${styles.actionBtn} ${styles.actionBtnOrange}`}
                  >
                    <Star size={12} />
                    {settingPrimary === account.id ? 'Setting…' : 'Set primary'}
                  </button>
                )}
                <button onClick={() => openEdit(account)} className={styles.actionBtn}>
                  <Pencil size={12} /> Edit
                </button>
                <button
                  onClick={() => setDeleting(account)}
                  disabled={account.isPrimary}
                  className={`${styles.actionBtn} ${styles.actionBtnRed}`}
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <FormDrawer
        open={drawerOpen}
        account={editing}
        token={token}
        onClose={closeDrawer}
        onSaved={handleSaved}
      />

      <DeleteModal
        account={deleting}
        token={token}
        onClose={() => setDeleting(null)}
        onDeleted={handleDeleted}
      />
    </div>
  )
}
