-- Migration: Create GenAI tables for text and image storage
-- Run this in Supabase SQL Editor

-- Create genai_texts table
CREATE TABLE IF NOT EXISTS genai_texts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create genai_images table
CREATE TABLE IF NOT EXISTS genai_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    prompt TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_genai_texts_user_id ON genai_texts(user_id);
CREATE INDEX IF NOT EXISTS idx_genai_texts_created_at ON genai_texts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_genai_images_user_id ON genai_images(user_id);
CREATE INDEX IF NOT EXISTS idx_genai_images_created_at ON genai_images(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_genai_texts_updated_at 
    BEFORE UPDATE ON genai_texts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_genai_images_updated_at 
    BEFORE UPDATE ON genai_images 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE genai_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE genai_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for genai_texts
CREATE POLICY "Users can view own texts" ON genai_texts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own texts" ON genai_texts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own texts" ON genai_texts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own texts" ON genai_texts
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for genai_images
CREATE POLICY "Users can view own images" ON genai_images
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images" ON genai_images
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own images" ON genai_images
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own images" ON genai_images
    FOR DELETE USING (auth.uid() = user_id);
