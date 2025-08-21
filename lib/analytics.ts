/**
 * Analytics utility functions - DISABLED for deployment
 * All analytics functionality has been stubbed out to prevent build issues
 * This maintains the same API but does nothing
 */

interface AnalyticsEvent {
  name: string
  properties?: {
    page?: string
    user_id?: string
    timestamp?: number
    [key: string]: any
  }
}

class DisabledAnalyticsManager {
  private isEnabled: boolean = false // Force disabled

  constructor() {
    // Analytics is disabled for deployment
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics manager initialized but disabled for deployment')
    }
  }

  /**
   * Track a page view - DISABLED
   */
  trackPageView(url: string): void {
    // Analytics disabled - no operation
  }

  /**
   * Track a custom event - DISABLED
   */
  trackEvent(event: AnalyticsEvent): void {
    // Analytics disabled - no operation
  }

  /**
   * Track user interactions - DISABLED
   */
  trackUserInteraction(action: string, category: string, label?: string): void {
    // Analytics disabled - no operation
  }

  /**
   * Track feature usage - DISABLED
   */
  trackFeatureUsage(feature: string, details?: Record<string, any>): void {
    // Analytics disabled - no operation
  }

  /**
   * Track errors - DISABLED
   */
  trackError(error: Error, context?: string): void {
    // Analytics disabled - no operation
  }

  /**
   * Check if analytics is enabled - always returns false
   */
  get enabled(): boolean {
    return false // Always disabled
  }
}

// Export singleton instance - disabled version
export const analytics = new DisabledAnalyticsManager()

// Export types for external use
export type { AnalyticsEvent }