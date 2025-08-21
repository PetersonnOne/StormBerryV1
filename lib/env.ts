/**
 * Platform-agnostic environment configuration
 * Handles environment variables and feature flags across different deployment platforms
 */

export interface AppConfig {
  // Core application settings
  app: {
    url: string
    environment: 'development' | 'staging' | 'production'
    platform: 'netlify' | 'railway' | 'vercel' | 'other'
  }
  
  // Feature flags
  features: {
    analytics: boolean
    pwa: boolean
    realTimeChat: boolean
    imageGeneration: boolean
  }
  
  // Authentication
  auth: {
    url: string
    secret: string
  }
  
  // Database
  database: {
    url: string
  }
  
  // Analytics (when enabled)
  analytics: {
    googleAnalyticsId?: string
  }
  
  // Development settings
  development: {
    debugMode: boolean
    skipBuildOptimizations: boolean
  }
}

/**
 * Detect the deployment platform based on environment variables
 */
function detectPlatform(): AppConfig['app']['platform'] {
  // Check for platform-specific environment variables
  if (process.env.NETLIFY) return 'netlify'
  if (process.env.RAILWAY_ENVIRONMENT) return 'railway'
  if (process.env.VERCEL) return 'vercel'
  
  // Check explicit platform setting
  const explicitPlatform = process.env.NEXT_PUBLIC_DEPLOYMENT_PLATFORM
  if (explicitPlatform && ['netlify', 'railway', 'vercel', 'other'].includes(explicitPlatform)) {
    return explicitPlatform as AppConfig['app']['platform']
  }
  
  return 'other'
}

/**
 * Get the application URL based on platform and environment
 */
function getAppUrl(): string {
  // Explicit URL setting takes precedence
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  
  // Platform-specific URL detection
  const platform = detectPlatform()
  
  switch (platform) {
    case 'netlify':
      return process.env.URL || process.env.DEPLOY_PRIME_URL || 'http://localhost:3000'
    
    case 'railway':
      return process.env.RAILWAY_STATIC_URL || 
             `https://${process.env.RAILWAY_SERVICE_NAME}.up.railway.app` ||
             'http://localhost:3000'
    
    case 'vercel':
      return process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
    
    default:
      return process.env.NEXTAUTH_URL || 'http://localhost:3000'
  }
}

/**
 * Parse boolean environment variable with default fallback
 */
function parseBoolean(value: string | undefined, defaultValue: boolean = false): boolean {
  if (!value) return defaultValue
  return value.toLowerCase() === 'true' || value === '1'
}

/**
 * Get the complete application configuration
 */
export function getAppConfig(): AppConfig {
  const platform = detectPlatform()
  const appUrl = getAppUrl()
  
  return {
    app: {
      url: appUrl,
      environment: (process.env.NODE_ENV as AppConfig['app']['environment']) || 'development',
      platform,
    },
    
    features: {
      analytics: parseBoolean(process.env.NEXT_PUBLIC_ENABLE_ANALYTICS, false),
      pwa: parseBoolean(process.env.NEXT_PUBLIC_ENABLE_PWA, true),
      realTimeChat: parseBoolean(process.env.NEXT_PUBLIC_ENABLE_REALTIME_CHAT, true),
      imageGeneration: parseBoolean(process.env.NEXT_PUBLIC_ENABLE_IMAGE_GENERATION, true),
    },
    
    auth: {
      url: process.env.NEXTAUTH_URL || appUrl,
      secret: process.env.NEXTAUTH_SECRET || '',
    },
    
    database: {
      url: process.env.DATABASE_URL || '',
    },
    
    analytics: {
      googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    },
    
    development: {
      debugMode: parseBoolean(process.env.DEBUG_MODE, false),
      skipBuildOptimizations: parseBoolean(process.env.SKIP_BUILD_OPTIMIZATIONS, false),
    },
  }
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
  const config = getAppConfig()
  return config.features[feature]
}

/**
 * Get platform-specific configuration
 */
export function getPlatformConfig() {
  const config = getAppConfig()
  
  return {
    platform: config.app.platform,
    isNetlify: config.app.platform === 'netlify',
    isRailway: config.app.platform === 'railway',
    isVercel: config.app.platform === 'vercel',
    isOther: config.app.platform === 'other',
    
    // Platform-specific features
    supportsEdgeFunctions: config.app.platform === 'vercel' || config.app.platform === 'netlify',
    supportsServerlessDB: config.app.platform === 'vercel' || config.app.platform === 'railway',
  }
}

/**
 * Validate required environment variables
 */
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  const config = getAppConfig()
  
  // Check required variables
  if (!config.auth.secret && config.app.environment === 'production') {
    errors.push('NEXTAUTH_SECRET is required in production')
  }
  
  if (!config.database.url && config.app.environment !== 'development') {
    errors.push('DATABASE_URL is required')
  }
  
  // Platform-specific validations
  const platformConfig = getPlatformConfig()
  
  if (platformConfig.isNetlify && !process.env.URL && config.app.environment === 'production') {
    errors.push('URL environment variable should be set by Netlify')
  }
  
  if (platformConfig.isRailway && !process.env.RAILWAY_ENVIRONMENT && config.app.environment === 'production') {
    errors.push('RAILWAY_ENVIRONMENT should be set by Railway')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Export the configuration for use throughout the app
export const appConfig = getAppConfig()
export const platformConfig = getPlatformConfig()