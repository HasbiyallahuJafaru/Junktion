import { randomBytes } from 'crypto'
import type { menuItems, users } from '@/app/db/schema'

export const koboToNaira = (k: number): number => k / 100
export const nairaToKobo = (n: number): number => Math.round(n * 100)
export const formatPrice  = (k: number): string =>
  `₦${(k / 100).toLocaleString('en-NG')}`

/** Cryptographically secure order reference — e.g. JNK-3FA9C2B1 */
export const generateReference = (): string => {
  const hex = randomBytes(4).toString('hex').toUpperCase()
  return `JNK-${hex}`
}

export const VALID_TRANSITIONS: Record<string, string[]> = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready'],
  ready:     ['delivered'],
  delivered: [],
  cancelled: [],
}

export const isValidTransition = (from: string, to: string): boolean =>
  VALID_TRANSITIONS[from]?.includes(to) ?? false

/** Strip cloudinaryPublicId from public menu responses */
export function toPublicMenuItem(item: typeof menuItems.$inferSelect) {
  const { cloudinaryPublicId, ...rest } = item
  void cloudinaryPublicId
  return rest
}

/** Strip passwordHash from any user response */
export function toSafeUser(user: typeof users.$inferSelect) {
  const { passwordHash, ...rest } = user
  void passwordHash
  return rest
}
