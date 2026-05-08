'use client'

import { useEffect, useRef } from 'react'
import { X, Copy, CheckCheck, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { formatPrice } from '@/app/lib/utils'
import { siteConfig } from '@/app/data/config'
import styles from './OrderModal.module.css'

interface PaymentAccount {
  accountName: string
  accountNumber: string
  bankName: string
}

interface Props {
  reference: string
  total: number
  paymentAccount: PaymentAccount | null
  onClose: () => void
}

/**
 * OrderModal — shown after a successful order.
 * Displays the order reference, payment details, and a WhatsApp deep-link.
 */
export function OrderModal({ reference, total, paymentAccount, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const copyRef = async () => {
    await navigator.clipboard.writeText(reference)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const whatsappText = encodeURIComponent(
    `Hi Junktion! 🍔\n\nI just placed an order.\nReference: *${reference}*\nTotal: ${formatPrice(total)}\n\nPlease confirm my order.`
  )
  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp.replace(/\D/g, '')}?text=${whatsappText}`

  return (
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Order confirmed"
    >
      <div className={styles.modal}>
        {/* Close */}
        <button ref={closeRef} onClick={onClose} className={styles.closeBtn} aria-label="Close">
          <X size={18} strokeWidth={1.5} />
        </button>

        {/* Status indicator */}
        <div className={styles.statusRing} aria-hidden="true">
          <div className={styles.statusDot} />
        </div>

        <h2 className={styles.title}>Order Placed!</h2>
        <p className={styles.subtitle}>
          Complete your payment to confirm the order.
        </p>

        {/* Reference */}
        <div className={styles.refBlock}>
          <span className={styles.refLabel}>Order Reference</span>
          <div className={styles.refRow}>
            <span className={styles.refCode}>{reference}</span>
            <button onClick={copyRef} className={styles.copyBtn} aria-label="Copy reference">
              {copied
                ? <CheckCheck size={15} strokeWidth={2} />
                : <Copy size={15} strokeWidth={1.5} />
              }
            </button>
          </div>
        </div>

        {/* Payment details */}
        {paymentAccount ? (
          <div className={styles.payBlock}>
            <p className={styles.payLabel}>Transfer to</p>
            <p className={styles.bankName}>{paymentAccount.bankName}</p>
            <p className={styles.accountNumber}>{paymentAccount.accountNumber}</p>
            <p className={styles.accountName}>{paymentAccount.accountName}</p>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Amount</span>
              <span className={styles.totalAmount}>{formatPrice(total)}</span>
            </div>
          </div>
        ) : (
          <p className={styles.noAccount}>
            Payment details will be sent via WhatsApp.
          </p>
        )}

        {/* WhatsApp CTA */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.whatsappBtn}
        >
          <MessageCircle size={18} strokeWidth={1.5} />
          Confirm on WhatsApp
        </a>

        <p className={styles.trackHint}>
          Track your order at{' '}
          <a href={`/track/${reference}`} className={styles.trackLink}>
            /track/{reference}
          </a>
        </p>
      </div>
    </div>
  )
}
