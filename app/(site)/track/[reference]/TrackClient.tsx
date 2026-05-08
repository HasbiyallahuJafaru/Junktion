'use client'

import { useEffect, useState } from 'react'
import { formatPrice } from '@/app/lib/utils'
import { siteConfig } from '@/app/data/config'
import styles from './Track.module.css'

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'] as const
type OrderStatus = typeof STATUS_STEPS[number] | 'cancelled'

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:   'Awaiting Confirmation',
  confirmed: 'Order Confirmed',
  preparing: 'Being Prepared',
  ready:     'Ready for Pickup / Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const STATUS_HINT: Record<OrderStatus, string> = {
  pending:   'Complete your transfer — we\'ll confirm once payment is received.',
  confirmed: 'Payment received. Your order is in the queue.',
  preparing: 'The kitchen is working on your order.',
  ready:     'Your order is ready and on its way.',
  delivered: 'Enjoy your meal!',
  cancelled: 'This order was cancelled. Contact us if this is a mistake.',
}

interface OrderData {
  reference: string
  status: OrderStatus
  total: number
  deliveryAddress: string
  createdAt: string
  updatedAt: string
  paymentAccount: {
    accountName: string
    accountNumber: string
    bankName: string
  } | null
}

export function TrackClient({ reference }: { reference: string }) {
  const [order, setOrder]   = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/orders/track/${reference}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setOrder(data)
      })
      .catch(() => setError('Could not load order. Check your connection.'))
      .finally(() => setLoading(false))
  }, [reference])

  const activeStep = order ? STATUS_STEPS.indexOf(order.status as typeof STATUS_STEPS[number]) : -1
  const isCancelled = order?.status === 'cancelled'

  const whatsappText = order
    ? encodeURIComponent(`Hi Junktion! I have a question about order *${order.reference}*.`)
    : ''
  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp.replace(/\D/g, '')}?text=${whatsappText}`

  return (
    <main className={styles.page}>
      {/* Nav-height spacer */}
      <div className={styles.topBar}>
        <a href="/" className={styles.wordmark}>Junktion</a>
      </div>

      <div className={styles.container}>
        {/* Loading */}
        {loading && (
          <div className={styles.stateWrap}>
            <div className={styles.dots}>
              <span /><span /><span />
            </div>
            <p className={styles.stateText}>Looking up your order…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className={styles.stateWrap}>
            <p className={styles.errorText}>{error}</p>
            <a href="/" className={styles.backLink}>← Back to menu</a>
          </div>
        )}

        {/* Order found */}
        {!loading && order && (
          <>
            <div className={styles.header}>
              <p className={styles.eyebrow}>Order Status</p>
              <h1 className={styles.refHeading}>{order.reference}</h1>
              <p className={styles.statusLabel} data-cancelled={isCancelled}>
                {STATUS_LABEL[order.status]}
              </p>
              <p className={styles.statusHint}>{STATUS_HINT[order.status]}</p>
            </div>

            {/* Progress stepper */}
            {!isCancelled && (
              <div className={styles.stepper} role="list">
                {STATUS_STEPS.map((step, i) => {
                  const done    = i < activeStep
                  const current = i === activeStep
                  return (
                    <div
                      key={step}
                      className={`${styles.step} ${done ? styles.stepDone : ''} ${current ? styles.stepCurrent : ''}`}
                      role="listitem"
                    >
                      <div className={styles.stepDot}>
                        {done && <span className={styles.checkmark}>✓</span>}
                        {current && <span className={styles.stepPulse} />}
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`${styles.stepLine} ${done ? styles.stepLineDone : ''}`} />
                      )}
                      <span className={styles.stepLabel}>{STATUS_LABEL[step]}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Order summary */}
            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryKey}>Total</span>
                <span className={styles.summaryVal}>{formatPrice(order.total)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryKey}>Delivery to</span>
                <span className={styles.summaryVal}>{order.deliveryAddress}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryKey}>Placed</span>
                <span className={styles.summaryVal}>
                  {new Date(order.createdAt).toLocaleString('en-NG', {
                    dateStyle: 'medium', timeStyle: 'short',
                  })}
                </span>
              </div>
            </div>

            {/* Payment details (only while pending) */}
            {order.status === 'pending' && order.paymentAccount && (
              <div className={styles.payBlock}>
                <p className={styles.payTitle}>Complete your transfer</p>
                <p className={styles.bankName}>{order.paymentAccount.bankName}</p>
                <p className={styles.accountNumber}>{order.paymentAccount.accountNumber}</p>
                <p className={styles.accountName}>{order.paymentAccount.accountName}</p>
                <p className={styles.payAmount}>{formatPrice(order.total)}</p>
              </div>
            )}

            {/* Actions */}
            <div className={styles.actions}>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>
                Questions? Chat on WhatsApp
              </a>
              <a href="/" className={styles.backLink}>← Back to menu</a>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
