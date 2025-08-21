import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function POST(req: Request) {
  try {
    const session = await getSession({ req });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, role, existingCharacters } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Character name is required' }, { status: 400 });
    }

    const existingCharactersContext = existingCharacters
      ?.map(c => `${c.name} (${c.role}): ${c.description}`)
      .join('\n');

    const completion = await openai.createChatCompletion({
      model: 'gpt-5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a creative writing assistant specializing in character development. Create detailed, consistent character profiles that fit naturally within the story world and interact meaningfully with existing characters.',
        },
        {
          role: 'user',
          content: `Create a detailed character profile for a character named "${name}" who is ${role || 'a character'} in the story.\n\nExisting characters in the story:\n${existingCharactersContext || 'No other characters defined yet.'}\n\nProvide:\n1. A physical description\n2. A compelling background story\n3. Distinct personality traits\n4. Key goals and motivations\n5. A detailed prompt for generating a character portrait (focus on physical appearance, style, and notable features)`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const generatedContent = completion.data.choices[0]?.message?.content || '';

    // Parse the generated content into structured sections
    const sections = generatedContent.split('\n\n');
    const response = {
      description: '',
      background: '',
      personality: '',
      goals: [] as string[],
      imagePrompt: '',
    };

    sections.forEach(section => {
      if (section.toLowerCase().includes('physical description')) {
        response.description = section.replace(/^physical\s*description:?\s*/i, '');
      } else if (section.toLowerCase().includes('background')) {
        response.background = section.replace(/^background:?\s*/i, '');
      } else if (section.toLowerCase().includes('personality')) {
        response.personality = section.replace(/^personality:?\s*/i, '');
      } else if (section.toLowerCase().includes('goals')) {
        const goalsText = section.replace(/^goals:?\s*/i, '');
        response.goals = goalsText.split('\n')
          .map(goal => goal.replace(/^[\d-.*]\s*/, '').trim())
          .filter(Boolean);
      } else if (section.toLowerCase().includes('portrait prompt')) {
        response.imagePrompt = section.replace(/^portrait\s*prompt:?\s*/i, '');
      }
    });

    return NextResponse.json({
      success: true,
      ...response,
    });

  } catch (error) {
    console.error('Error generating character details:', error);
    return NextResponse.json(
      { error: 'Failed to generate character details' },
      { status: 500 }
    );
  }
}