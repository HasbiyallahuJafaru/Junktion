/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Linting is run separately in CI; don't fail the build on ESLint errors
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

export default nextConfig
