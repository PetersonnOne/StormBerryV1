import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client with custom headers for Clerk JWT
export const createSupabaseClient = (authToken?: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authToken ? {
        Authorization: `Bearer ${authToken}`,
      } : {},
    },
  })
}

// Database types
export interface GenAIText {
  id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface GenAIImage {
  id: string
  user_id: string
  url: string
  prompt?: string
  created_at: string
  updated_at: string
}
