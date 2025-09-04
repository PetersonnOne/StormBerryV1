-- Migration: Create user profiles and rate limiting tables
-- Run this in Supabase SQL Editor

-- Create user_profiles table for storing user settings and preferences
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT UNIQUE NOT NULL, -- Clerk user ID
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    
    -- Subscription info
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    
    -- User preferences
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large', 'extra-large')),
    contrast TEXT DEFAULT 'normal' CHECK (contrast IN ('normal', 'high')),
    default_ai_model TEXT DEFAULT 'gemini-2.5-pro',
    auto_save BOOLEAN DEFAULT true,
    compact_mode BOOLEAN DEFAULT false,
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT false,
    marketing_communications BOOLEAN DEFAULT false,
    
    -- Privacy preferences
    analytics_enabled BOOLEAN DEFAULT true,
    data_sharing_enabled BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ai_usage_tracking table for rate limiting
CREATE TABLE IF NOT EXISTS ai_usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Clerk user ID
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Daily usage counters
    gpt5_calls INTEGER DEFAULT 0,
    gemini_calls INTEGER DEFAULT 0,
    total_ai_calls INTEGER DEFAULT 0,
    
    -- Usage limits based on subscription
    daily_limit INTEGER DEFAULT 20, -- Free tier: 20 calls/day, Pro: 50 calls/day
    
    -- Cost tracking
    total_cost DECIMAL(10, 6) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint to ensure one record per user per day
    UNIQUE(user_id, date)
);

-- Create user_settings table for additional settings storage
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Clerk user ID
    setting_key TEXT NOT NULL,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint to ensure one setting per key per user
    UNIQUE(user_id, setting_key)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_tier ON user_profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_ai_usage_tracking_user_date ON ai_usage_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_ai_usage_tracking_date ON ai_usage_tracking(date);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_key ON user_settings(user_id, setting_key);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_usage_tracking_updated_at 
    BEFORE UPDATE ON ai_usage_tracking 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON user_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

-- Create RLS policies for ai_usage_tracking
CREATE POLICY "Users can view own usage" ON ai_usage_tracking
    FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own usage" ON ai_usage_tracking
    FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own usage" ON ai_usage_tracking
    FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

-- Create RLS policies for user_settings
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete own settings" ON user_settings
    FOR DELETE USING (user_id = auth.jwt() ->> 'sub');

-- Service role policies for server-side operations
CREATE POLICY "Service role can access all profiles" ON user_profiles
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all usage" ON ai_usage_tracking
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all settings" ON user_settings
    FOR ALL USING (auth.role() = 'service_role');

-- Function to get or create user profile
CREATE OR REPLACE FUNCTION get_or_create_user_profile(p_user_id TEXT, p_email TEXT DEFAULT NULL, p_first_name TEXT DEFAULT NULL, p_last_name TEXT DEFAULT NULL)
RETURNS user_profiles AS $$
DECLARE
    profile user_profiles;
BEGIN
    -- Try to get existing profile
    SELECT * INTO profile FROM user_profiles WHERE user_id = p_user_id;
    
    -- If not found, create new profile
    IF NOT FOUND THEN
        INSERT INTO user_profiles (user_id, email, first_name, last_name)
        VALUES (p_user_id, p_email, p_first_name, p_last_name)
        RETURNING * INTO profile;
    END IF;
    
    RETURN profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and update AI usage
CREATE OR REPLACE FUNCTION check_and_update_ai_usage(
    p_user_id TEXT,
    p_model TEXT DEFAULT 'unknown',
    p_tokens INTEGER DEFAULT 1,
    p_cost DECIMAL DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
    usage_record ai_usage_tracking;
    user_profile user_profiles;
    daily_limit INTEGER;
    can_proceed BOOLEAN := false;
    result JSONB;
BEGIN
    -- Get user profile to determine limits
    SELECT * INTO user_profile FROM user_profiles WHERE user_id = p_user_id;
    
    -- Set daily limit based on subscription tier
    IF user_profile.subscription_tier = 'pro' THEN
        daily_limit := 50;
    ELSE
        daily_limit := 20;
    END IF;
    
    -- Get or create today's usage record
    INSERT INTO ai_usage_tracking (user_id, date, daily_limit)
    VALUES (p_user_id, CURRENT_DATE, daily_limit)
    ON CONFLICT (user_id, date) 
    DO UPDATE SET updated_at = NOW()
    RETURNING * INTO usage_record;
    
    -- Check if user can make another call
    IF usage_record.total_ai_calls < usage_record.daily_limit THEN
        can_proceed := true;
        
        -- Update usage counters
        UPDATE ai_usage_tracking 
        SET 
            total_ai_calls = total_ai_calls + 1,
            gpt5_calls = CASE WHEN p_model LIKE '%gpt%' THEN gpt5_calls + 1 ELSE gpt5_calls END,
            gemini_calls = CASE WHEN p_model LIKE '%gemini%' THEN gemini_calls + 1 ELSE gemini_calls END,
            total_cost = total_cost + p_cost,
            updated_at = NOW()
        WHERE user_id = p_user_id AND date = CURRENT_DATE
        RETURNING * INTO usage_record;
    END IF;
    
    -- Return result
    result := jsonb_build_object(
        'can_proceed', can_proceed,
        'calls_used', usage_record.total_ai_calls,
        'daily_limit', usage_record.daily_limit,
        'calls_remaining', usage_record.daily_limit - usage_record.total_ai_calls,
        'subscription_tier', user_profile.subscription_tier,
        'total_cost_today', usage_record.total_cost
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user usage stats
CREATE OR REPLACE FUNCTION get_user_usage_stats(p_user_id TEXT, p_days INTEGER DEFAULT 30)
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_calls', COALESCE(SUM(total_ai_calls), 0),
        'total_cost', COALESCE(SUM(total_cost), 0),
        'gpt5_calls', COALESCE(SUM(gpt5_calls), 0),
        'gemini_calls', COALESCE(SUM(gemini_calls), 0),
        'days_active', COUNT(*),
        'avg_calls_per_day', COALESCE(AVG(total_ai_calls), 0)
    ) INTO stats
    FROM ai_usage_tracking 
    WHERE user_id = p_user_id 
    AND date >= CURRENT_DATE - INTERVAL '1 day' * p_days;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;