/**
 * TypeScript declarations for Google Analytics - DISABLED
 * These declarations are kept for compatibility but analytics is disabled
 */

declare global {
  interface Window {
    // Analytics disabled - these properties won't be used
    dataLayer?: any[]
    gtag?: (...args: any[]) => void
  }
}

export {}