'use client'

import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { OrderItemJSON } from '@/app/db/schema'

/** A single item held in the cart. Mirrors OrderItemJSON with a required quantity. */
interface CartItem extends OrderItemJSON {}

interface CartState {
  items: CartItem[]
  deliveryAddress: string
  customerPhone: string
  isOpen: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'UPDATE_QTY'; id: string; quantity: number }
  | { type: 'SET_ADDRESS'; address: string }
  | { type: 'SET_PHONE'; phone: string }
  | { type: 'OPEN_DRAWER' }
  | { type: 'CLOSE_DRAWER' }
  | { type: 'CLEAR' }

interface CartContextValue extends CartState {
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQty: (id: string, quantity: number) => void
  setDeliveryAddress: (address: string) => void
  setCustomerPhone: (phone: string) => void
  openDrawer: () => void
  closeDrawer: () => void
  clear: () => void
  /** Total price of all items in kobo */
  total: number
  /** Total number of individual units in the cart */
  itemCount: number
}

const CartContext = createContext<CartContextValue | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.id === action.item.id)
      if (existing) {
        return {
          ...state,
          isOpen: true,
          items: state.items.map((i) =>
            i.id === action.item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }
      }
      return { ...state, isOpen: true, items: [...state.items, action.item] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) }
    case 'UPDATE_QTY':
      if (action.quantity <= 0)
        return { ...state, items: state.items.filter((i) => i.id !== action.id) }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, quantity: action.quantity } : i
        ),
      }
    case 'SET_ADDRESS':
      return { ...state, deliveryAddress: action.address }
    case 'SET_PHONE':
      return { ...state, customerPhone: action.phone }
    case 'OPEN_DRAWER':
      return { ...state, isOpen: true }
    case 'CLOSE_DRAWER':
      return { ...state, isOpen: false }
    case 'CLEAR':
      return { items: [], deliveryAddress: '', customerPhone: '', isOpen: false }
    default:
      return state
  }
}

const initialState: CartState = {
  items: [],
  deliveryAddress: '',
  customerPhone: '',
  isOpen: false,
}

/**
 * CartProvider — wraps all pages that need cart access.
 * Must be a Client Component tree parent; placed in (site)/layout.tsx.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        ...state,
        total,
        itemCount,
        addItem:            (item) => dispatch({ type: 'ADD_ITEM', item: { ...item, quantity: 1 } }),
        removeItem:         (id) => dispatch({ type: 'REMOVE_ITEM', id }),
        updateQty:          (id, quantity) => dispatch({ type: 'UPDATE_QTY', id, quantity }),
        setDeliveryAddress: (address) => dispatch({ type: 'SET_ADDRESS', address }),
        setCustomerPhone:   (phone) => dispatch({ type: 'SET_PHONE', phone }),
        openDrawer:         () => dispatch({ type: 'OPEN_DRAWER' }),
        closeDrawer:        () => dispatch({ type: 'CLOSE_DRAWER' }),
        clear:              () => dispatch({ type: 'CLEAR' }),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

/**
 * useCart — consume cart state and actions anywhere inside CartProvider.
 * Throws if called outside the provider tree.
 */
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
