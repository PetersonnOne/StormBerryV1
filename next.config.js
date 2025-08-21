/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'localhost', 
      'vercel.app', 
      'netlify.app',
      'railway.app', 
      'github.com',
    ],
    formats: ['image/webp', 'image/avif'],
  },
}

module.exports = nextConfig