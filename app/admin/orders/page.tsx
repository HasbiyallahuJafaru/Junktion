'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { RefreshCw, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAdminAuth } from '@/app/context/AdminAuthContext'
import { formatPrice } from '@/app/lib/utils'
import { VALID_TRANSITIONS } from '@/app/lib/utils'
import type { OrderItemJSON } from '@/app/db/schema'
import styles from './Orders.module.css'

// ── Types ─────────────────────────────────────────────────────────────────────

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'

interface PaymentAccount {
  id: string
  accountName: string
  accountNumber: string
  bankName: string
}

interface Order {
  id: string
  reference: string
  status: OrderStatus
  total: number
  deliveryAddress: string
  customerPhone: string | null
  items: OrderItemJSON[]
  createdAt: string
  updatedAt: string
  paymentAccount: PaymentAccount | null
}

interface Summary { pending: number; confirmed: number; preparing: number; ready: number; delivered: number; cancelled: number }

const STATUS_FILTERS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'pending',   label: 'Pending'   },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready',     label: 'Ready'     },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
]

function fmtDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
}

function fmtItems(items: OrderItemJSON[]) {
  const total = items.reduce((s, i) => s + i.quantity, 0)
  return `${total} item${total !== 1 ? 's' : ''} · ${items.map(i => i.name).slice(0, 2).join(', ')}${items.length > 2 ? '…' : ''}`
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`${styles.status} ${styles[`status_${status}`]}`}>
      <span className={`${styles.statusDot} ${styles[`dot_${status}`]}`} />
      {status}
    </span>
  )
}

// ── Order detail drawer ───────────────────────────────────────────────────────

interface DetailDrawerProps {
  order: Order | null
  onClose: () => void
  onStatusChange: (id: string, status: OrderStatus) => void
}

