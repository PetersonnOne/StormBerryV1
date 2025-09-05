import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { aiService } from '@/lib/ai/unified-ai-service';
import { usageStatsService } from '@/lib/db/usage-stats';
import { z } from 'zod';

const worldRequestSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  model: z.string().default('gemini-2.5-pro'),
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check rate limits
    const rateLimit = await usageStatsService.checkRateLimit(userId);
    if (!rateLimit.allowed) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded',
        remainingTokens: rateLimit.remainingTokens 
      }, { status: 429 });
    }

    const body = await req.json();
    const { name, description, model } = worldRequestSchema.parse(body);

    const systemPrompt = `You are a creative world-building assistant specializing in crafting rich, detailed fictional worlds for stories. Generate comprehensive world details including history, magic systems (if applicable), and technology levels that are internally consistent and engaging.

Please structure your response with clear sections:
1. HISTORY: A rich history of the world
2. MAGIC SYSTEM: Details about the magic system (if appropriate for this setting)  
3. TECHNOLOGY: Information about the technology level and any unique technological aspects`;

    const worldPrompt = `Generate detailed world-building information for a world named "${name}"${description ? ` with the following description: ${description}` : ''}.

Provide comprehensive details about:
1. The world's history and major events
2. Magic system (if applicable to the setting)
3. Technology level and unique technological aspects

Make it creative, internally consistent, and engaging for storytelling.`;

    const startTime = Date.now();
    const response = await aiService.generateContent(
      worldPrompt,
      model as any,
      systemPrompt,
      1500
    );

    const duration = Date.now() - startTime;

    // Parse the generated content into structured sections
    const generatedContent = response.content;
    const sections = generatedContent.split('\n\n');
    const parsedResponse = {
      history: '',
      magicSystem: '',
      technology: '',
    };

    sections.forEach((section: string) => {
      const lowerSection = section.toLowerCase();
      if (lowerSection.includes('history')) {
        parsedResponse.history = section.replace(/^.*history:?\s*/i, '').trim();
      } else if (lowerSection.includes('magic')) {
        parsedResponse.magicSystem = section.replace(/^.*magic\s*system:?\s*/i, '').trim();
      } else if (lowerSection.includes('technology')) {
        parsedResponse.technology = section.replace(/^.*technology:?\s*/i, '').trim();
      }
    });

    // If sections weren't clearly marked, use the full content
    if (!parsedResponse.history && !parsedResponse.magicSystem && !parsedResponse.technology) {
      const parts = generatedContent.split('\n\n');
      parsedResponse.history = parts[0] || generatedContent;
      parsedResponse.magicSystem = parts[1] || '';
      parsedResponse.technology = parts[2] || '';
    }

    // Record usage
    await usageStatsService.recordUsage(userId, {
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      model: response.model,
      interactionType: 'world_generation',
      prompt: worldPrompt,
      responseTime: duration,
      status: 'completed'
    });

    return NextResponse.json({
      success: true,
      ...parsedResponse,
      model: response.model,
      tokensUsed: response.tokensUsed,
      cost: response.cost
    });

  } catch (error) {
    console.error('Error generating world details:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate world details' },
      { status: 500 }
    );
  }
}