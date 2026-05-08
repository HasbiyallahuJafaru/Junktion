import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError, checkCsrf } from '@/app/lib/apiMiddleware'
import { deleteCloudinaryAsset } from '@/app/lib/cloudinary'

const PUBLIC_ID_RE = /^[a-zA-Z0-9_\-/.]+$/

export async function DELETE(
  req: NextRequest,
  { params }: { params: { publicId: string } }
) {
  const csrf = checkCsrf(req)
  if (csrf) return csrf

  const auth = await requireAuth(req, 'owner')
  if (isAuthError(auth)) return auth

  const publicId = decodeURIComponent(params.publicId)

  if (!PUBLIC_ID_RE.test(publicId)) {
    return NextResponse.json({ error: 'Invalid public_id' }, { status: 400 })
  }

  try {
    await deleteCloudinaryAsset(publicId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[upload DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 })
  }
}
