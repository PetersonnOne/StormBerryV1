import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { Configuration, OpenAIApi } from 'openai';
import { put, get } from '@vercel/blob';

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

    const { transcript, language } = await req.json();

    if (!transcript || !language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate summary using GPT-5
    const completion = await openai.createChatCompletion({
      model: 'gpt-5-turbo',
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

    const summary = completion.data.choices[0]?.message?.content;
    if (!summary) {
      throw new Error('Failed to generate summary');
    }

    // Parse the summary JSON
    const summaryData = JSON.parse(summary);

    // Update the transcript metadata with the summary
    const metadataFilename = `transcripts/${session.user.id}/metadata.json`;
    const metadataBlob = await get(metadataFilename);
    const metadata = metadataBlob ? JSON.parse(await metadataBlob.text()) : { transcripts: [] };

    // Find and update the latest transcript with the summary
    const latestTranscript = metadata.transcripts[metadata.transcripts.length - 1];
    if (latestTranscript) {
      latestTranscript.summary = summaryData;

      // Save updated metadata
      await put(metadataFilename, JSON.stringify(metadata), {
        access: 'public',
        contentType: 'application/json',
        addOnly: false,
      });
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