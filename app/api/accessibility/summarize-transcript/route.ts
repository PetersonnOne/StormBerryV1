import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { textsService } from '@/lib/db/texts';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId, getToken } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transcriptId, transcript, language } = await req.json();

    if (!transcript || !language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate summary using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert at summarizing conversations and extracting key points. 
          The user will provide a transcript in ${language}. 
          Your task is to:
          1. Provide a concise summary of the main topics discussed
          2. Extract key action items or important points
          3. Identify any follow-up tasks or deadlines mentioned
          4. Note any important names, dates, or numbers
          
          Format your response as JSON with these fields:
          - summary: A brief overview of the conversation
          - keyPoints: Array of important points discussed
          - actionItems: Array of tasks or follow-ups
          - importantDetails: Array of specific names, dates, numbers
          
          Keep the summary concise but informative.`
        },
        {
          role: 'user',
          content: transcript
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const summary = completion.choices[0]?.message?.content;
    if (!summary) {
      throw new Error('Failed to generate summary');
    }

    // Parse the summary JSON
    const summaryData = JSON.parse(summary);

    // Update the transcript with summary if transcriptId provided
    if (transcriptId) {
      const token = await getToken({ template: 'supabase' });
      const existingTranscript = await textsService.getById(transcriptId, userId, token || undefined);
      
      if (existingTranscript) {
        const content = JSON.parse(existingTranscript.content);
        content.metadata.summary = summaryData;
        
        await textsService.update(transcriptId, userId, {
          content: JSON.stringify(content)
        }, token || undefined);
      }
    }

    return NextResponse.json({
      success: true,
      summary: summaryData,
    });

  } catch (error) {
    console.error('Error summarizing transcript:', error);
    return NextResponse.json(
      { error: 'Failed to summarize transcript' },
      { status: 500 }
    );
  }
}