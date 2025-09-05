import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { aiService } from '@/lib/ai/unified-ai-service';
import { usageStatsService } from '@/lib/db/usage-stats';
import { z } from 'zod';

const characterRequestSchema = z.object({
  name: z.string().min(1).max(100),
  role: z.string().optional(),
  existingCharacters: z.array(z.object({
    name: z.string(),
    role: z.string(),
    description: z.string()
  })).optional(),
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
    const { name, role, existingCharacters, model } = characterRequestSchema.parse(body);

    const existingCharactersContext = existingCharacters
      ?.map((c) => `${c.name} (${c.role}): ${c.description}`)
      .join('\n');

    const systemPrompt = `You are a creative writing assistant specializing in character development. Create detailed, consistent character profiles that fit naturally within the story world and interact meaningfully with existing characters.

Please structure your response with clear sections:
1. PHYSICAL DESCRIPTION: Detailed physical appearance
2. BACKGROUND: Compelling background story
3. PERSONALITY: Distinct personality traits
4. GOALS: Key goals and motivations (list format)
5. PORTRAIT PROMPT: Detailed prompt for generating a character portrait`;

    const characterPrompt = `Create a detailed character profile for a character named "${name}" who is ${role || 'a character'} in the story.

Existing characters in the story:
${existingCharactersContext || 'No other characters defined yet.'}

Provide comprehensive details about:
1. Physical appearance and distinctive features
2. Background story and history
3. Personality traits and quirks
4. Goals, motivations, and desires
5. A detailed portrait description for image generation

Make the character unique, memorable, and well-integrated with existing characters.`;

    const startTime = Date.now();
    const response = await aiService.generateContent(
      characterPrompt,
      model as any,
      systemPrompt,
      1200
    );

    const duration = Date.now() - startTime;

    // Parse the generated content into structured sections
    const generatedContent = response.content;
    const sections = generatedContent.split('\n\n');
    const parsedResponse = {
      description: '',
      background: '',
      personality: '',
      goals: [] as string[],
      imagePrompt: '',
    };

    sections.forEach((section: string) => {
      const lowerSection = section.toLowerCase();
      if (lowerSection.includes('physical description')) {
        parsedResponse.description = section.replace(/^.*physical\s*description:?\s*/i, '').trim();
      } else if (lowerSection.includes('background')) {
        parsedResponse.background = section.replace(/^.*background:?\s*/i, '').trim();
      } else if (lowerSection.includes('personality')) {
        parsedResponse.personality = section.replace(/^.*personality:?\s*/i, '').trim();
      } else if (lowerSection.includes('goals')) {
        const goalsText = section.replace(/^.*goals:?\s*/i, '').trim();
        parsedResponse.goals = goalsText.split('\n')
          .map((goal: string) => goal.replace(/^[\d-.*]\s*/, '').trim())
          .filter(Boolean);
      } else if (lowerSection.includes('portrait prompt')) {
        parsedResponse.imagePrompt = section.replace(/^.*portrait\s*prompt:?\s*/i, '').trim();
      }
    });

    // If sections weren't clearly marked, use fallback parsing
    if (!parsedResponse.description && !parsedResponse.background) {
      const parts = generatedContent.split('\n\n');
      parsedResponse.description = parts[0] || '';
      parsedResponse.background = parts[1] || '';
      parsedResponse.personality = parts[2] || '';
      parsedResponse.imagePrompt = parts[parts.length - 1] || '';
    }

    // Record usage
    await usageStatsService.recordUsage(userId, {
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      model: response.model,
      interactionType: 'character_generation',
      prompt: characterPrompt,
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
    console.error('Error generating character details:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate character details' },
      { status: 500 }
    );
  }
}