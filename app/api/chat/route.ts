import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const chatRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().optional(),
  model: z.string().default('gpt-3.5-turbo'),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(4000).default(1000),
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
          userId: session.user.id,
        },
      })
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
          userId: session.user.id,
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
        userId: session.user.id,
        conversationId: conversation.id,
        messageId: userMessage.id,
      },
    })

    // Simulate AI response (replace with actual AI API call)
    const startTime = Date.now()
    
    // Mock AI response - replace with actual OpenAI/Anthropic API call
    const aiResponse = await generateAIResponse(message, model, temperature, maxTokens)
    
    const duration = Date.now() - startTime

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
        tokensUsed: estimateTokens(message + aiResponse),
        cost: calculateCost(estimateTokens(message + aiResponse), model),
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
      tokensUsed: estimateTokens(message + aiResponse),
      cost: calculateCost(estimateTokens(message + aiResponse), model),
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Mock AI response generation - replace with actual API call
async function generateAIResponse(
  message: string,
  model: string,
  temperature: number,
  maxTokens: number
): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

  // Mock responses based on message content
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('react') || lowerMessage.includes('component')) {
    return `I'd be happy to help you with React! Here's a basic component example:

\`\`\`jsx
import React, { useState } from 'react'

function ExampleComponent({ title, onAction }) {
  const [count, setCount] = useState(0)
  
  return (
    <div className="p-4 border rounded-lg">
      <h2>{title}</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}
\`\`\`

This demonstrates:
- Functional components with hooks
- Props handling
- State management
- Event handling

What specific aspect would you like me to explain further?`
  }
  
  if (lowerMessage.includes('project') || lowerMessage.includes('planning')) {
    return `Great! Let's plan your project effectively. Here's a structured approach:

## Project Planning Framework

### 1. Define Objectives
- What are your main goals?
- What problems are you solving?
- What success looks like

### 2. Scope & Requirements
- Feature list
- Technical requirements
- User stories

### 3. Timeline & Milestones
- Break down into phases
- Set realistic deadlines
- Identify dependencies

### 4. Resources & Team
- Required skills
- Team roles
- Tools & technology

Would you like me to help you create a detailed project plan?`
  }

  return `I understand you're asking about "${message}". Let me provide you with a comprehensive response.

Here are some key points to consider:

1. **Understanding the Context**: It's important to fully understand what you're trying to achieve.

2. **Best Practices**: Following established patterns and conventions will help ensure success.

3. **Iterative Approach**: Start simple and gradually add complexity as needed.

4. **Testing & Validation**: Always test your assumptions and validate your approach.

Would you like me to elaborate on any of these points or help you with a specific implementation?`
}

function estimateTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}

function calculateCost(tokens: number, model: string): number {
  // Mock pricing - replace with actual rates
  const rates = {
    'gpt-3.5-turbo': 0.002 / 1000, // $0.002 per 1K tokens
    'gpt-4': 0.03 / 1000, // $0.03 per 1K tokens
  }
  return (rates[model as keyof typeof rates] || rates['gpt-3.5-turbo']) * tokens
}

function generateConversationTitle(message: string): string {
  // Extract meaningful title from first message
  const words = message.split(' ').slice(0, 5)
  return words.join(' ') + (message.length > 30 ? '...' : '')
} 