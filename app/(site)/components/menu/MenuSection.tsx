'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { formatPrice } from '@/app/lib/utils'
import { useCart } from '@/app/context/CartContext'
import styles from './MenuSection.module.css'

const CATEGORY_ORDER = ['shawarma', 'sandwich', 'pasta', 'rice', 'sides', 'drinks']
const CATEGORY_LABELS: Record<string, string> = {
  shawarma: 'Shawarma',
  sandwich: 'Sandwich',
  pasta:    'Pasta',
  rice:     'Rice',
  sides:    'Sides',
  drinks:   'Drinks',
}

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

function groupByCategory(items: PublicMenuItem[]) {
  const map: Record<string, PublicMenuItem[]> = {}
  for (const item of items) {
    if (!map[item.category]) map[item.category] = []
    map[item.category].push(item)
  }
  return CATEGORY_ORDER
    .filter((c) => map[c]?.length)
    .map((c) => ({ key: c, label: CATEGORY_LABELS[c], items: map[c] }))
}

export function MenuSection() {
  const [items, setItems]       = useState<PublicMenuItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(false)
  const [mounted, setMounted]   = useState(false)
  const { addItem }             = useCart()

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    const controller = new AbortController()
    let retried = false

    const load = () => {
      fetch('/api/menu', { signal: controller.signal, cache: 'no-store' })
        .then((r) => r.json())
        .then((data: { items?: PublicMenuItem[] }) => {
          if (!data.items) throw new Error('empty')
          const seen = new Set<string>()
          setItems(data.items.filter((i) => {
            if (seen.has(i.id)) return false
            seen.add(i.id)
            return true
          }))
          setLoading(false)
        })
        .catch((err) => {
          if (err.name === 'AbortError') return
          if (!retried) {
            retried = true
            setTimeout(load, 2000)
          } else {
            setError(true)
            setLoading(false)
          }
        })
    }

    load()
    return () => controller.abort()
  }, [])

  const groups = groupByCategory(items)
  const totalItems = items.length

  return (
    <section id="menu" className={styles.section}>
      {/* ── Smoke streaks + embers (client-only to avoid hydration mismatch) ── */}
      {mounted && (
        <div className={styles.smoke} aria-hidden="true">
          {/* 16 candle flames */}
          <div className={`${styles.streak} ${styles.streakA}`} />
          <div className={`${styles.streak} ${styles.streakB}`} />
          <div className={`${styles.streak} ${styles.streakC}`} />
          <div className={`${styles.streak} ${styles.streakD}`} />
          <div className={`${styles.streak} ${styles.streakE}`} />
          <div className={`${styles.streak} ${styles.streakF}`} />
          <div className={`${styles.streak} ${styles.streakG}`} />
          <div className={`${styles.streak} ${styles.streakH}`} />
          <div className={`${styles.streak} ${styles.streakI}`} />
          <div className={`${styles.streak} ${styles.streakJ}`} />
          <div className={`${styles.streak} ${styles.streakK}`} />
          <div className={`${styles.streak} ${styles.streakL}`} />
          <div className={`${styles.streak} ${styles.streakM}`} />
          <div className={`${styles.streak} ${styles.streakN}`} />
          <div className={`${styles.streak} ${styles.streakO}`} />
          <div className={`${styles.streak} ${styles.streakP}`} />
          {/* 20 embers */}
          <div className={`${styles.ember} ${styles.ember1}`} />
          <div className={`${styles.ember} ${styles.ember2}`} />
          <div className={`${styles.ember} ${styles.ember3}`} />
          <div className={`${styles.ember} ${styles.ember4}`} />
          <div className={`${styles.ember} ${styles.ember5}`} />
          <div className={`${styles.ember} ${styles.ember6}`} />
          <div className={`${styles.ember} ${styles.ember7}`} />
          <div className={`${styles.ember} ${styles.ember8}`} />
          <div className={`${styles.ember} ${styles.ember9}`} />
          <div className={`${styles.ember} ${styles.ember10}`} />
          <div className={`${styles.ember} ${styles.ember11}`} />
          <div className={`${styles.ember} ${styles.ember12}`} />
          <div className={`${styles.ember} ${styles.ember13}`} />
          <div className={`${styles.ember} ${styles.ember14}`} />
          <div className={`${styles.ember} ${styles.ember15}`} />
          <div className={`${styles.ember} ${styles.ember16}`} />
          <div className={`${styles.ember} ${styles.ember17}`} />
          <div className={`${styles.ember} ${styles.ember18}`} />
          <div className={`${styles.ember} ${styles.ember19}`} />
          <div className={`${styles.ember} ${styles.ember20}`} />
          <div className={`${styles.ember} ${styles.ember21}`} />
          <div className={`${styles.ember} ${styles.ember22}`} />
          <div className={`${styles.ember} ${styles.ember23}`} />
          <div className={`${styles.ember} ${styles.ember24}`} />
          <div className={`${styles.ember} ${styles.ember25}`} />
          <div className={`${styles.ember} ${styles.ember26}`} />
          <div className={`${styles.ember} ${styles.ember27}`} />
          <div className={`${styles.ember} ${styles.ember28}`} />
          <div className={`${styles.ember} ${styles.ember29}`} />
          <div className={`${styles.ember} ${styles.ember30}`} />
          <div className={`${styles.ember} ${styles.ember31}`} />
          <div className={`${styles.ember} ${styles.ember32}`} />
          <div className={`${styles.ember} ${styles.ember33}`} />
          <div className={`${styles.ember} ${styles.ember34}`} />
          <div className={`${styles.ember} ${styles.ember35}`} />
          <div className={`${styles.ember} ${styles.ember36}`} />
          <div className={`${styles.ember} ${styles.ember37}`} />
          <div className={`${styles.ember} ${styles.ember38}`} />
          <div className={`${styles.ember} ${styles.ember39}`} />
          <div className={`${styles.ember} ${styles.ember40}`} />
          <div className={`${styles.ember} ${styles.ember41}`} />
          <div className={`${styles.ember} ${styles.ember42}`} />
          <div className={`${styles.ember} ${styles.ember43}`} />
          <div className={`${styles.ember} ${styles.ember44}`} />
          <div className={`${styles.ember} ${styles.ember45}`} />
          <div className={`${styles.ember} ${styles.ember46}`} />
          <div className={`${styles.ember} ${styles.ember47}`} />
          <div className={`${styles.ember} ${styles.ember48}`} />
          <div className={`${styles.ember} ${styles.ember49}`} />
          <div className={`${styles.ember} ${styles.ember50}`} />
        </div>
      )}

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <p className={styles.eyebrow}>
            // {String(totalItems).padStart(2, '0')} ITEMS · ORDER ONLINE
          </p>
          <h2 className={styles.heading}>
            The menu.<br />
            <span className={styles.headingLight}>We keep it fresh.</span>
          </h2>
        </div>
        <p className={styles.headerDesc}>
          Every item crafted in our kitchen — shawarma rolled tight, jollof smoked right,
          drinks poured cold. If it&apos;s on the board, it earned its spot.
        </p>
      </div>

      {/* ── States ── */}
      {loading && (
        <div className={styles.loadingState}>
          <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
        </div>
      )}
      {error && <p className={styles.errorMsg}>Couldn&apos;t load the menu — try refreshing.</p>}

      {/* ── Category sections ── */}
      {!loading && !error && (
        <div className={styles.feed}>
          {groups.map((group, gi) => (
            <CategorySection
              key={group.key}
              group={group}
              groupIndex={gi}
              onAdd={(item) => addItem({
                id: item.id, name: item.name,
                price: item.price, category: item.category,
              })}
            />
          ))}
        </div>
      )}
    </section>
  )
}

