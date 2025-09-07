/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    forceSwcTransforms: true,
  },
  webpack: (config, { isServer }) => {
    // Fix module resolution issues on case-sensitive filesystems
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    };
    return config;
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
  env: {
    GROQ_API_KEY: process.env.GROQ_API_KEY || '',
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  },
}

module.exports = nextConfig