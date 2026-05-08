import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

/* Lazy singleton — avoids module-level crash if DATABASE_URL is missing */
let _db: ReturnType<typeof drizzle> | null = null

export function getDb() {
  if (_db) return _db
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL environment variable is not set')
  _db = drizzle(neon(url), { schema })
  return _db
}

/* Keep `db` as a convenience proxy so existing imports don't need changing */
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    return (getDb() as never)[prop as keyof ReturnType<typeof drizzle>]
  },
})
