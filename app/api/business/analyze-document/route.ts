import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { aiService } from '@/lib/ai/unified-ai-service'
import { usageStatsService } from '@/lib/db/usage-stats'
import { z } from 'zod'

const documentRequestSchema = z.object({
  content: z.string().min(1).max(10000),
  type: z.enum(['contract', 'report', 'email', 'proposal', 'other']).default('other'),
  analysisType: z.enum(['summary', 'sentiment', 'key-points', 'recommendations', 'full', 'risk-analysis', 'action-items', 'comprehensive']).default('full'),
  model: z.string().default('gpt-oss-120b'),
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
    const { content, analysisType, type, focusAreas, model } = documentRequestSchema.parse(body)

    let systemPrompt = `You are an expert business analyst and document reviewer. Analyze the provided ${type} document with the following focus:

Analysis Type: ${analysisType}
Document Type: ${type}
${focusAreas ? `Focus Areas: ${focusAreas.join(', ')}` : ''}

Provide your analysis in a structured format:`

    switch (analysisType) {
      case 'summary':
        systemPrompt += `
- **Executive Summary**: Brief overview (2-3 sentences)
- **Key Points**: Main topics and findings
- **Conclusion**: Primary takeaway`
        break
      case 'risk-analysis':
        systemPrompt += `
- **High Risk Items**: Critical concerns requiring immediate attention
- **Medium Risk Items**: Important issues to monitor
- **Low Risk Items**: Minor concerns for awareness
- **Risk Mitigation**: Recommended actions for each risk level`
        break
      case 'key-points':
        systemPrompt += `
- **Main Topics**: Primary subjects covered
- **Important Details**: Critical information and data
- **Notable Mentions**: Significant points worth highlighting`
        break
      case 'action-items':
        systemPrompt += `
- **Immediate Actions**: Tasks requiring urgent attention
- **Short-term Actions**: Tasks for the next 1-2 weeks
- **Long-term Actions**: Strategic items for future planning
- **Responsible Parties**: Who should handle each action (if mentioned)`
        break
      case 'comprehensive':
        systemPrompt += `
- **Executive Summary**: Brief overview
- **Key Findings**: Main discoveries and insights
- **Risk Assessment**: Potential concerns and issues
- **Action Items**: Recommended next steps
- **Financial Implications**: Cost/revenue impacts (if applicable)
- **Timeline Considerations**: Important dates and deadlines`
        break
    }

    systemPrompt += `

Be thorough, objective, and professional. Focus on actionable insights.`

    const prompt = `Please analyze this ${type} document:\n\n${content}`

    const startTime = Date.now()
    const response = await aiService.generateContent(
      prompt,
      model as any,
      systemPrompt,
      2000
    )

    const duration = Date.now() - startTime

    // Record usage
    await usageStatsService.recordUsage(userId, {
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      model: response.model,
      interactionType: 'business_analysis',
      prompt: `Document analysis: ${analysisType}`,
      responseTime: duration,
      status: 'completed'
    })

    return NextResponse.json({
      analysis: response.content,
      model: response.model,
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      metadata: {
        analysisType,
        documentType: type,
        focusAreas,
        documentLength: content.length
      }
    })

  } catch (error) {
    console.error('Document analysis error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
