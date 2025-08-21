'use client'

// Analytics component - DISABLED for deployment
// This component is temporarily disabled to prevent build issues
// All analytics functionality has been stubbed out

interface AnalyticsConfig {
  googleAnalyticsId?: string
  enableTracking: boolean
}

interface AnalyticsProvider {
  initialize(): void
  trackPageView(url: string): void
  trackEvent(event: string, properties?: Record<string, any>): void
}

// Stub implementation - does nothing but prevents errors
class DisabledAnalyticsProvider implements AnalyticsProvider {
  initialize(): void {
    // Analytics disabled - no operation
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics is disabled for deployment')
    }
  }

  trackPageView(url: string): void {
    // Analytics disabled - no operation
  }

  trackEvent(event: string, properties?: Record<string, any>): void {
    // Analytics disabled - no operation
  }
}

// Analytics configuration - always returns disabled
const getAnalyticsConfig = (): AnalyticsConfig => {
  return {
    googleAnalyticsId: undefined,
    enableTracking: false // Force disabled
  }
}

// Global analytics instance - always null
let analyticsProvider: AnalyticsProvider | null = null

export function Analytics() {
  // Component does nothing - analytics disabled
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics component loaded but disabled for deployment')
  }
  return null
}

// Export stub utility functions - safe to call but do nothing
export const analytics = {
  trackPageView: (url: string) => {
    // Analytics disabled - no operation
  },
  trackEvent: (event: string, properties?: Record<string, any>) => {
    // Analytics disabled - no operation
  }
} 