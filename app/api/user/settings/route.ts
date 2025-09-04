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

    const settings = await UserSettingsService.getUserSettings(userId, clerkToken || undefined)
    
    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = await UserSettingsService.createDefaultSettings(userId)
      return NextResponse.json({ settings: defaultSettings })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, getToken } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { settings } = body

    if (!settings) {
      return NextResponse.json(
        { error: 'Settings data is required' },
        { status: 400 }
      )
    }

    // Get Clerk JWT token for Supabase authentication
    const clerkToken = await getToken({ template: 'supabase' })

    const updatedSettings = await UserSettingsService.updateUserSettings(userId, settings, clerkToken || undefined)
    
    if (!updatedSettings) {
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      settings: updatedSettings,
      message: 'Settings updated successfully'
    })
  } catch (error) {
    console.error('Error updating user settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}