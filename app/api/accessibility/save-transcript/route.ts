import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { textsService } from '@/lib/db/texts';

export async function POST(req: Request) {
  try {
    const { userId, getToken } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transcript, language, timestamp } = await req.json();

    if (!transcript || !language || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const token = await getToken({ template: 'supabase' });

    // Save transcript as structured content
    const transcriptData = {
      content: JSON.stringify({
        transcript,
        metadata: {
          language,
          timestamp,
          type: 'transcript',
          summary: null,
        }
      })
    };

    const result = await textsService.create(userId, transcriptData, token || undefined);

    return NextResponse.json({
      success: true,
      id: result.id,
      created_at: result.created_at,
    });

  } catch (error) {
    console.error('Error saving transcript:', error);
    return NextResponse.json(
      { error: 'Failed to save transcript' },
      { status: 500 }
    );
  }
}