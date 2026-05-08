import { z } from 'zod'
import { sanitizeText } from './sanitize'

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(8),
})

export const menuItemSchema = z.object({
  name:               z.string().min(2).max(100).transform(sanitizeText),
  description:        z.string().min(5).max(300).transform(sanitizeText),
  price:              z.number().positive().int(),
  category:           z.enum(['shawarma', 'sandwich', 'pasta', 'rice', 'sides', 'drinks']),
  imageUrl:           z.string().url(),
  cloudinaryPublicId: z.string().min(1),
  isAvailable:        z.boolean().default(true),
  isFeatured:         z.boolean().default(false),
  displayOrder:       z.number().int().default(0),
})

export const menuItemUpdateSchema = menuItemSchema.partial()

export const paymentAccountSchema = z.object({
  accountName:   z.string().min(2).max(100).transform(sanitizeText),
  accountNumber: z.string().min(6).max(20).transform(sanitizeText),
  bankName:      z.string().min(2).max(100).transform(sanitizeText),
})

export const orderSchema = z.object({
  items: z.array(z.object({
    id:       z.string(),
    name:     z.string().transform(sanitizeText),
    price:    z.number().positive().int(),
    quantity: z.number().positive().int().max(20),
    category: z.string(),
  })).min(1),
  deliveryAddress: z.string().min(5).max(500).transform(sanitizeText),
  customerPhone:   z.string().optional().transform((v) => v ? sanitizeText(v) : v),
})

export const orderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']),
})

export const createUserSchema = z.object({
  name:     z.string().min(2).max(100).transform(sanitizeText),
  email:    z.string().email(),
  password: z.string().min(8).max(100),
  role:     z.literal('cashier'),
})

export const updateUserSchema = z.object({
  name:     z.string().min(2).max(100).transform(sanitizeText).optional(),
  password: z.string().min(8).max(100).optional(),
})

export const reorderSchema = z.object({
  order: z.array(z.object({
    id:           z.string().uuid(),
    displayOrder: z.number().int(),
  })),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword:     z.string().min(8).max(100),
})
