import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { aiService } from '@/lib/ai/unified-ai-service'
import { usageStatsService } from '@/lib/db/usage-stats'
import { z } from 'zod'

const lessonRequestSchema = z.object({
  topic: z.string().min(1).max(200),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  duration: z.enum(['5', '10', '15', '30']).default('15'), // minutes
  learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading']).default('visual'),
  subject: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check rate limits
    const rateLimit = await usageStatsService.checkRateLimit(userId)
    if (!rateLimit.allowed) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded',
        remainingTokens: rateLimit.remainingTokens 
      }, { status: 429 })
    }

    const body = await request.json()
    const { topic, difficulty, duration, learningStyle, subject } = lessonRequestSchema.parse(body)

    const systemPrompt = `You are an expert curriculum designer and educator. Create a comprehensive lesson plan with the following specifications:

Topic: ${topic}
Difficulty Level: ${difficulty}
Duration: ${duration} minutes
Learning Style: ${learningStyle}
${subject ? `Subject Area: ${subject}` : ''}

Structure your lesson as follows:
1. **Learning Objectives** (2-3 clear, measurable goals)
2. **Introduction** (hook to engage the learner)
3. **Main Content** (broken into digestible sections)
4. **Interactive Elements** (activities, questions, exercises)
5. **Summary** (key takeaways)
6. **Assessment** (quick check for understanding)
7. **Next Steps** (what to study next)

Adapt the content for ${learningStyle} learners:
- Visual: Include descriptions of diagrams, charts, infographics
- Auditory: Include discussion points, verbal explanations
- Kinesthetic: Include hands-on activities, experiments
- Reading: Include text-based exercises, note-taking guides

Make it engaging, practical, and appropriate for ${difficulty} level.`

    const prompt = `Create a ${duration}-minute lesson plan on "${topic}" for ${difficulty} level learners with a ${learningStyle} learning preference.`

    const startTime = Date.now()
    const response = await aiService.generateContent(
      prompt,
      'gemini-2.5-pro',
      systemPrompt,
      2000 // Allow more tokens for detailed lesson plans
    )

    const duration_ms = Date.now() - startTime

    // Record usage
    await usageStatsService.recordUsage(userId, {
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      model: response.model,
      interactionType: 'education_lesson',
      prompt: prompt,
      responseTime: duration_ms,
      status: 'completed'
    })

    return NextResponse.json({
      lesson: response.content,
      model: response.model,
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      metadata: {
        topic,
        difficulty,
        duration,
        learningStyle,
        subject
      }
    })

  } catch (error) {
    console.error('Education lesson generation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
