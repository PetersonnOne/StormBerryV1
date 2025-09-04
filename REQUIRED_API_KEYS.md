# 🔑 Required API Keys for Storm Berry V1

## 🚨 **Status: Updated AI Model Configuration!**

Your application has been updated with new AI model priorities:

✅ **Gemini API Key** - Configured (Primary)  
✅ **OpenAI API Key** - Configured (Disabled for now)  
⚠️ **OpenRouter API Key** - Needs Configuration (New fallback)  
✅ **Supabase Database** - Configured  
✅ **Clerk Authentication** - Configured  

## 📋 **Current API Key Status**

### 1. **OpenAI API Key** ✅ CONFIGURED (DISABLED)
```env
OPENAI_API_KEY=kb6e608f6dac43149b9d41f3b0ljy4040
```
- **Status**: Configured but disabled
- **Used for**: GPT-5 models (coming soon)
- **Features**: Will be available in future updates

### 2. **Google Gemini API Key** ✅ CONFIGURED (PRIMARY)
```env
GEMINI_API_KEY=AIzaSyB2kYyCHtv7sJgnQGbkdVmKBI68Hx_pWac
```
- **Status**: Active and configured (Primary models)
- **Used for**: Gemini 2.5 Pro, Gemini 2.5 Flash
- **Features**: Fast AI responses, image analysis

### 3. **OpenRouter API Key** ⚠️ NEEDS CONFIGURATION
```env
OPENROUTER_API_KEY=your-openrouter-api-key-here
```
- **Status**: Not configured (Final fallback)
- **Used for**: GPT-OSS 120B (Free OpenAI model)
- **Features**: 117B parameter model, free tier available

### 4. **Supabase Database** ✅ CONFIGURED
```env
NEXT_PUBLIC_SUPABASE_URL=https://xozepepaicfiqvdgkvql.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[configured]
SUPABASE_SERVICE_ROLE_KEY=[configured]
```
- **Status**: Active and configured
- **Used for**: User data, settings, usage tracking
- **Features**: Real-time database, authentication

### 5. **Clerk Authentication** ✅ CONFIGURED
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=[configured]
CLERK_SECRET_KEY=[configured]
```
- **Status**: Active and configured
- **Used for**: User authentication, session management
- **Features**: Secure login, user profiles

## 🚀 **Updated AI Model Priority!**

Your application now uses this fallback order:

1. **Gemini 2.5 Pro** (Primary) - Fast, reliable, free tier
2. **Gemini 2.5 Flash** (Secondary) - Ultra-fast responses
3. **GPT-OSS 120B** (Final fallback) - Free OpenAI model via OpenRouter

**GPT-5 is disabled** but visible as "Coming Soon" in the UI.

## 🔧 **To Complete Setup:**

**Add OpenRouter API Key** for GPT-OSS 120B fallback:
1. Go to [openrouter.ai](https://openrouter.ai)
2. Create account and get API key
3. Add to `.env.local`: `OPENROUTER_API_KEY=your-key-here`

## 🧪 **Test Your Setup**

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test AI features**:
   - Go to `/chat`
   - Try different models (GPT-5, Gemini Pro, Gemini Flash)
   - Check if responses are generated

3. **Test authentication**:
   - Go to `/sign-in`
   - Create account or login
   - Check if user profile loads

4. **Test settings**:
   - Go to `/settings`
   - Check usage statistics
   - Verify rate limiting works

## 🔧 **If You Still Get Errors**

### OpenAI API Key Error:
```bash
# Restart the development server
npm run dev
```

### Database Connection Error:
1. Check Supabase project status at [supabase.com](https://supabase.com)
2. Verify database tables exist (run `setup-database.sql`)

### Authentication Error:
1. Check Clerk dashboard at [clerk.com](https://clerk.com)
2. Verify domain settings match `localhost:3000`

## 💡 **Optional Enhancements**

You can add these optional API keys for additional features:

### ElevenLabs (Voice Features):
```env
ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

### Anthropic Claude:
```env
ANTHROPIC_API_KEY=your-anthropic-api-key
```

### Cohere:
```env
COHERE_API_KEY=your-cohere-api-key
```

## 🔒 **Security Reminders**

- ✅ Never commit `.env.local` to version control
- ✅ Use different keys for development and production
- ✅ Monitor API usage and set billing alerts
- ✅ Rotate keys regularly for security

## 📞 **Need Help?**

If you're still experiencing issues:

1. **Check the console** for specific error messages
2. **Verify API key formats** (OpenAI keys start with `sk-`)
3. **Test individual services** (Supabase, Clerk dashboards)
4. **Restart the development server** after any `.env.local` changes

Your Storm Berry V1 application should be fully functional with the current configuration! 🎉