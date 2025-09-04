# Database Setup Guide - Storm Berry V1 User Settings & Rate Limiting

## 🎯 Overview

This guide will help you set up the complete user settings and rate limiting system for Storm Berry V1. The system includes:

- **User Settings Storage**: AI preferences, voice settings, accessibility options, UI preferences, and privacy settings
- **Rate Limiting**: 20 API calls/day for Free tier, 50 API calls/day for Pro tier
- **Usage Analytics**: Track daily, weekly, and monthly usage
- **Activity Logging**: Log all AI operations for monitoring and billing

## 📋 Prerequisites

1. ✅ Supabase project created
2. ✅ Clerk authentication configured
3. ✅ Environment variables set in `.env.local`

## 🗄️ Database Setup

### Step 1: Run the Database Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `StormBerryV1GPT5`
3. Navigate to **SQL Editor** in the left sidebar
4. Create a new query
5. Copy and paste the entire contents of `setup-database.sql`
6. Click **Run** to execute the migration

### Step 2: Verify Tables Created

After running the migration, verify these tables exist in **Database > Tables**:

- ✅ `profiles` - User profiles and subscription info
- ✅ `user_settings` - Detailed user preferences
- ✅ `user_api_usage` - Daily API usage tracking
- ✅ `user_activity_log` - Activity logging

### Step 3: Configure Clerk JWT Template

1. Go to Clerk Dashboard: https://dashboard.clerk.com
2. Navigate to **JWT Templates**
3. Create a new template named `supabase`
4. Use this configuration:

```json
{
  "aud": "authenticated",
  "exp": "{{user.created_at + 3600}}",
  "iat": "{{user.created_at}}",
  "iss": "https://your-clerk-domain.clerk.accounts.dev",
  "sub": "{{user.id}}",
  "role": "authenticated"
}
```

## 🔧 Environment Variables

Ensure your `.env.local` has these Supabase variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xozepepaicfiqvdgkvql.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
```

## 🚀 Testing the Implementation

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Test User Settings

1. Sign in to your app
2. Navigate to `/settings`
3. You should see:
   - ✅ Usage statistics (Today: 0, Remaining: 20, etc.)
   - ✅ All settings sections loading
   - ✅ Ability to change AI model, theme, notifications, etc.
   - ✅ Save button working

### 3. Test Rate Limiting

1. Go to the Chat module
2. Make AI requests
3. Check that usage statistics update
4. Try to exceed daily limit (20 calls for free tier)
5. Should see rate limit error message

### 4. Verify Database Updates

In Supabase SQL Editor, run:

```sql
-- Check user settings
SELECT * FROM user_settings LIMIT 5;

-- Check API usage
SELECT * FROM user_api_usage LIMIT 5;

-- Check activity log
SELECT * FROM user_activity_log LIMIT 5;
```

## 📊 Rate Limiting Details

### Free Tier (Default)
- **Daily Limit**: 20 AI API calls
- **Features**: Basic AI models, standard voice synthesis
- **Cost**: Free

### Pro Tier
- **Daily Limit**: 50 AI API calls  
- **Features**: Premium AI models, advanced voice options
- **Cost**: $9.99/month (configured in Polar)

### Rate Limit Behavior
- Limits reset daily at midnight UTC
- Exceeded limits return HTTP 429 status
- Users see upgrade prompts when limits reached
- Usage tracked per user per day

## 🔒 Security Features

### Row Level Security (RLS)
- Users can only access their own data
- Automatic user ID filtering on all queries
- Clerk JWT authentication required

### Data Privacy
- User consent tracking for analytics
- GDPR-compliant data collection settings
- Secure data deletion capabilities

## 🛠️ API Endpoints

The following API routes are now available:

### User Settings
- `GET /api/user/settings` - Get user settings
- `PUT /api/user/settings` - Update user settings

### Usage & Rate Limiting  
- `GET /api/user/usage` - Get usage statistics
- `POST /api/user/usage` - Check/update rate limits

## 🎨 UI Components

### Settings Page Features
- **Real-time usage statistics** with visual charts
- **AI model selection** (GPT-5, Gemini Pro, Gemini Flash)
- **Voice preferences** (ElevenLabs, AI-ML, Browser)
- **Accessibility options** (font size, high contrast, screen reader)
- **Privacy controls** (analytics, data sharing, marketing)
- **Theme selection** (light, dark, system)
- **Subscription management** with Polar integration

### Usage Statistics Display
- Today's usage vs daily limit
- Remaining calls for today
- Weekly and monthly totals
- Tier-based limit indicators
- Upgrade prompts for free users

## 🔄 Integration with Existing Features

### AI Services
- Rate limiting automatically applied to all AI calls
- Usage logged for billing and analytics
- Model preferences respected from user settings

### Voice Features
- Voice provider selection from user settings
- Speed and pitch preferences applied
- Usage tracking for voice synthesis

### Accessibility Module
- Settings automatically applied to UI
- Font size, contrast, and screen reader support
- Persistent across sessions

## 🐛 Troubleshooting

### Common Issues

1. **Settings not loading**
   - Check Supabase connection
   - Verify Clerk JWT template
   - Check browser console for errors

2. **Rate limiting not working**
   - Verify database functions created
   - Check API route authentication
   - Test with Supabase SQL editor

3. **Usage statistics showing 0**
   - Make some AI requests first
   - Check user_api_usage table
   - Verify user ID matching

### Debug Commands

```sql
-- Check if user exists in profiles
SELECT * FROM profiles WHERE id = 'your-user-id';

-- Check user settings
SELECT * FROM user_settings WHERE user_id = 'your-user-id';

-- Check today's usage
SELECT * FROM user_api_usage WHERE user_id = 'your-user-id' AND date = CURRENT_DATE;

-- Test rate limit function
SELECT check_and_update_api_usage('your-user-id', 'ai_generation', 1);
```

## ✅ Success Checklist

- [ ] Database tables created successfully
- [ ] Clerk JWT template configured
- [ ] Environment variables set
- [ ] Settings page loads with real data
- [ ] Usage statistics display correctly
- [ ] Rate limiting works (test with 21+ requests)
- [ ] Settings save and persist
- [ ] Upgrade to Pro flow works
- [ ] All UI components responsive

## 🎉 Congratulations!

Your Storm Berry V1 now has a complete user settings and rate limiting system! Users can:

- Customize their AI and voice preferences
- Track their usage in real-time
- Upgrade to Pro for higher limits
- Manage privacy and accessibility settings
- Have their preferences persist across sessions

The system is production-ready with proper security, rate limiting, and user experience features.

## 📞 Support

If you encounter any issues:

1. Check the browser console for JavaScript errors
2. Verify Supabase logs in the dashboard
3. Test API endpoints directly with curl/Postman
4. Review the database setup in Supabase SQL editor

Your user settings and rate limiting system is now fully operational! 🚀