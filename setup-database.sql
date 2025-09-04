-- User Settings and Rate Limiting Setup for Storm Berry V1
-- Run this script in your Supabase SQL Editor

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_settings table for detailed settings
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- AI Preferences
  default_ai_model TEXT DEFAULT 'gemini-2.5-pro',
  ai_temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (ai_temperature >= 0 AND ai_temperature <= 2),
  max_tokens INTEGER DEFAULT 1000 CHECK (max_tokens > 0 AND max_tokens <= 4000),
  
  -- Voice Preferences
  default_voice_provider TEXT DEFAULT 'elevenlabs' CHECK (default_voice_provider IN ('elevenlabs', 'ai-ml', 'browser')),
  voice_speed DECIMAL(3,2) DEFAULT 1.0 CHECK (voice_speed >= 0.5 AND voice_speed <= 2.0),
  voice_pitch DECIMAL(3,2) DEFAULT 1.0 CHECK (voice_pitch >= 0.5 AND voice_pitch <= 2.0),
  
  -- Accessibility Preferences
  font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large', 'extra-large')),
  high_contrast BOOLEAN DEFAULT FALSE,
  screen_reader_enabled BOOLEAN DEFAULT FALSE,
  
  -- UI Preferences
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  compact_mode BOOLEAN DEFAULT FALSE,
  auto_save BOOLEAN DEFAULT TRUE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  
  -- Privacy Preferences
  data_collection_consent BOOLEAN DEFAULT FALSE,
  analytics_consent BOOLEAN DEFAULT FALSE,
  marketing_consent BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_api_usage table for rate limiting
CREATE TABLE IF NOT EXISTS user_api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  ai_calls_count INTEGER DEFAULT 0,
  voice_calls_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create user_activity_log table for tracking usage
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_details JSONB DEFAULT '{}'::jsonb,
  tokens_used INTEGER DEFAULT 0,
  cost_incurred DECIMAL(10,6) DEFAULT 0,
  model_used TEXT,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_api_usage_user_date ON user_api_usage(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_api_usage_updated_at ON user_api_usage;
CREATE TRIGGER update_user_api_usage_updated_at BEFORE UPDATE ON user_api_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get or create user settings
CREATE OR REPLACE FUNCTION get_or_create_user_settings(p_user_id UUID)
RETURNS user_settings AS $$
DECLARE
    settings_record user_settings;
BEGIN
    -- Try to get existing settings
    SELECT * INTO settings_record FROM user_settings WHERE user_id = p_user_id;
    
    -- If no settings exist, create default ones
    IF NOT FOUND THEN
        INSERT INTO user_settings (user_id) VALUES (p_user_id)
        RETURNING * INTO settings_record;
    END IF;
    
    RETURN settings_record;
END;
$$ LANGUAGE plpgsql;

-- Function to check and update API usage
CREATE OR REPLACE FUNCTION check_and_update_api_usage(
    p_user_id UUID,
    p_activity_type TEXT,
    p_increment INTEGER DEFAULT 1
)
RETURNS JSONB AS $$
DECLARE
    current_usage INTEGER;
    daily_limit INTEGER;
    user_tier TEXT;
    usage_record user_api_usage;
BEGIN
    -- Get user subscription tier
    SELECT subscription_tier INTO user_tier FROM profiles WHERE id = p_user_id;
    
    -- If no profile exists, create one with free tier
    IF user_tier IS NULL THEN
        INSERT INTO profiles (id, subscription_tier) VALUES (p_user_id, 'free')
        ON CONFLICT (id) DO UPDATE SET subscription_tier = 'free';
        user_tier := 'free';
    END IF;
    
    -- Set daily limits based on tier
    IF user_tier = 'pro' THEN
        daily_limit := 50;
    ELSE
        daily_limit := 20;
    END IF;
    
    -- Get or create today's usage record
    INSERT INTO user_api_usage (user_id, date, ai_calls_count)
    VALUES (p_user_id, CURRENT_DATE, 0)
    ON CONFLICT (user_id, date) DO NOTHING;
    
    -- Get current usage
    SELECT * INTO usage_record FROM user_api_usage 
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
    
    current_usage := usage_record.ai_calls_count;
    
    -- Check if user has exceeded limit
    IF current_usage >= daily_limit THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'current_usage', current_usage,
            'daily_limit', daily_limit,
            'tier', user_tier,
            'message', 'Daily API limit exceeded. Upgrade to Pro for higher limits.'
        );
    END IF;
    
    -- Update usage count
    UPDATE user_api_usage 
    SET ai_calls_count = ai_calls_count + p_increment,
        updated_at = NOW()
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
    
    RETURN jsonb_build_object(
        'allowed', true,
        'current_usage', current_usage + p_increment,
        'daily_limit', daily_limit,
        'tier', user_tier,
        'remaining', daily_limit - (current_usage + p_increment)
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get user usage stats
CREATE OR REPLACE FUNCTION get_user_usage_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    today_usage INTEGER;
    weekly_usage INTEGER;
    monthly_usage INTEGER;
    user_tier TEXT;
    daily_limit INTEGER;
BEGIN
    -- Get user tier
    SELECT subscription_tier INTO user_tier FROM profiles WHERE id = p_user_id;
    
    -- If no profile exists, create one with free tier
    IF user_tier IS NULL THEN
        INSERT INTO profiles (id, subscription_tier) VALUES (p_user_id, 'free')
        ON CONFLICT (id) DO UPDATE SET subscription_tier = 'free';
        user_tier := 'free';
    END IF;
    
    -- Set daily limit
    IF user_tier = 'pro' THEN
        daily_limit := 50;
    ELSE
        daily_limit := 20;
    END IF;
    
    -- Get today's usage
    SELECT COALESCE(ai_calls_count, 0) INTO today_usage
    FROM user_api_usage 
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
    
    -- Get weekly usage
    SELECT COALESCE(SUM(ai_calls_count), 0) INTO weekly_usage
    FROM user_api_usage 
    WHERE user_id = p_user_id 
    AND date >= CURRENT_DATE - INTERVAL '7 days';
    
    -- Get monthly usage
    SELECT COALESCE(SUM(ai_calls_count), 0) INTO monthly_usage
    FROM user_api_usage 
    WHERE user_id = p_user_id 
    AND date >= CURRENT_DATE - INTERVAL '30 days';
    
    RETURN jsonb_build_object(
        'today', COALESCE(today_usage, 0),
        'weekly', weekly_usage,
        'monthly', monthly_usage,
        'daily_limit', daily_limit,
        'tier', user_tier,
        'remaining_today', daily_limit - COALESCE(today_usage, 0)
    );
END;
$$ LANGUAGE plpgsql;

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for user_settings
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_api_usage
DROP POLICY IF EXISTS "Users can view own usage" ON user_api_usage;
CREATE POLICY "Users can view own usage" ON user_api_usage
    FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policies for user_activity_log
DROP POLICY IF EXISTS "Users can view own activity" ON user_activity_log;
CREATE POLICY "Users can view own activity" ON user_activity_log
    FOR SELECT USING (auth.uid() = user_id);

-- Insert default settings for existing users (if any)
INSERT INTO user_settings (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_settings WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;