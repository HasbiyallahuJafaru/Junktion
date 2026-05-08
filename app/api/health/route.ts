import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks: Record<string, string> = {}

  checks.DATABASE_URL      = process.env.DATABASE_URL      ? 'set' : 'MISSING'
  checks.JWT_PRIVATE_KEY   = process.env.JWT_PRIVATE_KEY   ? 'set' : 'MISSING'
  checks.JWT_PUBLIC_KEY    = process.env.JWT_PUBLIC_KEY    ? 'set' : 'MISSING'
  checks.CLOUDINARY_CLOUD  = process.env.CLOUDINARY_CLOUD_NAME ? 'set' : 'MISSING'

  let dbPing = 'not tested'
  if (process.env.DATABASE_URL) {
    try {
      const { db } = await import('@/app/db')
      await db.execute('SELECT 1' as never)
      dbPing = 'ok'
    } catch (e) {
      dbPing = `error: ${e instanceof Error ? e.message : String(e)}`
    }
  }

  return NextResponse.json({ status: 'ok', checks, dbPing })
}
