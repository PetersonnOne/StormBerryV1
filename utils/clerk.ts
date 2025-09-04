import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/public(.*)'
])

// Protected dashboard routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/chat(.*)',
  '/accessibility(.*)',
  '/education(.*)',
  '/business(.*)',
  '/story(.*)',
  '/settings(.*)',
  '/api/genai(.*)',
  '/api/protected(.*)'
])

export const middleware = clerkMiddleware((auth, req) => {
  // Protect dashboard and API routes
  if (isProtectedRoute(req)) {
    auth().protect()
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}

// Clerk configuration for the app
export const clerkConfig = {
  appearance: {
    baseTheme: undefined,
    variables: {
      colorPrimary: '#3b82f6',
      colorBackground: '#ffffff',
      colorInputBackground: '#ffffff',
      colorInputText: '#1f2937',
    },
    elements: {
      formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
      card: 'shadow-lg border border-gray-200',
    },
  },
  localization: {
    signIn: {
      start: {
        title: 'Welcome to Storm Berry',
        subtitle: 'Sign in to access your productivity dashboard',
      },
    },
    signUp: {
      start: {
        title: 'Join Storm Berry',
        subtitle: 'Create your account to get started',
      },
    },
  },
}

// JWT template configuration for Supabase integration
export const supabaseJWTTemplate = {
  name: 'supabase',
  claims: {
    aud: 'authenticated',
    role: 'authenticated',
    sub: '{{user.id}}',
    email: '{{user.primary_email_address.email_address}}',
  },
  lifetime: 3600, // 1 hour
}
