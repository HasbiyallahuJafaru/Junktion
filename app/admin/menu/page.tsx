'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, Star, Eye, EyeOff, Upload, X } from 'lucide-react'
import { useAdminAuth } from '@/app/context/AdminAuthContext'
import { formatPrice } from '@/app/lib/utils'
import styles from './Menu.module.css'

// ── Types ─────────────────────────────────────────────────────────────────────

type Category = 'shawarma' | 'sandwich' | 'pasta' | 'rice' | 'sides' | 'drinks'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: Category
  imageUrl: string
  cloudinaryPublicId: string
  isAvailable: boolean
  isFeatured: boolean
  displayOrder: number
}

interface FormState {
  name: string
  description: string
  price: string
  category: Category
  imageUrl: string
  cloudinaryPublicId: string
  isAvailable: boolean
  isFeatured: boolean
}

const BLANK: FormState = {
  name: '', description: '', price: '',
  category: 'shawarma',
  imageUrl: '', cloudinaryPublicId: '',
  isAvailable: true, isFeatured: false,
}

const CATEGORIES: Category[] = ['shawarma', 'sandwich', 'pasta', 'rice', 'sides', 'drinks']

// ── Image uploader ─────────────────────────────────────────────────────────────

interface UploaderProps {
  token: string | null
  imageUrl: string
  onUploaded: (url: string, publicId: string) => void
}

function ImageUploader({ token, imageUrl, onUploaded }: UploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState('')

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setProgress('Signing…')

    try {
      const sigRes = await fetch('/api/admin/upload/sign', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!sigRes.ok) { setProgress('Sign failed'); return }

      const { signature, timestamp, apiKey, cloudName } = await sigRes.json()

      setProgress('Uploading…')
      const fd = new FormData()
      fd.append('file', file)
      fd.append('api_key', apiKey)
      fd.append('timestamp', String(timestamp))
      fd.append('signature', signature)
      fd.append('folder', 'junktion/menu')

      const upRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: fd,
      })
      if (!upRes.ok) { setProgress('Upload failed'); return }

      const data = await upRes.json()
      onUploaded(data.secure_url, data.public_id)
      setProgress('')
    } catch {
      setProgress('Error uploading')
    }
  }

  return (
    <div className={styles.imageUpload}>
      {imageUrl && (
        <div className={styles.imagePreview}>
          <Image src={imageUrl} alt="Preview" fill className={styles.imagePreviewImg} />
        </div>
      )}
      <button
        type="button"
        className={styles.uploadBtn}
        disabled={!!progress}
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={14} />
        {progress || (imageUrl ? 'Replace image' : 'Upload image')}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}

// ── Menu item form drawer ─────────────────────────────────────────────────────

interface FormDrawerProps {
  item: MenuItem | null
  open: boolean
  token: string | null
  onClose: () => void
  onSaved: (item: MenuItem) => void
}

