// Test Rate Limiting - Run this in browser console after signing in
// This script will test the rate limiting functionality

async function testRateLimit() {
  console.log('🧪 Testing Rate Limiting System...')
  
  let successCount = 0
  let rateLimitHit = false
  
  // Test up to 25 requests (should hit limit at 20 for free tier)
  for (let i = 1; i <= 25; i++) {
    try {
      console.log(`📡 Making request ${i}...`)
      
      const response = await fetch('/api/user/usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          activity_type: 'ai_generation',
          increment: 1
        }),
      })
      
      const data = await response.json()
      
      if (response.status === 429) {
        console.log(`🚫 Rate limit hit at request ${i}`)
        console.log('Rate limit data:', data)
        rateLimitHit = true
        break
      } else if (response.ok) {
        successCount++
        console.log(`✅ Request ${i} successful. Remaining: ${data.remaining}`)
      } else {
        console.log(`❌ Request ${i} failed:`, data)
        break
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (error) {
      console.error(`💥 Error on request ${i}:`, error)
      break
    }
  }
  
  console.log('\n📊 Test Results:')
  console.log(`✅ Successful requests: ${successCount}`)
  console.log(`🚫 Rate limit hit: ${rateLimitHit ? 'Yes' : 'No'}`)
  
  // Get final usage stats
  try {
    const usageResponse = await fetch('/api/user/usage')
    const usageData = await usageResponse.json()
    console.log('\n📈 Final Usage Stats:', usageData.usage)
  } catch (error) {
    console.error('Error getting usage stats:', error)
  }
}

// Run the test
testRateLimit()

// Also test getting user settings
async function testUserSettings() {
  console.log('\n⚙️ Testing User Settings...')
  
  try {
    const response = await fetch('/api/user/settings')
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ User settings loaded:', data.settings)
    } else {
      console.log('❌ Failed to load settings:', data)
    }
  } catch (error) {
    console.error('💥 Error loading settings:', error)
  }
}

// Test settings after rate limit test
setTimeout(testUserSettings, 3000)