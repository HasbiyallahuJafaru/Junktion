import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError, checkCsrf } from '@/app/lib/apiMiddleware'
import { generateUploadSignature } from '@/app/lib/cloudinary'

export async function POST(req: NextRequest) {
  const csrf = checkCsrf(req)
  if (csrf) return csrf

  const auth = await requireAuth(req, 'owner')
  if (isAuthError(auth)) return auth

  try {
    const sig = generateUploadSignature('junktion/menu')
    return NextResponse.json(sig)
  } catch (err) {
    console.error('[upload/sign POST]', err)
    return NextResponse.json({ error: 'Failed to sign upload' }, { status: 500 })
  }
}
