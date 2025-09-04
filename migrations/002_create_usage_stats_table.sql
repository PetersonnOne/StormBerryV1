-- Create usage_stats table for tracking AI model usage and costs
CREATE TABLE IF NOT EXISTS usage_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    model TEXT NOT NULL,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
    interaction_type TEXT NOT NULL,
    prompt TEXT,
    response_time INTEGER,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_id ON usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_created_at ON usage_stats(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_created ON usage_stats(user_id, created_at);

-- Enable Row Level Security
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for user data access
CREATE POLICY "Users can only access their own usage stats" ON usage_stats
    FOR ALL USING (auth.jwt() ->> 'sub' = user_id);

-- Create policy for service role (for server-side operations)
CREATE POLICY "Service role can access all usage stats" ON usage_stats
    FOR ALL USING (auth.role() = 'service_role');
