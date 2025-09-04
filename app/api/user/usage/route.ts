import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { UserSettingsService } from '@/lib/services/user-settings'

export async function GET(request: NextRequest) {
  try {
    const { userId, getToken } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get Clerk JWT token for Supabase authentication
    const clerkToken = await getToken({ template: 'supabase' })

    const usageStats = await UserSettingsService.getUserUsageStats(userId, clerkToken || undefined)
    
    if (!usageStats) {
      return NextResponse.json(
        { error: 'Failed to fetch usage stats' },
        { status: 500 }
      )
    }

    return NextResponse.json({ usage: usageStats })
  } catch (error) {
    console.error('Error fetching usage stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage stats' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, getToken } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { activity_type = 'ai_generation', increment = 1 } = body

    // Get Clerk JWT token for Supabase authentication
    const clerkToken = await getToken({ template: 'supabase' })

    const rateLimitResult = await UserSettingsService.checkAndUpdateApiUsage(
      userId,
      activity_type,
      increment,
      clerkToken || undefined
    )
    
    if (!rateLimitResult) {
      return NextResponse.json(
        { error: 'Failed to check rate limit' },
        { status: 500 }
      )
    }

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          ...rateLimitResult
        },
        { status: 429 }
      )
    }

    return NextResponse.json({ 
      success: true,
      ...rateLimitResult
    })
  } catch (error) {
    console.error('Error checking rate limit:', error)
    return NextResponse.json(
      { error: 'Failed to check rate limit' },
      { status: 500 }
    )
  }
}