function FormDrawer({ item, open, token, onClose, onSaved }: FormDrawerProps) {
  const [form, setForm]       = useState<FormState>(BLANK)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (open) {
      setForm(item
        ? { name: item.name, description: item.description, price: String(item.price / 100),
            category: item.category, imageUrl: item.imageUrl,
            cloudinaryPublicId: item.cloudinaryPublicId,
            isAvailable: item.isAvailable, isFeatured: item.isFeatured }
        : BLANK)
      setError('')
    }
  }, [open, item])

  const set = (k: keyof FormState, v: string | boolean) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    if (!form.imageUrl || !form.cloudinaryPublicId) { setError('Please upload an image before saving'); return }
    if (form.description.trim().length < 5) { setError('Description must be at least 5 characters'); return }
    const price = Math.round(parseFloat(form.price) * 100)
    if (!price || price <= 0) { setError('Enter a valid price in Naira (e.g. 3900)'); return }

    setSaving(true); setError('')
    try {
      const url    = item ? `/api/admin/menu/${item.id}` : '/api/admin/menu'
      const method = item ? 'PUT' : 'POST'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, price }),
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
          <span className={styles.drawerTitle}>{item ? 'Edit Item' : 'New Item'}</span>
          <button onClick={onClose} className={styles.closeBtn}><X size={18} /></button>
        </div>

        <div className={styles.drawerBody}>
          <div className={styles.field}>
            <label className={styles.label}>Name</label>
            <input className={styles.input} value={form.name}
              onChange={e => set('name', e.target.value)} placeholder="e.g. Classic Shawarma" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea className={styles.textarea} value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Short description…" />
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <label className={styles.label}>Price (₦)</label>
              <input className={styles.input} type="number" min="0" step="50"
                value={form.price} onChange={e => set('price', e.target.value)}
                placeholder="3900" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Category</label>
              <select className={styles.select} value={form.category}
                onChange={e => set('category', e.target.value as Category)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Image</label>
            <ImageUploader
              token={token}
              imageUrl={form.imageUrl}
              onUploaded={(url, id) => setForm(p => ({ ...p, imageUrl: url, cloudinaryPublicId: id }))}
            />
          </div>

          <div className={styles.toggleRow}>
            <span className={styles.toggleLabel}>Available on menu</span>
            <button type="button"
              className={`${styles.toggle} ${form.isAvailable ? styles.toggleOn : ''}`}
              onClick={() => set('isAvailable', !form.isAvailable)}>
              <span className={`${styles.toggleThumb} ${form.isAvailable ? styles.toggleThumbOn : ''}`} />
            </button>
          </div>

          <div className={styles.toggleRow}>
            <span className={styles.toggleLabel}>Featured item</span>
            <button type="button"
              className={`${styles.toggle} ${form.isFeatured ? styles.toggleOn : ''}`}
              onClick={() => set('isFeatured', !form.isFeatured)}>
              <span className={`${styles.toggleThumb} ${form.isFeatured ? styles.toggleThumbOn : ''}`} />
            </button>
          </div>

          {error && <div className={styles.formError}>{error}</div>}
        </div>

        <div className={styles.drawerFooter}>
          <button onClick={onClose} className={styles.cancelBtn2}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className={styles.submitBtn}>
            {saving ? 'Saving…' : item ? 'Save changes' : 'Add item'}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Delete confirm ────────────────────────────────────────────────────────────

interface DeleteModalProps {
  item: MenuItem | null
  token: string | null
  onClose: () => void
  onDeleted: (id: string) => void
}

function DeleteModal({ item, token, onClose, onDeleted }: DeleteModalProps) {
  const [busy, setBusy] = useState(false)

  if (!item) return null

  const handleDelete = async () => {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/menu/${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) onDeleted(item.id)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalTitle}>Delete "{item.name}"?</div>
        <div className={styles.modalBody}>
          This will permanently remove the item and its image. This action cannot be undone.
        </div>
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

export default function MenuPage() {
  const { accessToken: token } = useAdminAuth()

  const [items, setItems]           = useState<MenuItem[]>([])
  const [loading, setLoading]       = useState(true)
  const [catFilter, setCatFilter]   = useState<Category | 'all'>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing]       = useState<MenuItem | null>(null)
  const [deleting, setDeleting]     = useState<MenuItem | null>(null)

  const fetchItems = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/menu', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setItems(await res.json())
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchItems() }, [fetchItems])

  const handleToggle = async (item: MenuItem) => {
    const res = await fetch(`/api/admin/menu/${item.id}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const d = await res.json()
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isAvailable: d.isAvailable } : i))
    }
  }

  const handleFeature = async (item: MenuItem) => {
    const res = await fetch(`/api/admin/menu/${item.id}/feature`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const d = await res.json()
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isFeatured: d.isFeatured } : i))
    }
  }

  const handleSaved = (saved: MenuItem) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === saved.id)
      return exists ? prev.map(i => i.id === saved.id ? saved : i) : [saved, ...prev]
    })
    setDrawerOpen(false)
    setEditing(null)
  }

  const handleDeleted = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
    setDeleting(null)
  }

  const openAdd  = () => { setEditing(null); setDrawerOpen(true) }
  const openEdit = (item: MenuItem) => { setEditing(item); setDrawerOpen(true) }
  const closeDrawer = () => { setDrawerOpen(false); setEditing(null) }

  const filtered = catFilter === 'all' ? items : items.filter(i => i.category === catFilter)

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <h1 className={styles.heading}>Menu</h1>
        <button onClick={openAdd} className={styles.addBtn}>
          <Plus size={15} /> Add item
        </button>
      </div>

      {/* Category filter */}
      <div className={styles.catRow}>
        <button onClick={() => setCatFilter('all')}
          className={`${styles.catBtn} ${catFilter === 'all' ? styles.catBtnActive : ''}`}>
          All ({items.length})
        </button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`${styles.catBtn} ${catFilter === c ? styles.catBtnActive : ''}`}>
            {c} ({items.filter(i => i.category === c).length})
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className={styles.loadingDots}>
          <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyMsg}>No items{catFilter !== 'all' ? ` in ${catFilter}` : ''}.</div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(item => (
            <div key={item.id} className={`${styles.card} ${!item.isAvailable ? styles.cardUnavailable : ''}`}>
              <div className={styles.imageWrap}>
                {item.imageUrl && (
                  <Image src={item.imageUrl} alt={item.name} fill className={styles.cardImg} />
                )}
                {item.isFeatured && <span className={styles.featuredBadge}>Featured</span>}
                {!item.isAvailable && <span className={styles.unavailableBadge}>Hidden</span>}
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardName}>{item.name}</div>
                <div className={styles.cardMeta}>
                  <span className={styles.cardCat}>{item.category}</span>
                  <span className={styles.cardPrice}>{formatPrice(item.price)}</span>
                </div>
                {item.description && <div className={styles.cardDesc}>{item.description}</div>}
              </div>
              <div className={styles.cardActions}>
                <button onClick={() => openEdit(item)} className={styles.actionBtn}>
                  <Pencil size={12} /> Edit
                </button>
                <button onClick={() => handleFeature(item)}
                  className={`${styles.actionBtn} ${item.isFeatured ? styles.actionBtnOrange : ''}`}>
                  <Star size={12} />
                </button>
                <button onClick={() => handleToggle(item)} className={styles.actionBtn}>
                  {item.isAvailable ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
                <button onClick={() => setDeleting(item)}
                  className={`${styles.actionBtn} ${styles.actionBtnRed}`}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <FormDrawer
        open={drawerOpen}
        item={editing}
        token={token}
        onClose={closeDrawer}
        onSaved={handleSaved}
      />

      <DeleteModal
        item={deleting}
        token={token}
        onClose={() => setDeleting(null)}
        onDeleted={handleDeleted}
      />
    </div>
  )
}
