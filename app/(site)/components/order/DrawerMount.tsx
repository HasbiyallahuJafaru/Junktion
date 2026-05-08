'use client'

import { useState } from 'react'
import { useCart } from '@/app/context/CartContext'
import { OrderDrawer } from './OrderDrawer'
import { OrderModal } from './OrderModal'

interface OrderResult {
  reference: string
  total: number
  paymentAccount: {
    accountName: string
    accountNumber: string
    bankName: string
  } | null
}

/**
 * DrawerMount — manages the full checkout flow:
 * cart drawer → POST /api/orders → success modal → clear cart.
 */
export function DrawerMount() {
  const { items, deliveryAddress, customerPhone, closeDrawer, clear } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [result, setResult]         = useState<OrderResult | null>(null)

  const handleCheckout = async () => {
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/orders', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ items, deliveryAddress, customerPhone }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      setResult(data)
      closeDrawer()
      clear()
    } catch {
      setError('Network error — check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleModalClose = () => setResult(null)

  return (
    <>
      <OrderDrawer
        onCheckout={handleCheckout}
        submitting={submitting}
        checkoutError={error}
      />

      {result && (
        <OrderModal
          reference={result.reference}
          total={result.total}
          paymentAccount={result.paymentAccount}
          onClose={handleModalClose}
        />
      )}
    </>
  )
}
