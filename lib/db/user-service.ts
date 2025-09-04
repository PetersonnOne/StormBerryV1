import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server-side client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export interface UserProfile {
  id: string
  user_id: string
  email?: string
  first_name?: string
  last_name?: string
  subscription_tier: 'free' | 'pro'
  subscription_status: 'active' | 'cancelled' | 'expired'
  subscription_start_date?: string
  subscription_end_date?: string
  theme: 'light' | 'dark' | 'system'
  font_size: 'small' | 'medium' | 'large' | 'extra-large'
  contrast: 'normal' | 'high'
  default_ai_model: string
  auto_save: boolean
  compact_mode: boolean
  email_notifications: boolean
  push_notifications: boolean
  marketing_communications: boolean
  analytics_enabled: boolean
  data_sharing_enabled: boolean
  created_at: string
  updated_at: string
}

export interface AIUsageTracking {
  id: string
  user_id: string
  date: string
  gpt5_calls: number
  gemini_calls: number
  total_ai_calls: number
  daily_limit: number
  total_cost: number
  created_at: string
  updated_at: string
}

export interface UsageCheckResult {
  can_proceed: boolean
  calls_used: number
  daily_limit: number
  calls_remaining: number
  subscription_tier: string
  total_cost_today: number
}

export interface UserSettings {
  notifications: {
    email: boolean
    push: boolean
    marketing: boolean
  }
  privacy: {
    analytics: boolean
    dataSharing: boolean
  }
  preferences: {
    defaultModel: string
    autoSave: boolean
    compactMode: boolean
  }
}

class UserService {
  /**
   * Get or create user profile
   */
  async getOrCreateUserProfile(
    userId: string,
    email?: string,
    firstName?: string,
    lastName?: string
  ): Promise<UserProfile> {
    const { data, error } = await supabaseAdmin.rpc('get_or_create_user_profile', {
      p_user_id: userId,
      p_email: email,
      p_first_name: firstName,
      p_last_name: lastName
    })

    if (error) {
      console.error('Error getting/creating user profile:', error)
      throw new Error(`Failed to get user profile: ${error.message}`)
    }

    return data
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      throw new Error(`Failed to update user profile: ${error.message}`)
    }

    return data
  }

  /**
   * Check AI usage and update if allowed
   */
  async checkAndUpdateAIUsage(
    userId: string,
    model: string = 'unknown',
    tokens: number = 1,
    cost: number = 0
  ): Promise<UsageCheckResult> {
    const { data, error } = await supabaseAdmin.rpc('check_and_update_ai_usage', {
      p_user_id: userId,
      p_model: model,
      p_tokens: tokens,
      p_cost: cost
    })

    if (error) {
      console.error('Error checking AI usage:', error)
      throw new Error(`Failed to check AI usage: ${error.message}`)
    }

    return data
  }

  /**
   * Get user usage statistics
   */
  async getUserUsageStats(userId: string, days: number = 30): Promise<any> {
    const { data, error } = await supabaseAdmin.rpc('get_user_usage_stats', {
      p_user_id: userId,
      p_days: days
    })

    if (error) {
      console.error('Error getting usage stats:', error)
      throw new Error(`Failed to get usage stats: ${error.message}`)
    }

    return data
  }

  /**
   * Get today's usage for a user
   */
  async getTodayUsage(userId: string): Promise<AIUsageTracking | null> {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabaseAdmin
      .from('ai_usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error getting today usage:', error)
      throw new Error(`Failed to get today usage: ${error.message}`)
    }

    return data
  }

  /**
   * Update user subscription
   */
  async updateUserSubscription(
    userId: string,
    tier: 'free' | 'pro',
    status: 'active' | 'cancelled' | 'expired',
    startDate?: Date,
    endDate?: Date
  ): Promise<UserProfile> {
    const updates: any = {
      subscription_tier: tier,
      subscription_status: status
    }

    if (startDate) updates.subscription_start_date = startDate.toISOString()
    if (endDate) updates.subscription_end_date = endDate.toISOString()

    return this.updateUserProfile(userId, updates)
  }

  /**
   * Save user settings
   */
  async saveUserSettings(userId: string, settings: UserSettings): Promise<void> {
    // Update user profile with preferences
    await this.updateUserProfile(userId, {
      theme: settings.preferences.defaultModel.includes('dark') ? 'dark' : 'system',
      default_ai_model: settings.preferences.defaultModel,
      auto_save: settings.preferences.autoSave,
      compact_mode: settings.preferences.compactMode,
      email_notifications: settings.notifications.email,
      push_notifications: settings.notifications.push,
      marketing_communications: settings.notifications.marketing,
      analytics_enabled: settings.privacy.analytics,
      data_sharing_enabled: settings.privacy.dataSharing
    })

    // Save additional settings as JSON
    const { error } = await supabaseAdmin
      .from('user_settings')
      .upsert({
        user_id: userId,
        setting_key: 'preferences',
        setting_value: settings
      })

    if (error) {
      console.error('Error saving user settings:', error)
      throw new Error(`Failed to save user settings: ${error.message}`)
    }
  }

  /**
   * Get user settings
   */
  async getUserSettings(userId: string): Promise<UserSettings> {
    // Get profile data
    const profile = await this.getOrCreateUserProfile(userId)
    
    // Get additional settings
    const { data: settingsData } = await supabaseAdmin
      .from('user_settings')
      .select('setting_value')
      .eq('user_id', userId)
      .eq('setting_key', 'preferences')
      .single()

    // Combine profile and settings data
    const settings: UserSettings = {
      notifications: {
        email: profile.email_notifications,
        push: profile.push_notifications,
        marketing: profile.marketing_communications
      },
      privacy: {
        analytics: profile.analytics_enabled,
        dataSharing: profile.data_sharing_enabled
      },
      preferences: {
        defaultModel: profile.default_ai_model,
        autoSave: profile.auto_save,
        compactMode: profile.compact_mode
      }
    }

    // Override with additional settings if available
    if (settingsData?.setting_value) {
      return { ...settings, ...settingsData.setting_value }
    }

    return settings
  }

  /**
   * Check if user can make AI call (rate limiting)
   */
  async canMakeAICall(userId: string): Promise<{
    allowed: boolean
    usage: UsageCheckResult
  }> {
    try {
      const usage = await this.checkAndUpdateAIUsage(userId, 'check', 0, 0)
      return {
        allowed: usage.calls_remaining > 0,
        usage
      }
    } catch (error) {
      console.error('Error checking AI call permission:', error)
      return {
        allowed: false,
        usage: {
          can_proceed: false,
          calls_used: 0,
          daily_limit: 20,
          calls_remaining: 0,
          subscription_tier: 'free',
          total_cost_today: 0
        }
      }
    }
  }

  /**
   * Record AI usage after successful call
   */
  async recordAIUsage(
    userId: string,
    model: string,
    tokens: number,
    cost: number
  ): Promise<UsageCheckResult> {
    return this.checkAndUpdateAIUsage(userId, model, tokens, cost)
  }
}

export const userService = new UserService()
export default userService