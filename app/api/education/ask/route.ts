import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { aiService } from '@/lib/ai/unified-ai-service'
import { usageStatsService } from '@/lib/db/usage-stats'
import { z } from 'zod'

const educationRequestSchema = z.object({
  question: z.string().min(1).max(4000),
  type: z.enum(['text', 'voice', 'image']),
  imageData: z.string().optional(),
  imageUrl: z.string().optional(),
  model: z.string().default('gpt-oss-120b'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
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
    const { question, type, imageData, imageUrl, model, difficulty, subject } = educationRequestSchema.parse(body)

    // Create educational system prompt
    const systemPrompt = `You are an expert AI tutor specializing in adaptive learning. Your role is to:

1. Provide clear, educational explanations appropriate for ${difficulty} level
2. Break down complex concepts into digestible parts
3. Use examples and analogies to enhance understanding
4. Encourage critical thinking with follow-up questions
5. Adapt your teaching style to the student's needs
${subject ? `6. Focus on the subject area: ${subject}` : ''}

Always be encouraging, patient, and supportive. Make learning engaging and interactive.`

    let response
    const startTime = Date.now()

    if (type === 'image' && (imageData || imageUrl)) {
      // Handle image-based questions using image generation service
      response = await aiService.generateImage(
        question,
        imageUrl || imageData
      )
    } else {
      // Handle text/voice questions with selected model
      response = await aiService.generateContent(
        question,
        model as any,
        systemPrompt,
        1500
      )
    }

    const duration = Date.now() - startTime

    // Record usage
    await usageStatsService.recordUsage(userId, {
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      model: response.model,
      interactionType: 'education',
      prompt: question,
      responseTime: duration,
      status: 'completed'
    })

    return NextResponse.json({
      answer: response.content,
      model: response.model,
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      difficulty,
      subject,
      type
    })

  } catch (error) {
    console.error('Education API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