function DetailDrawer({ order, onClose, onStatusChange }: DetailDrawerProps) {
  const { accessToken } = useAdminAuth()
  const [transitioning, setTransitioning] = useState(false)
  const [transErr, setTransErr] = useState('')

  const isOpen = order !== null

  const nextStatuses = order
    ? (VALID_TRANSITIONS[order.status] ?? []) as OrderStatus[]
    : []

  const handleTransition = async (newStatus: OrderStatus) => {
    if (!order) return
    setTransErr('')
    setTransitioning(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const d = await res.json()
        setTransErr(d.error ?? 'Failed to update')
      } else {
        onStatusChange(order.id, newStatus)
      }
    } catch {
      setTransErr('Network error')
    } finally {
      setTransitioning(false)
    }
  }

  return (
    <>
      {isOpen && <div className={styles.drawerBackdrop} onClick={onClose} />}
      <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}>
        {order && (
          <>
            <div className={styles.drawerHeader}>
              <div>
                <div className={styles.drawerTitle}>Order Detail</div>
                <div className={styles.drawerRef}>{order.reference}</div>
              </div>
              <button onClick={onClose} className={styles.closeBtn}><X size={18} /></button>
            </div>

            <div className={styles.drawerBody}>
              {/* Status */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>Status</div>
                <div><StatusBadge status={order.status} /></div>
                {nextStatuses.length > 0 && (
                  <div className={styles.transitionButtons}>
                    {nextStatuses.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleTransition(s)}
                        disabled={transitioning}
                        className={`${styles.transitionBtn} ${s === 'cancelled' ? styles.cancelBtn : ''}`}
                      >
                        Mark {s}
                      </button>
                    ))}
                  </div>
                )}
                {transErr && <div className={styles.transitionError}>{transErr}</div>}
              </div>

              {/* Customer */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>Customer</div>
                <div className={styles.metaRow}>
                  <span className={styles.metaKey}>Address</span>
                  <span className={styles.metaVal}>{order.deliveryAddress}</span>
                </div>
                {order.customerPhone && (
                  <div className={styles.metaRow}>
                    <span className={styles.metaKey}>Phone</span>
                    <span className={styles.metaVal}>{order.customerPhone}</span>
                  </div>
                )}
                <div className={styles.metaRow}>
                  <span className={styles.metaKey}>Placed</span>
                  <span className={styles.metaVal}>{fmtDate(order.createdAt)}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaKey}>Updated</span>
                  <span className={styles.metaVal}>{fmtDate(order.updatedAt)}</span>
                </div>
              </div>

              {/* Items */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>Items</div>
                {order.items.map((item, i) => (
                  <div key={i} className={styles.drawerItem}>
                    <span className={styles.drawerItemName}>{item.name}</span>
                    <span className={styles.drawerItemQty}>×{item.quantity}</span>
                    <span className={styles.drawerItemPrice}>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Payment */}
              {order.paymentAccount && (
                <div className={styles.drawerSection}>
                  <div className={styles.drawerSectionTitle}>Payment Account</div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaKey}>Bank</span>
                    <span className={styles.metaVal}>{order.paymentAccount.bankName}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaKey}>Account</span>
                    <span className={styles.metaVal}>{order.paymentAccount.accountNumber}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaKey}>Name</span>
                    <span className={styles.metaVal}>{order.paymentAccount.accountName}</span>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.drawerFooter}>
              <div>
                <div className={styles.drawerTotalLabel}>Total</div>
                <div className={styles.drawerTotal}>{formatPrice(order.total)}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { accessToken: token } = useAdminAuth()

  const [orders, setOrders]       = useState<Order[]>([])
  const [summary, setSummary]     = useState<Summary | null>(null)
  const [filter, setFilter]       = useState<OrderStatus | 'all'>('all')
  const [page, setPage]           = useState(1)
  const [pages, setPages]         = useState(1)
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState<Order | null>(null)
  const pollingRef                = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchOrders = useCallback(async (p = page, f = filter) => {
    if (!token) return
    setLoading(true)
    try {
      const qs  = new URLSearchParams({ page: String(p) })
      if (f !== 'all') qs.set('status', f)
      const res = await fetch(`/api/admin/orders?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const d = await res.json()
        setOrders(d.orders)
        setPages(d.pages)
        setTotal(d.total)
      }
    } finally {
      setLoading(false)
    }
  }, [token, page, filter])

  const fetchSummary = useCallback(async () => {
    if (!token) return
    const res = await fetch('/api/admin/orders/summary', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) setSummary(await res.json())
  }, [token])

  useEffect(() => {
    fetchOrders(page, filter)
    fetchSummary()
  }, [page, filter, token]) // eslint-disable-line react-hooks/exhaustive-deps

  // Poll every 30s for live updates
  useEffect(() => {
    pollingRef.current = setInterval(() => {
      fetchOrders(page, filter)
      fetchSummary()
    }, 30_000)
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [fetchOrders, fetchSummary, page, filter])

  const handleFilter = (f: OrderStatus | 'all') => {
    setFilter(f)
    setPage(1)
  }

  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: newStatus } : null)
    fetchSummary()
  }

  const handleRefresh = () => {
    fetchOrders(page, filter)
    fetchSummary()
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Orders</h1>

      {/* Summary strip */}
      {summary && (
        <div className={styles.summary}>
          {(Object.entries(summary) as [OrderStatus, number][]).map(([s, count]) => (
            <button
              key={s}
              onClick={() => handleFilter(s)}
              className={`${styles.summaryCard} ${filter === s ? styles.summaryCardActive : ''}`}
            >
              <span className={styles.summaryLabel}>{s}</span>
              <span className={`${styles.summaryCount} ${['pending','confirmed','preparing'].includes(s) && count > 0 ? styles.summaryCountOrange : ''}`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className={styles.toolbar}>
        {STATUS_FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleFilter(key)}
            className={`${styles.filterBtn} ${filter === key ? styles.filterBtnActive : ''}`}
          >
            {label}
          </button>
        ))}
        <div className={styles.spacer} />
        <button onClick={handleRefresh} className={styles.refreshBtn}>
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loadingDots}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        ) : (
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th>Reference</th>
                <th>Status</th>
                <th>Total</th>
                <th className={styles.colItems}>Items</th>
                <th className={styles.colAddress}>Address</th>
                <th className={styles.colTime}>Placed</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {orders.length === 0 ? (
                <tr className={styles.emptyRow}>
                  <td colSpan={6}>No orders found</td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} onClick={() => setSelected(o)}>
                    <td className={styles.refCell}>{o.reference}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td className={styles.totalCell}>{formatPrice(o.total)}</td>
                    <td className={`${styles.itemsCell} ${styles.colItems}`}>{fmtItems(o.items)}</td>
                    <td className={`${styles.addrCell} ${styles.colAddress}`}>{o.deliveryAddress}</td>
                    <td className={`${styles.timeCell} ${styles.colTime}`}>{fmtDate(o.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page <= 1}
            className={styles.pageBtn}
          >
            <ChevronLeft size={15} />
          </button>
          <span className={styles.pageInfo}>{page} / {pages} &nbsp;·&nbsp; {total} orders</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= pages}
            className={styles.pageBtn}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* Detail drawer */}
      <DetailDrawer
        order={selected}
        onClose={() => setSelected(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