interface Group { key: string; label: string; items: PublicMenuItem[] }

function CategorySection({ group, groupIndex, onAdd }: {
  group: Group
  groupIndex: number
  onAdd: (item: PublicMenuItem) => void
}) {
  const ref           = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Guarantee visibility after 3s regardless of observer
    const fallback = setTimeout(() => setVis(true), 3000)

    let obs: IntersectionObserver | null = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          clearTimeout(fallback)
          setVis(true)
          obs?.disconnect()
          obs = null
        }
      },
      { threshold: 0, rootMargin: '0px 0px -40px 0px' }
    )
    obs.observe(el)

    return () => {
      clearTimeout(fallback)
      obs?.disconnect()
      obs = null
    }
  }, [])

  return (
    <div ref={ref} className={`${styles.categorySection} ${vis ? styles.categorySectionVisible : ''}`}>
      {/* Category label */}
      <div className={styles.categoryHeader}>
        <span className={styles.categoryIndex}>
          {String(groupIndex + 1).padStart(2, '0')}
        </span>
        <span className={styles.categoryLabel}>{group.label}</span>
        <span className={styles.categoryLine} aria-hidden="true" />
        <span className={styles.categoryCount}>{group.items.length} item{group.items.length !== 1 ? 's' : ''}</span>
      </div>

      {/* 5-column grid */}
      <div className={styles.grid}>
        {group.items.map((item, i) => (
          <MenuCard
            key={item.id}
            item={item}
            index={i}
            onAdd={() => onAdd(item)}
          />
        ))}
      </div>
    </div>
  )
}

function MenuCard({ item, index, onAdd }: { item: PublicMenuItem; index: number; onAdd: () => void }) {
  return (
    <div
      className={styles.card}
      style={{ '--i': index } as React.CSSProperties}
    >
      <div className={styles.imgArea}>
        {item.isFeatured && (
          <span className={styles.badge}>Staff Pick</span>
        )}
        <div className={styles.imgInner}>
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 600px) 44vw, (max-width: 1024px) 30vw, 240px"
            className={styles.img}
            unoptimized
          />
        </div>
      </div>

      <div className={styles.cardInfo}>
        <div className={styles.nameRow}>
          <h3 className={styles.itemName}>{item.name}</h3>
          <span className={styles.itemPrice}>{formatPrice(item.price)}</span>
        </div>
        <p className={styles.itemDesc}>{item.description}</p>
        <button onClick={onAdd} className={styles.addBtn} aria-label={`Add ${item.name}`}>
          <Plus size={12} strokeWidth={2.5} />
          Add to order
        </button>
      </div>
    </div>
  )
}
