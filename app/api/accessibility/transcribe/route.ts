import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { aiService } from '@/lib/ai/unified-ai-service'
import { usageStatsService } from '@/lib/db/usage-stats'
import { z } from 'zod'

const transcriptionRequestSchema = z.object({
  audioData: z.string(), // Base64 encoded audio
  language: z.string().default('en'),
  includeTimestamps: z.boolean().default(true),
  highlightKeywords: z.array(z.string()).optional(),
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
    const { audioData, language, includeTimestamps, highlightKeywords } = transcriptionRequestSchema.parse(body)

    // For now, we'll simulate transcription since we don't have direct audio API
    // In a real implementation, you'd use services like OpenAI Whisper, Google Speech-to-Text, etc.
    const systemPrompt = `You are an expert transcription service for accessibility. Process the audio content and provide:

1. Accurate transcription of spoken content
2. ${includeTimestamps ? 'Include timestamps for important sections' : 'Clean text without timestamps'}
3. ${highlightKeywords ? `Highlight these important keywords: ${highlightKeywords.join(', ')}` : 'Identify key topics and important phrases'}
4. Format for accessibility (clear paragraphs, speaker identification if multiple speakers)
5. Note any non-verbal audio cues (laughter, applause, music, etc.)

Language: ${language}
Focus on clarity and accessibility for deaf and hard-of-hearing users.`

    const startTime = Date.now()
    
    // Since we can't process actual audio, we'll return a structured response
    // In production, integrate with actual speech-to-text services
    const mockTranscription = {
      text: "This is a simulated transcription. In production, this would process actual audio data using services like OpenAI Whisper or Google Speech-to-Text API.",
      confidence: 0.95,
      language: language,
      duration: "0:30",
      speakers: ["Speaker 1"],
      timestamps: includeTimestamps ? [
        { time: "0:00", text: "Beginning of transcription" },
        { time: "0:15", text: "Middle section" },
        { time: "0:30", text: "End of transcription" }
      ] : undefined,
      highlightedKeywords: highlightKeywords || [],
      nonVerbalCues: ["Background music", "Clear audio quality"]
    }

    const response = await aiService.generateContent(
      `Process this transcription data and format it for accessibility: ${JSON.stringify(mockTranscription)}`,
      'gemini-2.5-flash', // Use Flash for faster processing
      systemPrompt,
      1000
    )

    const duration = Date.now() - startTime

    // Record usage
    await usageStatsService.recordUsage(userId, {
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      model: response.model,
      interactionType: 'accessibility_transcription',
      prompt: 'Audio transcription',
      responseTime: duration,
      status: 'completed'
    })

    return NextResponse.json({
      transcription: response.content,
      model: response.model,
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      metadata: {
        language,
        includeTimestamps,
        highlightKeywords,
        confidence: mockTranscription.confidence,
        duration: mockTranscription.duration
      }
    })

  } catch (error) {
    console.error('Transcription error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
