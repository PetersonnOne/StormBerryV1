import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { aiService } from '@/lib/ai/unified-ai-service'
import { usageStatsService } from '@/lib/db/usage-stats'
import { z } from 'zod'

const imageRequestSchema = z.object({
  prompt: z.string().min(1).max(500),
  style: z.enum(['realistic', 'artistic', 'cartoon', 'fantasy', 'sci-fi', 'vintage']).optional(),
  aspectRatio: z.enum(['square', 'landscape', 'portrait']).default('landscape'),
  mood: z.string().optional(),
  characters: z.array(z.string()).optional(),
  setting: z.string().optional(),
  model: z.string().default('gemini-2.5-flash-image'),
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
    const { prompt, style, aspectRatio, mood, characters, setting, model } = imageRequestSchema.parse(body)

    // Enhance the prompt for better image generation
    let enhancedPrompt = prompt
    
    if (style) enhancedPrompt += `, ${style} style`
    if (mood) enhancedPrompt += `, ${mood} mood`
    if (characters && characters.length > 0) enhancedPrompt += `, featuring ${characters.join(' and ')}`
    if (setting) enhancedPrompt += `, set in ${setting}`
    
    // Add quality and technical parameters
    enhancedPrompt += ', high quality, detailed, professional artwork'

    const startTime = Date.now()
    
    // Use selected model for image generation (default: Gemini 2.5 Flash Image)
    const response = await aiService.generateImage(enhancedPrompt, model)

    const duration = Date.now() - startTime

    // Record usage
    await usageStatsService.recordUsage(userId, {
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      model: response.model,
      interactionType: 'story_image',
      prompt: enhancedPrompt,
      responseTime: duration,
      status: 'completed'
    })

    return NextResponse.json({
      imageUrl: response.content,
      model: response.model,
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      metadata: {
        originalPrompt: prompt,
        enhancedPrompt,
        style,
        aspectRatio,
        mood,
        characters,
        setting
      }
    })

  } catch (error) {
    console.error('Story image generation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
