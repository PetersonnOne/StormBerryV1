import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { aiService } from '@/lib/ai/unified-ai-service'
import { usageStatsService } from '@/lib/db/usage-stats'
import { z } from 'zod'

const summarizationRequestSchema = z.object({
  transcript: z.string().min(1),
  summaryType: z.enum(['brief', 'detailed', 'action-items', 'key-points']).default('brief'),
  language: z.string().default('en'),
  focusAreas: z.array(z.string()).optional(),
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
    const { transcript, summaryType, language, focusAreas } = summarizationRequestSchema.parse(body)

    let systemPrompt = `You are an expert accessibility assistant specializing in conversation summarization for deaf and hard-of-hearing users. 

Summarize the following transcript with focus on:
- Clear, accessible language
- Important information and key points
- Context that might be missed without audio cues
- ${summaryType} level of detail

Language: ${language}
${focusAreas ? `Focus Areas: ${focusAreas.join(', ')}` : ''}

Format your response based on summary type:`

    switch (summaryType) {
      case 'brief':
        systemPrompt += `
- **Main Topic**: What was discussed
- **Key Points**: 3-5 most important points
- **Outcome**: Final decisions or conclusions`
        break
      case 'detailed':
        systemPrompt += `
- **Overview**: Comprehensive summary of the conversation
- **Main Topics**: All subjects discussed in order
- **Key Details**: Important information and context
- **Participants**: Who was involved and their contributions
- **Conclusions**: Final outcomes and decisions`
        break
      case 'action-items':
        systemPrompt += `
- **Action Items**: Specific tasks mentioned
- **Responsible Parties**: Who should do what
- **Deadlines**: When tasks should be completed
- **Follow-up**: Next steps and future meetings`
        break
      case 'key-points':
        systemPrompt += `
- **Important Points**: All significant information
- **Decisions Made**: Any conclusions or agreements
- **Questions Raised**: Unresolved issues
- **Notable Mentions**: Significant details worth remembering`
        break
    }

    const startTime = Date.now()
    const response = await aiService.generateContent(
      `Please summarize this transcript: ${transcript}`,
      'gemini-2.5-pro',
      systemPrompt,
      1500
    )

    const duration = Date.now() - startTime

    // Record usage
    await usageStatsService.recordUsage(userId, {
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      model: response.model,
      interactionType: 'accessibility_summary',
      prompt: 'Transcript summarization',
      responseTime: duration,
      status: 'completed'
    })

    return NextResponse.json({
      summary: response.content,
      model: response.model,
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      metadata: {
        summaryType,
        language,
        focusAreas,
        transcriptLength: transcript.length,
        wordCount: transcript.split(' ').length
      }
    })

  } catch (error) {
    console.error('Summarization error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
