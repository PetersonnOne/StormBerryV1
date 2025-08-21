🔹 Storm Berry Module Development Prompts

Creative Toos with GPT 5, you can find GPT 5 prompting Guide at https://cookbook.openai.com/examples/gpt-5/gpt-5_prompting_guide

Module 1 — Education: AI Mentor & Adaptive Learning
Goal: Provide personalized, multimodal tutoring that understands each learner’s style, level, and goals.
Core Features
Multi-modal Q&A (multi-modal Prompt Input): Users can ask via text, voice, or image (e.g., upload a photo of a handwritten equation).
Adaptive Lesson Generation: GPT-5 detects the user’s current knowledge level and creates tailored lessons.
Real-time Quizzing & Feedback: Instant practice questions with feedback and hints.
Progress Tracking: Stores completed lessons, quiz scores, and recommendations in user profile.
Multi-language Support: Auto-translates content and supports global languages.
Offline Mode (Basic Content): Core lessons cached locally when no internet.

Prompt for Education Module
You are an expert full-stack developer specializing in React Native + Netlify Blobs + GPT-5 integration.
Build the "AI Mentor" Education Module for the Web app with these features:
1. Multi-modal Q&A input (text, voice, image). Use React Native Voice for speech-to-text, image-picker for image uploads.
2. GPT-5 integration to answer questions, generate lessons, and adapt explanations to the learner's current knowledge level.
3. Real-time quiz generator using GPT-5, with instant feedback, hints, and answer explanations.
4. Netlify Blobs to store lessons, quiz history, progress, and personalized recommendations.
5. Multi-language support with i18n integration, using GPT-5 for translation/localization.
6. Offline mode: Cache basic lessons and quizzes in AsyncStorage for offline access.
7. Modern UI with Tailwind CSS (nativewind), supporting light/dark mode.
Code must be modular and exportable as a standalone Education Module component with all logic separated into hooks and service files.

