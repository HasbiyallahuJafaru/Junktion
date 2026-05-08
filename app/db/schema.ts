import {
  pgTable, uuid, text, integer, boolean,
  timestamp, jsonb, pgEnum, varchar, index
} from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', ['owner', 'cashier'])
export const categoryEnum = pgEnum('category', [
  'shawarma', 'sandwich', 'pasta', 'rice', 'sides', 'drinks'
])
export const orderStatusEnum = pgEnum('order_status', [
  'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'
])

export const users = pgTable('users', {
  id:                 uuid('id').primaryKey().defaultRandom(),
  email:              text('email').notNull().unique(),
  passwordHash:       text('password_hash').notNull(),
  name:               text('name').notNull(),
  role:               roleEnum('role').notNull().default('cashier'),
  isActive:           boolean('is_active').notNull().default(true),
  mustChangePassword: boolean('must_change_password').notNull().default(false),
  lastLoginAt:        timestamp('last_login_at'),
  createdAt:          timestamp('created_at').notNull().defaultNow(),
  updatedAt:          timestamp('updated_at').notNull().defaultNow(),
})

export const menuItems = pgTable('menu_items', {
  id:                 uuid('id').primaryKey().defaultRandom(),
  name:               text('name').notNull(),
  description:        text('description').notNull(),
  price:              integer('price').notNull(),
  category:           categoryEnum('category').notNull(),
  imageUrl:           text('image_url').notNull(),
  cloudinaryPublicId: text('cloudinary_public_id').notNull(),
  isAvailable:        boolean('is_available').notNull().default(true),
  isFeatured:         boolean('is_featured').notNull().default(false),
  displayOrder:       integer('display_order').notNull().default(0),
  createdAt:          timestamp('created_at').notNull().defaultNow(),
  updatedAt:          timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  categoryIdx:  index('menu_category_idx').on(t.category),
  availableIdx: index('menu_available_idx').on(t.isAvailable),
}))

export const paymentAccounts = pgTable('payment_accounts', {
  id:            uuid('id').primaryKey().defaultRandom(),
  accountName:   text('account_name').notNull(),
  accountNumber: varchar('account_number', { length: 20 }).notNull(),
  bankName:      text('bank_name').notNull(),
  isPrimary:     boolean('is_primary').notNull().default(false),
  isActive:      boolean('is_active').notNull().default(true),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
})

export interface OrderItemJSON {
  id: string
  name: string
  price: number
  quantity: number
  category: string
}

export const loginAttempts = pgTable('login_attempts', {
  id:          uuid('id').primaryKey().defaultRandom(),
  email:       text('email').notNull(),
  ip:          text('ip').notNull(),
  attemptedAt: timestamp('attempted_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  emailTimeIdx: index('login_attempts_email_time_idx').on(t.email, t.attemptedAt),
  ipTimeIdx:    index('login_attempts_ip_time_idx').on(t.ip, t.attemptedAt),
}))

export const rateLimitLog = pgTable('rate_limit_log', {
  id:          uuid('id').primaryKey().defaultRandom(),
  ip:          text('ip').notNull(),
  route:       text('route').notNull(),
  requestedAt: timestamp('requested_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  ipRouteTimeIdx: index('rate_limit_ip_route_time_idx').on(t.ip, t.route, t.requestedAt),
}))

export const orders = pgTable('orders', {
  id:               uuid('id').primaryKey().defaultRandom(),
  reference:        varchar('reference', { length: 16 }).notNull().unique(),
  items:            jsonb('items').$type<OrderItemJSON[]>().notNull(),
  total:            integer('total').notNull(),
  deliveryAddress:  text('delivery_address').notNull(),
  customerPhone:    text('customer_phone'),
  status:           orderStatusEnum('status').notNull().default('pending'),
  paymentAccountId: uuid('payment_account_id').references(() => paymentAccounts.id),
  createdAt:        timestamp('created_at').notNull().defaultNow(),
  updatedAt:        timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  referenceIdx: index('order_reference_idx').on(t.reference),
  statusIdx:    index('order_status_idx').on(t.status),
  createdIdx:   index('order_created_idx').on(t.createdAt),
}))
