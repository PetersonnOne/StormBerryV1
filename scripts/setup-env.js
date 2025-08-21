#!/usr/bin/env node

/**
 * Environment setup script for different deployment platforms
 */

const fs = require('fs');
const path = require('path');

const platform = process.env.DEPLOYMENT_PLATFORM || 'local';

console.log(`Setting up environment for platform: ${platform}`);

// Platform-specific environment variables
const platformEnvs = {
  netlify: {
    NEXT_PUBLIC_DEPLOYMENT_PLATFORM: 'netlify',
    NEXT_PUBLIC_ENABLE_ANALYTICS: 'true',
    NEXT_PUBLIC_ENABLE_PWA: 'true',
  },
  railway: {
    NEXT_PUBLIC_DEPLOYMENT_PLATFORM: 'railway',
    NEXT_PUBLIC_ENABLE_ANALYTICS: 'true',
    NEXT_PUBLIC_ENABLE_PWA: 'true',
  },
  vercel: {
    NEXT_PUBLIC_DEPLOYMENT_PLATFORM: 'vercel',
    NEXT_PUBLIC_ENABLE_ANALYTICS: 'true',
    NEXT_PUBLIC_ENABLE_PWA: 'true',
  },
  local: {
    NEXT_PUBLIC_DEPLOYMENT_PLATFORM: 'local',
    NEXT_PUBLIC_ENABLE_ANALYTICS: 'false',
    NEXT_PUBLIC_ENABLE_PWA: 'true',
  }
};

// Get environment variables for the current platform
const envVars = platformEnvs[platform] || platformEnvs.local;

// Create or update .env.local file
const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';

// Read existing .env.local if it exists
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Add or update platform-specific variables
Object.entries(envVars).forEach(([key, value]) => {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  const newLine = `${key}=${value}`;
  
  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, newLine);
  } else {
    envContent += `\n${newLine}`;
  }
});

// Write updated environment file
fs.writeFileSync(envPath, envContent.trim() + '\n');

console.log(`Environment setup complete for ${platform}`);
console.log('Environment variables set:');
Object.entries(envVars).forEach(([key, value]) => {
  console.log(`  ${key}=${value}`);
});