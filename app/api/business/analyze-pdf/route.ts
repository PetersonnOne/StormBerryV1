import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { aiService } from '@/lib/ai/unified-ai-service'
import { foxitService } from '@/lib/pdf/foxit-service'
import { usageStatsService } from '@/lib/db/usage-stats'
import { z } from 'zod'

const pdfAnalysisRequestSchema = z.object({
  analysisType: z.enum(['summary', 'detailed', 'key-insights', 'action-items']).default('summary'),
  focusArea: z.enum(['business', 'financial', 'legal', 'technical', 'general']).default('business'),
  includeRecommendations: z.boolean().default(true),
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

    const formData = await request.formData()
    const file = formData.get('file') as File
    const optionsJson = formData.get('options') as string

    if (!file) {
      return NextResponse.json({ error: 'PDF file is required' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
    }

    const options = optionsJson ? pdfAnalysisRequestSchema.parse(JSON.parse(optionsJson)) : pdfAnalysisRequestSchema.parse({})

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const pdfBuffer = new Uint8Array(arrayBuffer)

    const startTime = Date.now()

    // Extract and analyze PDF content
    const analysisResult = await foxitService.analyzePDF(pdfBuffer)

    // Generate AI analysis based on extracted content
    const systemPrompt = `You are an expert document analyst specializing in ${options.focusArea} documents.
Analyze the provided document content and generate a comprehensive ${options.analysisType} analysis.

Analysis Guidelines:
- Focus on ${options.focusArea} aspects of the document
- Provide clear, actionable insights
- Identify key themes and patterns
- Highlight important data points and metrics
- ${options.includeRecommendations ? 'Include specific recommendations and next steps' : 'Focus on analysis without recommendations'}
- Structure your response clearly with headings and bullet points
- Be thorough but concise

Analysis Type: ${options.analysisType}
Focus Area: ${options.focusArea}`

    const prompt = `Analyze this document content:

FULL TEXT:
${analysisResult.fullText}

DOCUMENT SECTIONS:
${analysisResult.sections.map(s => `
Section: ${s.title}
Content: ${s.content}
Summary: ${s.summary}
`).join('\n')}

OVERALL SUMMARY:
${analysisResult.overallSummary}

KEY FINDINGS:
${analysisResult.keyFindings.join('\n')}

Please provide a ${options.analysisType} analysis focusing on ${options.focusArea} aspects.`

    const aiResponse = await aiService.generateContent(
      prompt,
      options.model as any,
      systemPrompt,
      1500
    )

    const duration_ms = Date.now() - startTime

    // Record usage
    await usageStatsService.recordUsage(userId, {
      tokensUsed: aiResponse.tokensUsed,
      cost: aiResponse.cost,
      model: aiResponse.model,
      operation: 'pdf-analysis',
      duration_ms,
      metadata: {
        fileSize: pdfBuffer.length,
        analysisType: options.analysisType,
        focusArea: options.focusArea,
        sectionsAnalyzed: analysisResult.sections.length
      }
    })

    // Return analysis results
    return NextResponse.json({
      success: true,
      analysis: {
        aiInsights: aiResponse.content,
        extractedData: {
          fullText: analysisResult.fullText,
          sections: analysisResult.sections,
          overallSummary: analysisResult.overallSummary,
          keyFindings: analysisResult.keyFindings
        },
        metadata: {
          fileName: file.name,
          fileSize: pdfBuffer.length,
          analysisType: options.analysisType,
          focusArea: options.focusArea,
          processingTime: duration_ms,
          model: aiResponse.model,
          tokensUsed: aiResponse.tokensUsed
        }
      }
    })

  } catch (error) {
    console.error('Error analyzing PDF:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Failed to analyze PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
