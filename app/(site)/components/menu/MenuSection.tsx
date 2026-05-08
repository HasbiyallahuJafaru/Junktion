'use client'

import { useEffect, useState } from 'react'
import { formatPrice } from '@/app/lib/utils'
import { useCart } from '@/app/context/CartContext'
import { MenuItem } from './MenuItem'
import styles from './MenuSection.module.css'

const CATEGORIES = [
  { key: 'all',      label: 'All' },
  { key: 'shawarma', label: 'Shawarma' },
  { key: 'sandwich', label: 'Sandwich' },
  { key: 'pasta',    label: 'Pasta' },
  { key: 'rice',     label: 'Rice' },
  { key: 'sides',    label: 'Sides' },
  { key: 'drinks',   label: 'Drinks' },
]

interface PublicMenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl: string
  isAvailable: boolean
  isFeatured: boolean
  displayOrder: number
}

/**
 * MenuSection — fetches live menu from /api/menu, filters by category,
 * renders items in an asymmetric grid with add-to-cart.
 */
export function MenuSection() {
  const [items, setItems]       = useState<PublicMenuItem[]>([])
  const [active, setActive]     = useState('all')
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(false)
  const { addItem }             = useCart()

  useEffect(() => {
    fetch('/api/menu')
      .then((r) => r.json())
      .then((data) => {
        if (data.items) setItems(data.items)
        else setError(true)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const visible = active === 'all'
    ? items
    : items.filter((i) => i.category === active)

  return (
    <section id="menu" className={styles.section}>
      {/* Section label */}
      <p className={styles.eyebrow}>The Menu</p>

      <div className={styles.header}>
        <h2 className={styles.heading}>
          Order<br />
          <span className={styles.headingAccent}>what you want.</span>
        </h2>

        {/* Category filter tabs */}
        <div className={styles.tabs} role="tablist" aria-label="Menu categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              role="tab"
              aria-selected={active === cat.key}
              onClick={() => setActive(cat.key)}
              className={`${styles.tab} ${active === cat.key ? styles.tabActive : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className={styles.state}>
          <span className={styles.loadingDot} />
          <span className={styles.loadingDot} />
          <span className={styles.loadingDot} />
        </div>
      )}

      {error && (
        <p className={styles.errorMsg}>
          Couldn&apos;t load the menu right now — try refreshing.
        </p>
      )}

      {/* Grid */}
      {!loading && !error && (
        <div className={styles.grid}>
          {visible.map((item, i) => (
            <MenuItem
              key={item.id}
              item={item}
              index={i}
              onAdd={() =>
                addItem({
                  id:       item.id,
                  name:     item.name,
                  price:    item.price,
                  category: item.category,
                })
              }
              formatPrice={formatPrice}
            />
          ))}
          {visible.length === 0 && (
            <p className={styles.emptyMsg}>Nothing here yet — check back soon.</p>
          )}
        </div>
      )}
    </section>
  )
}
