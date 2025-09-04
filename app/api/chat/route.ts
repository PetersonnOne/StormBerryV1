import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { usageStatsService } from '@/lib/db/usage-stats'
import { aiService } from '@/lib/ai/unified-ai-service'
import { z } from 'zod'

const chatRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().optional(),
  model: z.string().default('gpt-oss-120b'),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(4000).default(1000),
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

    // Parse request body
    const body = await request.json()
    const { message, conversationId, model, temperature, maxTokens } = chatRequestSchema.parse(body)

    // Get or create conversation
    let conversation
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: userId,
        },
      })
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
          userId: userId,
        },
      })
    }

    // Create user message
    const userMessage = await prisma.message.create({
      data: {
        content: message,
        role: 'USER',
        conversationId: conversation.id,
      },
    })

    // Create AI interaction record
    const aiInteraction = await prisma.aIInteraction.create({
      data: {
        type: 'CHAT',
        status: 'PROCESSING',
        prompt: message,
        userId: userId,
        conversationId: conversation.id,
        messageId: userMessage.id,
      },
    })

    // Use unified AI service for actual response
    const startTime = Date.now()
    
    const aiResult = await aiService.generateContent(
      message, 
      model as any,
      'You are a helpful AI assistant. Provide clear, concise, and helpful responses.',
      maxTokens
    )
    const aiResponse = aiResult.content
    
    const duration = Date.now() - startTime
    const tokensUsed = aiResult.tokensUsed
    const cost = aiResult.cost

    // Record usage in Supabase
    await usageStatsService.recordUsage(userId, {
      tokensUsed,
      cost,
      model,
      interactionType: 'chat',
      prompt: message,
      responseTime: duration,
      status: 'completed'
    })

    // Create assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        content: aiResponse,
        role: 'ASSISTANT',
        conversationId: conversation.id,
      },
    })

    // Update AI interaction
    await prisma.aIInteraction.update({
      where: { id: aiInteraction.id },
      data: {
        status: 'COMPLETED',
        response: aiResponse,
        duration,
        tokensUsed,
        cost,
      },
    })

    // Update conversation title if it's the first message
    if (conversation.title.includes('...')) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          title: generateConversationTitle(message),
        },
      })
    }

    return NextResponse.json({
      conversationId: conversation.id,
      messageId: assistantMessage.id,
      content: aiResponse,
      tokensUsed,
      cost,
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions for cost calculation and conversation titles

function estimateTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}

function calculateCost(tokens: number, model: string): number {
  const rates = {
    'gpt-4': 0.03 / 1000, // $0.03 per 1K tokens
    'gemini-2.5-flash': 0.001 / 1000, // $0.001 per 1K tokens
    'gemini-2.5-pro': 0.005 / 1000, // $0.005 per 1K tokens
  }
  return (rates[model as keyof typeof rates] || rates['gpt-4']) * tokens
}

function generateConversationTitle(message: string): string {
  // Extract meaningful title from first message
  const words = message.split(' ').slice(0, 5)
  return words.join(' ') + (message.length > 30 ? '...' : '')
}