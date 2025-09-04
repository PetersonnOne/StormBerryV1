import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, metadata } = await req.json();
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Strip HTML tags for cleaner GPT input
    const cleanContent = content.replace(/<[^>]*>/g, '');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
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

    const suggestions = completion.choices[0]?.message?.content || '';

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