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

export default clerkMiddleware((auth, req) => {
  // Protect dashboard and API routes
  if (isProtectedRoute(req)) {
    auth().protect()
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
