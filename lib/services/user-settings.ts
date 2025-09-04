import { supabase, createSupabaseServerClient, UserSettings, UsageStats, RateLimitResult } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export class UserSettingsService {
  /**
   * Get user settings from database
   */
  static async getUserSettings(userId: string, clerkToken?: string): Promise<UserSettings | null> {
    try {
      const client = clerkToken ? createSupabaseServerClient(clerkToken) : supabase
      const { data, error } = await client
        .rpc('get_or_create_user_settings', { p_user_id: userId })
        .single()

      if (error) {
        console.error('Error fetching user settings:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getUserSettings:', error)
      return null
    }
  }

  /**
   * Update user settings in database
   */
  static async updateUserSettings(
    userId: string, 
    settings: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>,
    clerkToken?: string
  ): Promise<UserSettings | null> {
    try {
      const client = clerkToken ? createSupabaseServerClient(clerkToken) : supabase
      const { data, error } = await client
        .from('user_settings')
        .update(settings)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user settings:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in updateUserSettings:', error)
      return null
    }
  }

  /**
   * Get user usage statistics
   */
  static async getUserUsageStats(userId: string, clerkToken?: string): Promise<UsageStats | null> {
    try {
      const client = clerkToken ? createSupabaseServerClient(clerkToken) : supabase
      const { data, error } = await client
        .rpc('get_user_usage_stats', { p_user_id: userId })
        .single()

      if (error) {
        console.error('Error fetching usage stats:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getUserUsageStats:', error)
      return null
    }
  }

  /**
   * Check and update API usage (rate limiting)
   */
  static async checkAndUpdateApiUsage(
    userId: string,
    activityType: string = 'ai_generation',
    increment: number = 1,
    clerkToken?: string
  ): Promise<RateLimitResult | null> {
    try {
      const client = clerkToken ? createSupabaseServerClient(clerkToken) : supabase
      const { data, error } = await client
        .rpc('check_and_update_api_usage', {
          p_user_id: userId,
          p_activity_type: activityType,
          p_increment: increment
        })
        .single()

      if (error) {
        console.error('Error checking API usage:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in checkAndUpdateApiUsage:', error)
      return null
    }
  }

  /**
   * Log user activity
   */
  static async logActivity(
    userId: string,
    activityType: string,
    details: {
      model_used?: string
      tokens_used?: number
      cost_incurred?: number
      success?: boolean
      error_message?: string
      activity_details?: Record<string, any>
    }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_activity_log')
        .insert({
          user_id: userId,
          activity_type: activityType,
          model_used: details.model_used,
          tokens_used: details.tokens_used || 0,
          cost_incurred: details.cost_incurred || 0,
          success: details.success ?? true,
          error_message: details.error_message,
          activity_details: details.activity_details || {}
        })

      if (error) {
        console.error('Error logging activity:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in logActivity:', error)
      return false
    }
  }

  /**
   * Update user subscription tier
   */
  static async updateSubscriptionTier(
    userId: string,
    tier: 'free' | 'pro',
    expiresAt?: Date
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_tier: tier,
          subscription_expires_at: expiresAt?.toISOString()
        })
        .eq('id', userId)

      if (error) {
        console.error('Error updating subscription tier:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateSubscriptionTier:', error)
      return false
    }
  }

  /**
   * Get user profile with subscription info
   */
  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getUserProfile:', error)
      return null
    }
  }

  /**
   * Create default settings for new user
   */
  static async createDefaultSettings(userId: string): Promise<UserSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .insert({ user_id: userId })
        .select()
        .single()

      if (error) {
        console.error('Error creating default settings:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createDefaultSettings:', error)
      return null
    }
  }

  /**
   * Get default settings object
   */
  static getDefaultSettings(): Partial<UserSettings> {
    return {
      default_ai_model: 'gemini-2.5-pro',
      ai_temperature: 0.7,
      max_tokens: 1000,
      default_voice_provider: 'elevenlabs',
      voice_speed: 1.0,
      voice_pitch: 1.0,
      font_size: 'medium',
      high_contrast: false,
      screen_reader_enabled: false,
      theme: 'system',
      compact_mode: false,
      auto_save: true,
      notifications_enabled: true,
      data_collection_consent: false,
      analytics_consent: false,
      marketing_consent: false
    }
  }
}