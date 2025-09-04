### Setup Supabase SQL Scripts
Find the SQL Scripts inside the Migrations project folder

Required Database Tables
I've already created SQL migration files for you. You need to run these in your Supabase SQL Editor:

1. Core GenAI Tables
File: migrations/001_create_genai_tables.sql

genai_texts - stores AI-generated text content
genai_images - stores AI-generated images with URLs and prompts
Includes RLS policies, indexes, and triggers

2. Usage Statistics Table
File: migrations/002_create_usage_stats_table.sql

usage_stats - tracks tokens, costs, interactions per user
Includes RLS policies and performance indexes

🗄️ Database Setup Required
You need to manually create the tables in Supabase before the app will work properly. Here's your setup process:

Step 1: Run SQL Migrations
Open Supabase Dashboard → Go to Your project → SQL Editor
Execute Migration 1 - Run this SQL:
sql
-- Copy content from: migrations/001_create_genai_tables.sql
-- Creates: genai_texts, genai_images tables with RLS policies

Execute Migration 2 - Run this SQL:
sql
-- Copy content from: migrations/002_create_usage_stats_table.sql  
-- Creates: usage_stats table for tracking tokens/costs
Step 2: Verify Tables Created
Check in Supabase Dashboard → Table Editor that you see:

genai_texts
genai_images
usage_stats
Step 3: Environment Variables
Ensure your .env has:

env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key


Important Notes
Row Level Security (RLS): All tables have RLS enabled with user-specific policies
Authentication: Tables use Clerk JWT tokens for user identification
Service Role Access: Backend operations use SUPABASE_SERVICE_ROLE_KEY