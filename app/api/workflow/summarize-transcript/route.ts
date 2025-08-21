import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { key } = await request.json();
    
    // Get transcript from Netlify Blobs
    const store = getStore({ name: 'TranscriptSummaries' });
    const transcript = await store.get(key);
    
    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      );
    }

    // Process with GPT-5 (placeholder implementation)
    const summaryResult = {
      summary: 'Meeting focused on Q1 goals and project timelines.',
      keyPoints: [
        'Revenue targets exceeded by 15%',
        'New product launch scheduled for March',
        'Team expansion planned for Q2'
      ],
      actionItems: [
        'Update project timeline by Friday',
        'Schedule follow-up meeting with stakeholders',
        'Prepare resource allocation report'
      ],
      participants: [
        'John Smith',
        'Sarah Johnson',
        'Mike Williams',
        'Lisa Chen'
      ]
    };

    // Store the summary result
    await store.set(`${key}-summary`, JSON.stringify(summaryResult));

    return NextResponse.json(summaryResult);
  } catch (error) {
    console.error('Transcript summarization error:', error);
    return NextResponse.json(
      { error: 'Failed to summarize transcript' },
      { status: 500 }
    );
  }
}