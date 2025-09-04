import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { textsService } from '@/lib/db/texts';

export async function POST(request: Request) {
  try {
    const { userId, getToken } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transcriptId } = await request.json();
    
    if (!transcriptId) {
      return NextResponse.json(
        { error: 'Transcript ID required' },
        { status: 400 }
      );
    }

    const token = await getToken({ template: 'supabase' });

    // Get transcript from Supabase
    const transcript = await textsService.getById(transcriptId, userId, token || undefined);
    
    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      );
    }

    // Process with AI (placeholder implementation)
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

    // Store the summary result in Supabase
    const summaryData = {
      content: JSON.stringify({
        summaryResult,
        metadata: {
          type: 'transcript-summary',
          originalTranscriptId: transcriptId,
          summarizedAt: new Date().toISOString(),
        }
      })
    };

    const result = await textsService.create(userId, summaryData, token || undefined);

    return NextResponse.json({
      ...summaryResult,
      id: result.id
    });
  } catch (error) {
    console.error('Transcript summarization error:', error);
    return NextResponse.json(
      { error: 'Failed to summarize transcript' },
      { status: 500 }
    );
  }
}