Module 2 — Business/Productivity: AI Workflow Orchestrator
Goal: Let users automate complex business tasks with GPT-5 reasoning + API integrations.
Core Features
Workflow Builder: Drag-and-drop interface to chain tasks (e.g., “Draft proposal → Summarize → Email client (using Resend API”).
Data Connectors: Resend email APIs at https://resend.com/docs/introduction  etc.
Function Calling in GPT-5: AI decides which external API to call at each step.
Document Analysis: Upload contracts, proposals, or spreadsheets for GPT-5 to review, summarize, and flag risks.
Meeting Summarizer: Summarize transcripts for AI-generated summaries + action items.
Prompt for Business/Productivity Module
You are an expert full-stack developer specializing in React (web) + Next.js + Netlify + GPT-5 function calling.
Build the "AI Workflow Orchestrator" Business Module for the web app with these features:
1. Workflow Builder UI: Drag-and-drop components to chain steps such as text generation, summarization, translation, email sending, etc.
2. GPT-5: Let GPT-5 be able to open and work with docs and files from Netlify Blob storage files like Google Docs, MS Docs, PDF, CSV, Text files etc.
3. Document Analyzer: Allow file uploads (PDF, DOCX, XLSX), parse them, and send parsed content to GPT-5 for risk analysis, summarization, and recommendations.
4. Meeting Transcript Summarizer: Let GPT-5 be able to produce AI-generated summaries and action items.
5. Netlify Blob storage for user-created workflows and logs.
6. Clean, responsive UI with Tailwind CSS and modular service-based architecture.
Export this as a WorkflowModule with separate API connector services.

Module 3 — Creativity: Collaborative Story & Media Creator
Goal: Human + AI co-create stories, art, and multimedia content in real time.
Core Features
Storyboard Canvas: Create/write stories with AI suggestions.
AI-Generated Visuals: Integrate flux-pro for scene/character art.
Interactive World Building: GPT-5 maintains lore, maps, and character arcs.
Media Export: Export stories as illustrated books (MS Docs, PDF etc.), or interactive web pages.
Idea Spark Mode: AI pitches plot twists, character backstories, or visual prompts.
Voiceover & Audio Generation: Narration using Eleven Labs text-to-speech APIs from AIML at https://docs.aimlapi.com/quickstart/setting-up

Prompt for Creativity Module
You are an expert full-stack developer specializing in collaborative real-time apps with Netlify Blobs + GPT-5 + AI image generation.
Build the "Collaborative Story & Media Creator" Creativity Module for the Web app with these features:
1. Real-time story editor.
2. GPT-5 as a "lore keeper" to ensure story consistency, suggest plot developments, and expand on user-written scenes.
3. AI image generation integration with flux-pro (using API Key integration from https://docs.aimlapi.com/quickstart/setting-up) for scene/character art.
4. Interactive world-building tools: Map creator, character database, and lore glossary stored in Netlify Blobs.
5. Export functionality to produce illustrated ebooks (Docs, EPUB, PDF) or interactive story web pages.
6. Text-to-speech narration with Eleven Labs using API Key integration from AIML, because they have Eleven Labs Speech AI as one of their LLM implementations. So, do not use the native Eleven Labs Speech AI API from/at www.ElevenLabs.io use the one from AIML at https://docs.aimlapi.com/quickstart/setting-up 
7. Modern UI with a visual canvas, drag-and-drop components, and Tailwind styling.
Code must be modular and exportable as StoryModule with hooks for AI writing, image generation, and real-time sync.

Module 4 — Accessibility: AI Companion for the Deaf & Hard of Hearing
Goal: Real-time transcription, sign language translation, and summarization to improve accessibility.
Core Features
Live Transcription: Speech-to-text in real time during conversations (Using Eleven Labs APIs from AIML at https://docs.aimlapi.com/quickstart/setting-up.)
Sign Language Avatar: Convert AI transcripts to sign language animations.
Conversation Summarization: GPT-5 produces short summaries and key points after each session.
Multi-language Support: Real-time translation before transcription or sign output.
Offline Mode: Basic transcription works without internet; summaries require GPT-5.
Custom Alerts: Highlight important words or phrases during live transcription.


Prompt for Accessibility Module
You are an expert mobile developer specializing in real-time AI APIs.
Build the "AI Companion for the Deaf" Accessibility Module for the web app with these features:
1. Real-time speech-to-text transcription using React Native Voice and WebSocket streaming APIs.
2. GPT-5 summarization and key point extraction after each session.
3. Sign language avatar integration (use open-source avatar library such as SignAll or WebGL-based animations) to translate transcripts into sign language.
4. Multi-language translation layer using GPT-5 before transcription/sign output.
5. Offline mode for basic transcription with AsyncStorage; GPT-5 features disabled offline.
6. Highlight important phrases in live transcript (e.g., user-defined keywords).
7. Clean, accessible UI with large text options and high contrast modes.
Export as AccessibilityModule with separate services for transcription, sign rendering, and GPT-5 summarization.


🔹 Rate Limiting & Tier Management (Super Admin Controlled)
⚙️ Requirements

Tier Types (the default tier or every user is the free tier, except when the Super Admin manually upgrades a user)

Free → 20 daily OSS calls (no GPT-5 calls).

Pro → 50 GPT-5 calls + 50 OSS calls daily.

Enterprise → 500 GPT-5 calls + 1000 OSS calls daily.

Tier limits must not be hard-coded.

SuperAdmin should be able to adjust quotas from a secure Admin Dashboard which is then saved to logs.


Admin Dashboard: 

Separate from user dashboards (only Super Admin sees this).

Allows setting:

Tier quotas (GPT-5 calls/day, OSS calls/day)

Global override values (maintenance, testing, etc.)

View usage logs per user/project.

Rate Limiting Logic

On each API call:

Identify user tier → fetch quotas from Super Admin tiers table from Blob files/logs.

Check current usage in usage_logs.

If within limits → proceed.

If exceeded → return friendly error (e.g., “You’ve reached today’s limit, upgrade or wait until tomorrow”).

Quotas reset daily (Netlify Functions).



🔹 Rate Limiting Check Flow

When user makes an API call

Middleware checks usage_counters for today.

Fetches tier_id → joins tiers → gets quota.

If counters +1 > quota → block request.

Else → increment counter & log in usage_logs.

Daily Reset

Netlify Function runs nightly at 00:00 UTC → clears counters for next day.

🔹 Prompt for Rate Limiting System
You are an AI Coding IDE.
Task: Implement dynamic API rate limiting with Netlify functions integration.
Requirements:
1. Extend schema with:
   - users (linked to tier_id)
   - tiers (quotas editable by Supa Admin)
   - usage_logs (all calls made)
   - usage_counters (daily counts)
2. Build middleware to enforce:
   - Free: 20 OSS calls/day, 0 GPT-5 calls
   - Pro: 50 GPT-5 calls/day, 50 OSS calls/day
   - Enterprise: 500 GPT-5 calls/day, 1000 OSS calls/day
   - Values must come from DB (not hardcoded).
3. Super Admin Dashboard:
   - List and edit tier quotas (form inputs).
   - View per-user usage and logs.
   - Adjust quotas dynamically (live apply).
4. Quotas reset daily at midnight with Netlify Function.
5. Frontend: Users see their remaining calls in their dashboard (read-only).
6. Friendly error if user exceeds limit.
7. All API calls must log usage (engine type, timestamp).

