import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client with Clerk JWT
export const createSupabaseServerClient = (clerkToken?: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: clerkToken ? {
        Authorization: `Bearer ${clerkToken}`,
      } : {},
    },
  })
}

// Types for our database tables
export interface UserSettings {
  id: string
  user_id: string
  default_ai_model: string
  ai_temperature: number
  max_tokens: number
  default_voice_provider: string
  voice_speed: number
  voice_pitch: number
  font_size: string
  high_contrast: boolean
  screen_reader_enabled: boolean
  theme: string
  compact_mode: boolean
  auto_save: boolean
  notifications_enabled: boolean
  data_collection_consent: boolean
  analytics_consent: boolean
  marketing_consent: boolean
  created_at: string
  updated_at: string
}

export interface UserApiUsage {
  id: string
  user_id: string
  date: string
  ai_calls_count: number
  voice_calls_count: number
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  settings: Record<string, any>
  subscription_tier: 'free' | 'pro'
  subscription_expires_at?: string
  created_at: string
  updated_at: string
}

export interface UserActivityLog {
  id: string
  user_id: string
  activity_type: string
  activity_details: Record<string, any>
  tokens_used: number
  cost_incurred: number
  model_used?: string
  success: boolean
  error_message?: string
  created_at: string
}

export interface UsageStats {
  today: number
  weekly: number
  monthly: number
  daily_limit: number
  tier: 'free' | 'pro'
  remaining_today: number
}

export interface RateLimitResult {
  allowed: boolean
  current_usage: number
  daily_limit: number
  tier: 'free' | 'pro'
  remaining?: number
  message?: string
}