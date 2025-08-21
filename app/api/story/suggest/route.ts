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

    const { content, metadata } = await req.json();
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Strip HTML tags for cleaner GPT input
    const cleanContent = content.replace(/<[^>]*>/g, '');

    const completion = await openai.createChatCompletion({
      model: 'gpt-5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a creative writing assistant helping with story development. 
Title: ${metadata.title}
Genre: ${metadata.genre}
Synopsis: ${metadata.synopsis}

Analyze the story content and provide suggestions for plot development, character arcs, or world-building details. Maintain consistency with the established narrative and genre conventions.`,
        },
        {
          role: 'user',
          content: `Here's the current story content:\n${cleanContent}\n\nPlease provide creative suggestions for continuing the story, including potential plot developments, character interactions, or world-building details.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const suggestions = completion.data.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      suggestions,
    });

  } catch (error) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}