#!/usr/bin/env node

/**
 * Environment validation script
 * Run this script to validate your environment configuration
 */

const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

function validateEnvironment() {
  console.log('🔍 Validating environment configuration...\n')
  
  const errors = []
  const warnings = []
  const info = []
  
  // Detect platform
  let platform = 'other'
  if (process.env.NETLIFY) platform = 'netlify'
  else if (process.env.RAILWAY_ENVIRONMENT) platform = 'railway'
  else if (process.env.VERCEL) platform = 'vercel'
  else if (process.env.NEXT_PUBLIC_DEPLOYMENT_PLATFORM) {
    platform = process.env.NEXT_PUBLIC_DEPLOYMENT_PLATFORM
  }
  
  info.push(`Platform detected: ${platform}`)
  
  // Check Node environment
  const nodeEnv = process.env.NODE_ENV || 'development'
  info.push(`Node environment: ${nodeEnv}`)
  
  // Validate required variables for production
  if (nodeEnv === 'production') {
    if (!process.env.NEXTAUTH_SECRET) {
      errors.push('NEXTAUTH_SECRET is required in production')
    }
    
    if (!process.env.DATABASE_URL) {
      errors.push('DATABASE_URL is required in production')
    }
  }
  
  // Check feature flags
  const features = {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    pwa: process.env.NEXT_PUBLIC_ENABLE_PWA,
    realTimeChat: process.env.NEXT_PUBLIC_ENABLE_REALTIME_CHAT,
    imageGeneration: process.env.NEXT_PUBLIC_ENABLE_IMAGE_GENERATION,
  }
  
  info.push('Feature flags:')
  Object.entries(features).forEach(([key, value]) => {
    const enabled = value === 'true'
    info.push(`  - ${key}: ${enabled ? '✅ enabled' : '❌ disabled'}`)
  })
  
  // Check analytics configuration
  if (features.analytics === 'true') {
    if (!process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID) {
      warnings.push('Analytics is enabled but NEXT_PUBLIC_GOOGLE_ANALYTICS_ID is not set')
    } else {
      info.push('✅ Analytics properly configured')
    }
  } else {
    info.push('ℹ️  Analytics is disabled (recommended for deployment)')
  }
  
  // Check URL configuration
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL
  if (appUrl) {
    info.push(`App URL: ${appUrl}`)
  } else if (nodeEnv === 'production') {
    warnings.push('No app URL configured for production')
  }
  
  // Platform-specific checks
  switch (platform) {
    case 'netlify':
      if (nodeEnv === 'production' && !process.env.URL) {
        warnings.push('URL should be automatically set by Netlify')
      }
      break
      
    case 'railway':
      if (nodeEnv === 'production' && !process.env.RAILWAY_STATIC_URL) {
        warnings.push('RAILWAY_STATIC_URL should be automatically set by Railway')
      }
      break
      
    case 'vercel':
      if (nodeEnv === 'production' && !process.env.VERCEL_URL) {
        warnings.push('VERCEL_URL should be automatically set by Vercel')
      }
      break
  }
  
  // Print results
  console.log('📋 Validation Results:\n')
  
  if (info.length > 0) {
    console.log('ℹ️  Information:')
    info.forEach(msg => console.log(`   ${msg}`))
    console.log()
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  Warnings:')
    warnings.forEach(msg => console.log(`   ${msg}`))
    console.log()
  }
  
  if (errors.length > 0) {
    console.log('❌ Errors:')
    errors.forEach(msg => console.log(`   ${msg}`))
    console.log()
    console.log('❌ Environment validation failed!')
    process.exit(1)
  } else {
    console.log('✅ Environment validation passed!')
  }
  
  // Check if .env.local exists
  if (!fs.existsSync('.env.local')) {
    console.log('\n💡 Tip: Copy .env.example to .env.local and configure your local environment')
  }
}

// Run validation
validateEnvironment()