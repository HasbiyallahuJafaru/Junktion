'use client'

import { useCallback, useEffect, useState } from 'react'
import { ShoppingBag, TrendingUp, Receipt, Calendar } from 'lucide-react'
import { useAdminAuth } from '@/app/context/AdminAuthContext'
import { formatPrice } from '@/app/lib/utils'
import styles from './Analytics.module.css'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Summary {
  totalOrders: number
  totalRevenue: number
  avgOrder: number
  last7Days: number
}

interface DayRevenue {
  day: string
  revenue: number
  count: number
}

interface StatusCount {
  status: string
  count: number
}

interface TopItem {
  name: string
  category: string
  totalQty: number
  totalRevenue: number
}

interface AnalyticsData {
  summary: Summary
  revenueByDay: DayRevenue[]
  statusBreakdown: StatusCount[]
  topItems: TopItem[]
}

// ── Status colours ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending:   '#FBBF24',
  confirmed: '#60A5FA',
  preparing: '#C084FC',
  ready:     '#34D399',
  delivered: '#4ADE80',
  cancelled: '#6B6760',
}

// ── Revenue bar chart ──────────────────────────────────────────────────────────

function RevenueChart({ data }: { data: DayRevenue[] }) {
  if (!data.length) return <div className={styles.noData}>No revenue data yet</div>

  // Fill gaps — build a map then generate a full 30-day range
  const map = new Map(data.map(d => [d.day, d]))
  const days: DayRevenue[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push(map.get(key) ?? { day: key, revenue: 0, count: 0 })
  }

  const max = Math.max(...days.map(d => d.revenue), 1)

  const fmt = (iso: string) => {
    const d = new Date(iso + 'T00:00:00')
    return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
  }

  return (
    <div>
      <div className={styles.chartWrap}>
        {days.map((d) => (
          <div
            key={d.day}
            className={styles.bar}
            style={{ height: `${Math.max((d.revenue / max) * 100, d.revenue > 0 ? 4 : 1)}%` }}
          >
            <div className={styles.barTooltip}>
              {fmt(d.day)}<br />
              {formatPrice(d.revenue)} · {d.count} order{d.count !== 1 ? 's' : ''}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.chartFooter}>
        <span>{fmt(days[0].day)}</span>
        <span>Today</span>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { accessToken: token } = useAdminAuth()
  const [data, setData]       = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className={styles.page}>
        <h1 className={styles.heading}>Analytics</h1>
        <div className={styles.loadingDots}>
          <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
        </div>
      </div>
    )
  }

  if (!data) return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Analytics</h1>
      <div className={styles.emptyMsg}>Failed to load analytics.</div>
    </div>
  )

  const { summary, revenueByDay, statusBreakdown, topItems } = data

  const totalStatusCount = statusBreakdown.reduce((s, r) => s + r.count, 0) || 1

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Analytics</h1>

      {/* Summary cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><ShoppingBag size={16} /></div>
          <div className={styles.statLabel}>Total orders</div>
          <div className={styles.statValue}>{summary.totalOrders.toLocaleString()}</div>
          <div className={styles.statSub}>all time, excl. cancelled</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}><TrendingUp size={16} /></div>
          <div className={styles.statLabel}>Total revenue</div>
          <div className={styles.statValue}>{formatPrice(summary.totalRevenue)}</div>
          <div className={styles.statSub}>all time, excl. cancelled</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}><Receipt size={16} /></div>
          <div className={styles.statLabel}>Avg order value</div>
          <div className={styles.statValue}>{formatPrice(summary.avgOrder)}</div>
          <div className={styles.statSub}>per completed order</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}><Calendar size={16} /></div>
          <div className={styles.statLabel}>Last 7 days</div>
          <div className={styles.statValue}>{summary.last7Days}</div>
          <div className={styles.statSub}>orders placed</div>
        </div>
      </div>

      {/* Revenue chart */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Revenue — last 30 days</div>
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>Daily revenue (₦)</div>
          <RevenueChart data={revenueByDay} />
        </div>
      </div>

      {/* Status + top items */}
      <div className={styles.twoCol}>
        {/* Status breakdown */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Order status</div>
          <div className={styles.statusList}>
            {statusBreakdown.length === 0 ? (
              <div className={styles.noData}>No orders yet</div>
            ) : (
              statusBreakdown
                .sort((a, b) => b.count - a.count)
                .map(({ status, count }) => (
                  <div key={status} className={styles.statusRow}>
                    <span
                      className={styles.statusDot}
                      style={{ background: STATUS_COLORS[status] ?? '#6B6760' }}
                    />
                    <span className={styles.statusName}>{status}</span>
                    <div className={styles.statusBar}>
                      <div
                        className={styles.statusBarFill}
                        style={{
                          width: `${(count / totalStatusCount) * 100}%`,
                          background: STATUS_COLORS[status] ?? '#F15A22',
                        }}
                      />
                    </div>
                    <span className={styles.statusCount}>{count}</span>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Top items */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Top items — last 30 days</div>
          <div className={styles.itemsCard}>
            {topItems.length === 0 ? (
              <div className={styles.noData}>No order data yet</div>
            ) : (
              <table className={styles.itemsTable}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item</th>
                    <th style={{ textAlign: 'right' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topItems.map((item, i) => (
                    <tr key={item.name}>
                      <td>
                        <span className={`${styles.rankNum} ${i < 3 ? styles[`rankNum${i + 1}` as keyof typeof styles] : ''}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td>
                        <div className={styles.itemName}>{item.name}</div>
                        <div className={styles.itemCat}>{item.category}</div>
                      </td>
                      <td className={styles.itemQty}>{item.totalQty}</td>
                      <td className={styles.itemRev}>{formatPrice(item.totalRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
