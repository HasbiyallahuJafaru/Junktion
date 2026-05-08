# JUNKTION — Cloudinary Integration

## Overview

- Images uploaded via admin dashboard → stored on Cloudinary CDN
- Browser uploads **directly to Cloudinary** using a signed request from the API
- API secret never reaches the browser — only the signature does
- Public images delivered via Cloudinary CDN URL (fast, auto-optimized)
- On item delete → image deleted from Cloudinary automatically

---

## Environment Variables

```bash
# Server-side only (never expose)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Client-side safe (used in upload widget)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

---

## Server Helpers — `/app/lib/cloudinary.ts`

```typescript
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure:     true,
})

/**
 * Generate signed upload params for direct browser → Cloudinary upload.
 * The signature authorizes the upload without exposing the API secret.
 */
export function generateUploadSignature(): {
  signature: string
  timestamp: number
  cloudName: string
  apiKey: string
  folder: string
} {
  const timestamp = Math.round(Date.now() / 1000)
  const folder    = 'junktion/menu'

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  )

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey:    process.env.CLOUDINARY_API_KEY!,
    folder,
  }
}

/**
 * Delete an image from Cloudinary by its public_id.
 * Call this when a menu item is deleted.
 */
export async function deleteImage(publicId: string): Promise<void> {
  const result = await cloudinary.uploader.destroy(publicId)
  if (result.result !== 'ok' && result.result !== 'not found') {
    throw new Error(`Cloudinary delete failed: ${result.result}`)
  }
}

/**
 * Build a Cloudinary URL with circular crop transform.
 * Use for menu item display in the wheel carousel.
 */
export function circularCropUrl(publicId: string, size = 400): string {
  return cloudinary.url(publicId, {
    width:   size,
    height:  size,
    crop:    'fill',
    gravity: 'auto',
    quality: 'auto',
    format:  'webp',
  })
}
```

---

## Upload Sign API — `/app/api/admin/upload/sign/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { generateUploadSignature } from '@/app/lib/cloudinary'
import { requireAuth, isAuthError } from '@/app/lib/apiMiddleware'

export async function POST(req: NextRequest) {
  const user = await requireAuth(req, 'owner')
  if (isAuthError(user)) return user

  try {
    const params = generateUploadSignature()
    return NextResponse.json(params)
  } catch (err) {
    console.error('[POST /api/admin/upload/sign]', err)
    return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 })
  }
}
```

---

## Delete Image API — `/app/api/admin/upload/[publicId]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { deleteImage } from '@/app/lib/cloudinary'
import { requireAuth, isAuthError } from '@/app/lib/apiMiddleware'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { publicId: string } }
) {
  const user = await requireAuth(req, 'owner')
  if (isAuthError(user)) return user

  // publicId may contain slashes — decode from URL encoding
  const publicId = decodeURIComponent(params.publicId)

  try {
    await deleteImage(publicId)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/admin/upload]', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
```

---

## Browser Upload Flow (Admin Image Upload Component)

The browser uploads directly to Cloudinary using the signature from the API.
This avoids routing large image files through Netlify Functions.

```typescript
// In admin menu form component

async function uploadToCloudinary(file: File): Promise<{
  secure_url: string
  public_id: string
}> {
  // 1. Get signature from our API
  const signRes = await authFetch('/api/admin/upload/sign', { method: 'POST' })
  if (!signRes.ok) throw new Error('Failed to get upload signature')
  const { signature, timestamp, cloudName, apiKey, folder } = await signRes.json()

  // 2. Upload directly to Cloudinary
  const formData = new FormData()
  formData.append('file', file)
  formData.append('signature', signature)
  formData.append('timestamp', String(timestamp))
  formData.append('api_key', apiKey)
  formData.append('folder', folder)

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!uploadRes.ok) throw new Error('Cloudinary upload failed')

  const data = await uploadRes.json()
  return { secure_url: data.secure_url, public_id: data.public_id }
}
```

---

## Image Upload UI Component Pattern

```tsx
// In /app/admin/menu/_components/ImageUpload.tsx

interface ImageUploadProps {
  currentUrl?: string
  onUpload: (url: string, publicId: string) => void
  onError: (msg: string) => void
}

// States:
// idle        → shows current image (or placeholder circle) + "Upload" button
// picking     → native file input open
// previewing  → shows selected file preview + "Upload this?" confirm
// uploading   → shows progress indicator over preview
// done        → shows uploaded image + "Change" button

// Accepted types: image/jpeg, image/png, image/webp
// Max size: 5MB (validate before upload)
// Preview: FileReader.readAsDataURL → <img> preview
```

---

## Image Display on Public Site

Menu items fetched from `/api/menu` include `imageUrl` (full Cloudinary URL).
The `MenuWheel` component uses this URL directly in `next/image`:

```tsx
<Image
  src={item.imageUrl}
  alt={item.name}
  fill
  sizes="(max-width: 768px) 120px, 180px"
  className={styles.foodImage}
/>
```

For the orbit hero (static images), use `circularCropUrl()` transform:
```
https://res.cloudinary.com/[cloud]/image/upload/w_240,h_240,c_fill,g_auto,q_auto,f_webp/junktion/menu/[public_id]
```

---

## Folder Structure in Cloudinary

```
junktion/
  menu/          ← all menu item images
    [auto-generated-ids]
```

All images in `junktion/menu/` can be bulk-managed in the Cloudinary dashboard.

---

## On Menu Item Delete

When owner deletes a menu item, the delete handler must:
1. Delete from Neon DB
2. Call `deleteImage(item.cloudinaryPublicId)` to remove from Cloudinary

Both operations in sequence — if Cloudinary delete fails, log the error but
still complete the DB delete (orphaned Cloudinary images can be cleaned manually).

```typescript
// In DELETE /api/admin/menu/[id]/route.ts
const [deleted] = await db.delete(menuItems)
  .where(eq(menuItems.id, params.id))
  .returning()

// Fire and forget — don't block response on Cloudinary
deleteImage(deleted.cloudinaryPublicId).catch(
  (err) => console.error('[Cloudinary cleanup failed]', err)
)

return NextResponse.json({ success: true })
```
