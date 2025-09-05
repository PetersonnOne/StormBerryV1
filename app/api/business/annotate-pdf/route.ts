import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { aiService } from '@/lib/ai/unified-ai-service'
import { foxitService } from '@/lib/pdf/foxit-service'
import { usageStatsService } from '@/lib/db/usage-stats'
import { z } from 'zod'

const pdfAnnotationRequestSchema = z.object({
  highlightKeywords: z.array(z.string()).default(['Action Item', 'Conclusion', 'Recommendation', 'Important', 'Key Finding']),
  addComments: z.boolean().default(true),
  addWatermark: z.string().optional(),
  addHeaders: z.boolean().default(true),
  analysisType: z.enum(['business', 'academic', 'legal', 'general']).default('business'),
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

    const options = optionsJson ? pdfAnnotationRequestSchema.parse(JSON.parse(optionsJson)) : pdfAnnotationRequestSchema.parse({})

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const pdfBuffer = new Uint8Array(arrayBuffer)

    const startTime = Date.now()

    // First, analyze the PDF to understand its content
    const analysisResult = await foxitService.analyzePDF(pdfBuffer)

    // Generate AI insights about what should be highlighted
    const systemPrompt = `You are a document analysis expert specializing in ${options.analysisType} documents.
Analyze the following document content and provide insights about key phrases that should be highlighted and commented on.

Focus on:
- Critical action items and recommendations
- Important conclusions and findings
- Key data points and metrics
- Strategic insights and implications
- Areas requiring attention or follow-up

Provide your analysis in a structured format with specific phrases to highlight and reasons why they're important.`

    const prompt = `Analyze this document content and identify the most important phrases that should be highlighted:

${analysisResult.fullText}

Sections found:
${analysisResult.sections.map(s => `${s.title}: ${s.summary}`).join('\n')}

Key findings: ${analysisResult.keyFindings.join(', ')}`

    const aiResponse = await aiService.generateContent(
      prompt,
      'gemini-2.5-pro',
      systemPrompt,
      1000
    )

    // Add current date watermark if not specified
    const watermark = options.addWatermark || `Draft - ${new Date().toLocaleDateString()}`

    // Annotate the PDF
    const annotationOptions = {
      highlightKeywords: options.highlightKeywords,
      addComments: options.addComments,
      addWatermark: watermark,
      addHeaders: options.addHeaders,
    }

    const annotatedPdfBuffer = await foxitService.annotatePDF(pdfBuffer, annotationOptions)

    const duration_ms = Date.now() - startTime

    // Record usage
    await usageStatsService.recordUsage(userId, {
      tokensUsed: aiResponse.tokensUsed,
      cost: aiResponse.cost,
      model: aiResponse.model,
      operation: 'pdf-annotation',
      duration_ms,
      metadata: {
        originalFileSize: pdfBuffer.length,
        annotatedFileSize: annotatedPdfBuffer.length,
        analysisType: options.analysisType,
        keywordsHighlighted: options.highlightKeywords.length
      }
    })

    // Return annotated PDF
    const filename = `annotated_${file.name}`
    
    return new NextResponse(annotatedPdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': annotatedPdfBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Error annotating PDF:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Failed to annotate PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
