import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'World name is required' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a creative world-building assistant specializing in crafting rich, detailed fictional worlds for stories. Generate comprehensive world details including history, magic systems (if applicable), and technology levels that are internally consistent and engaging.',
        },
        {
          role: 'user',
          content: `Please generate detailed world-building information for a world named "${name}" with the following description:\n${description}\n\nProvide:\n1. A rich history of the world\n2. Details about the magic system (if appropriate for this setting)\n3. Information about the technology level and any unique technological aspects`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const generatedContent = completion.choices[0]?.message?.content || '';

    // Parse the generated content into structured sections
    const sections = generatedContent.split('\n\n');
    const response = {
      history: '',
      magicSystem: '',
      technology: '',
    };

    sections.forEach((section: string) => {
      if (section.toLowerCase().includes('history')) {
        response.history = section.replace(/^history:?\s*/i, '');
      } else if (section.toLowerCase().includes('magic')) {
        response.magicSystem = section.replace(/^magic\s*system:?\s*/i, '');
      } else if (section.toLowerCase().includes('technology')) {
        response.technology = section.replace(/^technology:?\s*/i, '');
      }
    });

    return NextResponse.json({
      success: true,
      ...response,
    });

  } catch (error) {
    console.error('Error generating world details:', error);
    return NextResponse.json(
      { error: 'Failed to generate world details' },
      { status: 500 }
    );
  }
}