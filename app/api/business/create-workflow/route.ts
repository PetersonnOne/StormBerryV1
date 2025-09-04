import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { aiService } from '@/lib/ai/unified-ai-service'
import { usageStatsService } from '@/lib/db/usage-stats'
import { z } from 'zod'

const workflowRequestSchema = z.object({
  description: z.string().min(1).max(1000),
  industry: z.string().optional(),
  complexity: z.enum(['simple', 'moderate', 'complex']).default('moderate'),
  steps: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
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
    const { description, industry, complexity, steps, tools, model } = workflowRequestSchema.parse(body)

    const systemPrompt = `You are an expert workflow automation consultant and business process analyst. Create a detailed workflow based on the following requirements:

Description: ${description}
${industry ? `Industry: ${industry}` : ''}
Complexity Level: ${complexity}
${steps ? `Suggested Steps: ${steps.join(', ')}` : ''}
${tools ? `Available Tools: ${tools.join(', ')}` : ''}

Return your response as a JSON object with this structure:
{
  "workflow": {
    "title": "Workflow name",
    "description": "Brief description",
    "steps": [
      {
        "id": 1,
        "title": "Step title",
        "description": "What happens in this step",
        "type": "manual|automated|ai-assisted",
        "estimatedTime": "5 minutes",
        "tools": ["tool1", "tool2"],
        "inputs": ["required inputs"],
        "outputs": ["expected outputs"],
        "automationPotential": "high|medium|low"
      }
    ],
    "triggers": ["What starts this workflow"],
    "outcomes": ["Expected results"],
    "metrics": ["How to measure success"],
    "estimatedTotalTime": "30 minutes",
    "complexity": "${complexity}",
    "automationLevel": "percentage of automated steps"
  }
}

Focus on:
- Clear, actionable steps
- Realistic time estimates
- Automation opportunities
- Integration possibilities
- Error handling and fallbacks
- Quality checkpoints`

    const prompt = `Create a ${complexity} workflow for: ${description}`

    const startTime = Date.now()
    const response = await aiService.generateContent(
      prompt,
      model,
      systemPrompt,
      2000
    )

    const duration = Date.now() - startTime

    // Record usage
    await usageStatsService.recordUsage(userId, {
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      model: response.model,
      interactionType: 'business_workflow',
      prompt: prompt,
      responseTime: duration,
      status: 'completed'
    })

    // Try to parse the AI response as JSON
    let workflowData
    try {
      workflowData = JSON.parse(response.content)
    } catch (parseError) {
      // If JSON parsing fails, return structured format
      workflowData = {
        workflow: {
          title: `Workflow: ${description.slice(0, 50)}...`,
          description: description,
          rawContent: response.content,
          complexity,
          industry
        }
      }
    }

    return NextResponse.json({
      ...workflowData,
      model: response.model,
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      metadata: {
        description,
        industry,
        complexity,
        steps,
        tools
      }
    })

  } catch (error) {
    console.error('Workflow creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
