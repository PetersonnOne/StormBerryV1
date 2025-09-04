'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { UserSettings, UsageStats } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

interface UseUserSettingsReturn {
  settings: UserSettings | null
  usage: UsageStats | null
  isLoading: boolean
  error: string | null
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<boolean>
  refreshUsage: () => Promise<void>
  checkRateLimit: (activityType?: string, increment?: number) => Promise<boolean>
}

export function useUserSettings(): UseUserSettingsReturn {
  const { user, isLoaded } = useUser()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user settings
  const fetchSettings = async () => {
    if (!user?.id) return

    try {
      const response = await fetch('/api/user/settings')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch settings')
      }

      setSettings(data.settings)
      setError(null)
    } catch (err) {
      console.error('Error fetching settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch settings')
    }
  }

  // Fetch usage statistics
  const fetchUsage = async () => {
    if (!user?.id) return

    try {
      const response = await fetch('/api/user/usage')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch usage')
      }

      setUsage(data.usage)
    } catch (err) {
      console.error('Error fetching usage:', err)
    }
  }

  // Update user settings
  const updateSettings = async (newSettings: Partial<UserSettings>): Promise<boolean> => {
    if (!user?.id) {
      toast.error('User not authenticated')
      return false
    }

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: newSettings }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update settings')
      }

      setSettings(data.settings)
      toast.success('Settings updated successfully')
      return true
    } catch (err) {
      console.error('Error updating settings:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings'
      toast.error(errorMessage)
      setError(errorMessage)
      return false
    }
  }

  // Refresh usage statistics
  const refreshUsage = async () => {
    await fetchUsage()
  }

  // Check rate limit before API calls
  const checkRateLimit = async (activityType = 'ai_generation', increment = 1): Promise<boolean> => {
    if (!user?.id) {
      toast.error('User not authenticated')
      return false
    }

    try {
      const response = await fetch('/api/user/usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activity_type: activityType, increment }),
      })

      const data = await response.json()

      if (response.status === 429) {
        // Rate limit exceeded
        toast.error(data.message || 'Daily API limit exceeded. Upgrade to Pro for higher limits.')
        return false
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check rate limit')
      }

      // Update usage stats
      await refreshUsage()
      return true
    } catch (err) {
      console.error('Error checking rate limit:', err)
      toast.error('Failed to check rate limit')
      return false
    }
  }

  // Load data when user is available
  useEffect(() => {
    if (isLoaded && user?.id) {
      setIsLoading(true)
      Promise.all([fetchSettings(), fetchUsage()])
        .finally(() => setIsLoading(false))
    } else if (isLoaded && !user) {
      setIsLoading(false)
      setSettings(null)
      setUsage(null)
    }
  }, [isLoaded, user?.id])

  return {
    settings,
    usage,
    isLoading,
    error,
    updateSettings,
    refreshUsage,
    checkRateLimit,
  }
}