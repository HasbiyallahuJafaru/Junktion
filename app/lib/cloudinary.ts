import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
})

/** Generate a signed upload signature for client-side uploads */
export function generateUploadSignature(folder: string): {
  signature: string
  timestamp: number
  apiKey: string
  cloudName: string
} {
  const timestamp = Math.round(Date.now() / 1000)
  // format: 'jpg' converts HEIC/WebP/etc to JPEG at upload time so all browsers can display them
  const params    = { timestamp, folder, format: 'jpg' }
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!)

  return {
    signature,
    timestamp,
    apiKey:    process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  }
}

/** Delete an asset from Cloudinary by public_id */
export async function deleteCloudinaryAsset(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}
