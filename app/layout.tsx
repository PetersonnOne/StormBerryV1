import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from 'react-hot-toast'
// Analytics temporarily disabled for deployment
// import { Analytics } from '@/components/analytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Storm Berry - Time Management & Productivity Platform',
  description: 'Optimize your time and boost productivity with intelligent scheduling, task management, and time tracking tools.',
  keywords: ['Time Management', 'Productivity', 'Scheduling', 'Task Management', 'Time Tracking', 'Efficiency'],
  authors: [{ name: 'Storm Berry Team' }],
  creator: 'Storm Berry',
  publisher: 'Storm Berry',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Storm Berry - Time Management & Productivity Platform',
    description: 'Optimize your time and boost productivity with intelligent scheduling, task management, and time tracking tools.',
    siteName: 'Storm Berry',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ryte Time',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Storm Berry - Time Management & Productivity Platform',
    description: 'Optimize your time and boost productivity with intelligent scheduling, task management, and time tracking tools.',
    images: ['/og-image.png'],
    creator: '@rytetime',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        {/* Removed ClerkProvider to disable authentication globally */}
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
          {/* Analytics temporarily disabled for deployment */}
          {/* <Analytics /> */}
        </Providers>
      </body>
    </html>
  )
}