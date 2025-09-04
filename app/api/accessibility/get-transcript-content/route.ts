import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { textsService } from '@/lib/db/texts';

export async function GET(req: Request) {
  try {
    const { userId, getToken } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const transcriptId = url.searchParams.get('id');

    if (!transcriptId) {
      return NextResponse.json(
        { error: 'Missing transcript ID parameter' },
        { status: 400 }
      );
    }

    const token = await getToken({ template: 'supabase' });

    // Get specific transcript content
    const transcript = await textsService.getById(transcriptId, userId, token || undefined);
    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      );
    }

    // Parse and verify it's a transcript
    const content = JSON.parse(transcript.content);
    if (content.metadata?.type !== 'transcript') {
      return NextResponse.json(
        { error: 'Invalid transcript data' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      content: content.transcript,
      metadata: content.metadata,
    });

  } catch (error) {
    console.error('Error getting transcript content:', error);
    return NextResponse.json(
      { error: 'Failed to get transcript content' },
      { status: 500 }
    );
  }
}