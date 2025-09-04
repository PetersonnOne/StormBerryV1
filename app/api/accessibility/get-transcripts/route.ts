import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { textsService } from '@/lib/db/texts';

export async function GET(req: Request) {
  try {
    const { userId, getToken } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = await getToken({ template: 'supabase' });

    // Get all transcripts for the user
    const transcripts = await textsService.getAll(userId, token || undefined);

    // Filter for transcript content and sort by creation date
    const transcriptData = transcripts
      .filter(text => {
        try {
          const content = JSON.parse(text.content);
          return content.metadata?.type === 'transcript';
        } catch {
          return false;
        }
      })
      .map(text => {
        const content = JSON.parse(text.content);
        return {
          id: text.id,
          timestamp: text.created_at,
          ...content.metadata,
        };
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      transcripts: transcriptData,
    });

  } catch (error) {
    console.error('Error getting transcripts:', error);
    return NextResponse.json(
      { error: 'Failed to get transcripts' },
      { status: 500 }
    );
  }
}