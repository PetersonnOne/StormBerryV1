import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { aiService } from '@/lib/ai/unified-ai-service'
import { usageStatsService } from '@/lib/db/usage-stats'
import { z } from 'zod'

const storyRequestSchema = z.object({
  prompt: z.string().min(1).max(1000),
  genre: z.string().optional(),
  length: z.enum(['short', 'medium', 'long']).default('medium'),
  style: z.string().optional(),
  characters: z.array(z.string()).optional(),
  setting: z.string().optional(),
  tone: z.enum(['serious', 'humorous', 'dramatic', 'mysterious', 'romantic', 'adventure']).optional(),
  model: z.string().default('gpt-oss-120b'),
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
    const { prompt, genre, length, style, characters, setting, tone, model } = storyRequestSchema.parse(body)

    const wordCounts = {
      short: '500-800 words',
      medium: '1000-1500 words', 
      long: '2000-3000 words'
    }

    const systemPrompt = `You are a master storyteller and creative writer. Create an engaging story based on the following specifications:

Prompt: ${prompt}
${genre ? `Genre: ${genre}` : ''}
Length: ${length} (${wordCounts[length]})
${style ? `Writing Style: ${style}` : ''}
${characters ? `Characters to include: ${characters.join(', ')}` : ''}
${setting ? `Setting: ${setting}` : ''}
${tone ? `Tone: ${tone}` : ''}

Guidelines:
- Create a compelling narrative with clear beginning, middle, and end
- Develop interesting characters with distinct voices
- Use vivid descriptions and sensory details
- Include dialogue to bring characters to life
- Build tension and maintain reader engagement
- Ensure the story fits the requested length
- Stay true to the genre and tone
- Make it original and creative

Focus on storytelling craft: show don't tell, use active voice, create emotional resonance.`

    const storyPrompt = `Write a ${length} ${genre || 'creative'} story: ${prompt}`

    const startTime = Date.now()
    const response = await aiService.generateContent(
      storyPrompt,
      model as any,
      systemPrompt,
      length === 'long' ? 3000 : length === 'medium' ? 2000 : 1200
    )

    const duration = Date.now() - startTime

    // Record usage
    await usageStatsService.recordUsage(userId, {
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      model: response.model,
      interactionType: 'story_generation',
      prompt: storyPrompt,
      responseTime: duration,
      status: 'completed'
    })

    return NextResponse.json({
      story: response.content,
      model: response.model,
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      metadata: {
        prompt,
        genre,
        length,
        style,
        characters,
        setting,
        tone,
        wordCount: response.content.split(' ').length
      }
    })

  } catch (error) {
    console.error('Story generation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
