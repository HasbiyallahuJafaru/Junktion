import { NextRequest, NextResponse } from 'next/server'
import { clearRefreshCookie } from '@/app/lib/auth'

export async function POST(_req: NextRequest) {
  clearRefreshCookie()
  return NextResponse.json({ success: true })
}
