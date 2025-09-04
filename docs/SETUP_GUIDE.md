# Storm Berry V1 - Complete Setup Guide

## 🔧 Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```env
# =============================================================================
# AI/ML SERVICES
# =============================================================================

# OpenAI API (for GPT-5 features)
OPENAI_API_KEY=your-openai-api-key-here

# Google Gemini API (for AI features)
GEMINI_API_KEY=your-gemini-api-key-here

# Anthropic Claude API (for AI features - optional)
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# ElevenLabs API (for premium voice features)
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here

# AI-ML API (existing integration - optional)
NEXT_PUBLIC_AIML_API_KEY=your-aiml-api-key-here

# =============================================================================
# POLAR PAYMENT GATEWAY
# =============================================================================

# Polar Access Token (from your Polar dashboard)
POLAR_ACCESS_TOKEN=your-polar-access-token

# Polar Success URL (where users are redirected after successful payment)
POLAR_SUCCESS_URL=http://localhost:3000/billing/success?checkout_id={CHECKOUT_ID}

# Polar Webhook Secret (for webhook verification)
POLAR_WEBHOOK_SECRET=your-webhook-secret

# Polar Product IDs (from your Polar dashboard)
NEXT_PUBLIC_POLAR_PRO_MONTHLY_PRODUCT_ID=your-pro-monthly-product-id
NEXT_PUBLIC_POLAR_PRO_YEARLY_PRODUCT_ID=your-pro-yearly-product-id

# =============================================================================
# CLERK AUTHENTICATION
# =============================================================================

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

# =============================================================================
# CORE APPLICATION SETTINGS
# =============================================================================

# Application URL (adjust for your deployment)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# =============================================================================
# SUPABASE DATABASE
# =============================================================================

# Supabase Project URL (from your Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Supabase Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Optional: Database URL for direct connections
DATABASE_URL=your-database-url

# =============================================================================
# OPTIONAL INTEGRATIONS
# =============================================================================

# Upstash Redis (for caching)
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Google Services (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## 🚀 AI Model Configuration

### Default Fallback Chain:
1. **Gemini 2.5 Pro** (Primary - Cost effective, high quality)
2. **Gemini 2.5 Flash** (Fallback 1 - Fast, lower cost)
3. **GPT-5** (Fallback 2 - Premium backup)

### Model Pricing (Approximate):
- **Gemini 2.5 Pro**: $0.000005 per token
- **Gemini 2.5 Flash**: $0.000001 per token  
- **GPT-5**: $0.00005 per token

## 🎵 Voice Configuration

### ElevenLabs Setup:
- **Voice ID**: `scOwDtmlUjD3prqpp97I` (pre-configured)
- **Model**: `eleven_multilingual_v2`
- **Quality**: Premium natural voice synthesis

### Voice Options Available:
1. **ElevenLabs (Premium)**: Highest quality, natural voice
2. **AI-ML API**: Good quality, fast processing
3. **Browser (Offline)**: Basic quality, no internet required

## 💳 Polar Payment Setup

### Required Configuration:
1. Create account at [polar.sh](https://polar.sh)
2. Set up your organization and products
3. Configure webhook endpoint: `https://yourdomain.com/api/webhook/polar`
4. Copy access token and webhook secret
5. Create Pro tier products and copy product IDs

### Upgrade Flow:
- Users can upgrade via header dropdown "Upgrade to Pro"
- Checkout opens in new tab with pre-filled customer info
- Success redirects to `/billing/success` page
- Webhooks handle subscription activation

## 🧪 Testing Checklist

### AI System:
- [ ] Test Gemini 2.5 Pro (primary model)
- [ ] Test fallback to Gemini 2.5 Flash
- [ ] Test final fallback to GPT-5
- [ ] Verify status notifications (4-second auto-hide)
- [ ] Test error handling for all model failures

### Voice System:
- [ ] Test ElevenLabs TTS with different settings
- [ ] Test ElevenLabs STT (5-second recording)
- [ ] Test AI-ML API fallback
- [ ] Test browser offline mode
- [ ] Verify audio playback controls

### Payment Integration:
- [ ] Test "Upgrade to Pro" in header dropdown
- [ ] Verify Polar checkout opens correctly
- [ ] Test success page redirection
- [ ] Verify webhook delivery

### Accessibility Module:
- [ ] Test Speech-to-Text tab functionality
- [ ] Test Text-to-Speech tab functionality
- [ ] Test voice provider switching
- [ ] Test language selection
- [ ] Test text highlighting features

## 🔑 API Keys Required

### Essential (for core functionality):
1. **OPENAI_API_KEY**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **GEMINI_API_KEY**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
3. **CLERK Keys**: Get from [Clerk Dashboard](https://dashboard.clerk.com/)

### Premium Features:
4. **ELEVENLABS_API_KEY**: Get from [ElevenLabs](https://elevenlabs.io/app/settings/api-keys)
5. **POLAR Keys**: Get from [Polar Dashboard](https://polar.sh/dashboard)

### Optional:
6. **ANTHROPIC_API_KEY**: Get from [Anthropic Console](https://console.anthropic.com/)
7. **AIML_API_KEY**: Get from [AI/ML API](https://aimlapi.com/)

## 🚦 Quick Start

1. **Clone and Install**:
   ```bash
   git clone <your-repo>
   cd stormberry-v1
   npm install
   ```

2. **Setup Environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

3. **Start Development**:
   ```bash
   npm run dev
   ```

4. **Test Features**:
   - Visit `/chat` to test AI system
   - Visit `/accessibility` to test voice features
   - Click user dropdown → "Upgrade to Pro" to test payments

## 🎯 Key Features Implemented

✅ **Enhanced AI System**: Gemini 2.5 Pro default with intelligent fallbacks  
✅ **Premium Voice**: ElevenLabs integration with multiple quality options  
✅ **Payment Integration**: Polar checkout with header upgrade option  
✅ **Status Notifications**: Real-time AI model status with auto-hide  
✅ **Accessibility**: Dual voice options (premium + fallback)  
✅ **Cost Optimization**: Gemini default reduces API costs significantly  

## 🔮 Production Deployment

### Environment Updates for Production:
```env
# Update URLs for production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
POLAR_SUCCESS_URL=https://yourdomain.com/billing/success?checkout_id={CHECKOUT_ID}

# Use production Polar settings
# Change server: "sandbox" to "production" in API routes
```

### Security Checklist:
- [ ] All API keys are secure and not exposed
- [ ] Webhook endpoints are properly secured
- [ ] CORS settings are configured
- [ ] Rate limiting is implemented
- [ ] Error logging is set up

Your Storm Berry V1 application is now ready with enhanced AI capabilities, premium voice features, and seamless payment integration! 🚀