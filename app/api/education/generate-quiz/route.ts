import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { aiService } from '@/lib/ai/unified-ai-service'
import { usageStatsService } from '@/lib/db/usage-stats'
import { z } from 'zod'

const quizRequestSchema = z.object({
  topic: z.string().min(1).max(200),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  questionCount: z.number().min(1).max(20).default(5),
  questionTypes: z.array(z.string()).optional(), // Changed to match frontend
  questionType: z.enum(['multiple-choice', 'true-false', 'short-answer', 'mixed']).optional(),
  subject: z.string().optional(),
  model: z.string().default('gemini-2.5-pro'),
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
    
    // Add validation to prevent "Invalid request data" error on empty requests
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: 'Request body is required' }, { status: 400 })
    }
    
    const { topic, difficulty, questionCount, questionTypes, questionType, subject, model } = quizRequestSchema.parse(body)
    
    // Use questionTypes if provided, otherwise fall back to questionType
    const finalQuestionType = questionTypes && questionTypes.length > 0 ? questionTypes[0] : (questionType || 'multiple-choice')

    const systemPrompt = `You are an expert quiz creator and educational assessment specialist. Create a comprehensive quiz with the following specifications:

Topic: ${topic}
Difficulty Level: ${difficulty}
Number of Questions: ${questionCount}
Question Type: ${finalQuestionType}
${subject ? `Subject Area: ${subject}` : ''}

IMPORTANT: Return your response as a valid JSON object with this exact structure:
{
  "quiz": {
    "title": "Quiz title here",
    "description": "Brief description",
    "questions": [
      {
        "id": 1,
        "type": "multiple-choice|true-false|short-answer",
        "question": "Question text here",
        "options": ["Option A", "Option B", "Option C", "Option D"], // Only for multiple-choice
        "correctAnswer": "Correct answer here",
        "explanation": "Detailed explanation of why this is correct",
        "difficulty": "beginner|intermediate|advanced"
      }
    ]
  }
}

Guidelines:
- Make questions thought-provoking and educational
- Ensure correct answers are accurate and well-reasoned
- Provide clear explanations for learning
- Mix question types if "mixed" is selected
- Appropriate difficulty for ${difficulty} level
- Focus on understanding, not just memorization`

    const prompt = `Create a ${questionCount}-question ${finalQuestionType} quiz on "${topic}" at ${difficulty} level.`

    const startTime = Date.now()
    const response = await aiService.generateContent(
      prompt,
      model as any,
      systemPrompt,
      1500
    )

    const duration_ms = Date.now() - startTime

    // Record usage
    await usageStatsService.recordUsage(userId, {
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      model: response.model,
      interactionType: 'education_quiz',
      prompt: prompt,
      responseTime: duration_ms,
      status: 'completed'
    })

    // Try to parse the AI response as JSON
    let quizData
    try {
      quizData = JSON.parse(response.content)
    } catch (parseError) {
      // If JSON parsing fails, return the raw content
      quizData = {
        quiz: {
          title: `Quiz: ${topic}`,
          description: `A ${difficulty} level quiz on ${topic}`,
          rawContent: response.content
        }
      }
    }

    return NextResponse.json({
      ...quizData,
      model: response.model,
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      metadata: {
        topic,
        difficulty,
        questionCount,
        questionType,
        subject
      }
    })

  } catch (error) {
    console.error('Education quiz generation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
