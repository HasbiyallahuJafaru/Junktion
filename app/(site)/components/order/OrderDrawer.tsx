'use client'

import { useEffect, useRef } from 'react'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '@/app/context/CartContext'
import { formatPrice } from '@/app/lib/utils'
import styles from './OrderDrawer.module.css'

/**
 * OrderDrawer — slides in from the right when cart is open.
 * Shows items, qty controls, delivery address + phone inputs, and a checkout CTA.
 * Checkout itself is handled in Phase 6 (POST /api/orders).
 */
export function OrderDrawer({
  onCheckout,
  submitting = false,
  checkoutError = null,
}: {
  onCheckout: () => void
  submitting?: boolean
  checkoutError?: string | null
}) {
  const {
    isOpen, closeDrawer,
    items, removeItem, updateQty,
    deliveryAddress, setDeliveryAddress,
    customerPhone, setCustomerPhone,
    total, itemCount,
  } = useCart()

  const firstFocusRef = useRef<HTMLButtonElement>(null)

  // Focus trap — move focus into drawer on open
  useEffect(() => {
    if (isOpen) firstFocusRef.current?.focus()
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDrawer() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeDrawer])

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const canCheckout = items.length > 0 && deliveryAddress.trim().length > 4

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}
        aria-label="Your order"
        aria-modal="true"
        role="dialog"
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <ShoppingBag size={18} strokeWidth={1.5} className={styles.headerIcon} />
            <span className={styles.headerTitle}>Your Order</span>
            {itemCount > 0 && (
              <span className={styles.badge}>{itemCount}</span>
            )}
          </div>
          <button
            ref={firstFocusRef}
            onClick={closeDrawer}
            className={styles.closeBtn}
            aria-label="Close cart"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div className={styles.empty}>
            <ShoppingBag size={40} strokeWidth={1} className={styles.emptyIcon} />
            <p className={styles.emptyText}>Your cart is empty.</p>
            <p className={styles.emptyHint}>Add something from the menu.</p>
          </div>
        )}

        {/* Item list */}
        {items.length > 0 && (
          <div className={styles.body}>
            <ul className={styles.itemList}>
              {items.map((item) => (
                <li key={item.id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemPrice}>{formatPrice(item.price)}</span>
                  </div>

                  <div className={styles.itemControls}>
                    <div className={styles.qtyRow}>
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className={styles.qtyBtn}
                        aria-label={`Remove one ${item.name}`}
                      >
                        <Minus size={12} strokeWidth={2} />
                      </button>
                      <span className={styles.qty}>{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className={styles.qtyBtn}
                        aria-label={`Add one more ${item.name}`}
                      >
                        <Plus size={12} strokeWidth={2} />
                      </button>
                    </div>

                    <span className={styles.lineTotal}>
                      {formatPrice(item.price * item.quantity)}
                    </span>

                    <button
                      onClick={() => removeItem(item.id)}
                      className={styles.removeBtn}
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={13} strokeWidth={1.5} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Delivery details */}
            <div className={styles.fields}>
              <label className={styles.label}>
                Delivery address
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="e.g. 14 Ahmadu Bello Way, Kaduna"
                  className={styles.input}
                  maxLength={200}
                />
              </label>

              <label className={styles.label}>
                Phone number <span className={styles.optional}>(optional)</span>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 08012345678"
                  className={styles.input}
                  maxLength={15}
                />
              </label>
            </div>
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total</span>
              <span className={styles.totalAmount}>{formatPrice(total)}</span>
            </div>

            <button
              onClick={onCheckout}
              disabled={!canCheckout || submitting}
              className={styles.checkoutBtn}
            >
              {submitting ? 'Placing order…' : canCheckout ? 'Place Order' : 'Add a delivery address'}
            </button>

            {!canCheckout && items.length > 0 && !submitting && (
              <p className={styles.checkoutHint}>Enter your address above to continue.</p>
            )}

            {checkoutError && (
              <p className={styles.errorMsg}>{checkoutError}</p>
            )}
          </div>
        )}
      </aside>
    </>
  )
}
