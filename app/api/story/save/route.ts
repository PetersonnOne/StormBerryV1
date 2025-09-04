import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { textsService } from '@/lib/db/texts';

export async function POST(req: Request) {
  try {
    const { userId, getToken } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, metadata } = await req.json();
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const token = await getToken({ template: 'supabase' });

    // Create story content with metadata as JSON
    const storyData = {
      content: JSON.stringify({
        html: content,
        metadata: {
          title: metadata.title,
          genre: metadata.genre,
          synopsis: metadata.synopsis,
          type: 'story',
          lastModified: new Date().toISOString(),
        }
      })
    };

    const result = await textsService.create(userId, storyData, token || undefined);

    return NextResponse.json({
      success: true,
      id: result.id,
      created_at: result.created_at,
    });

  } catch (error) {
    console.error('Error saving story:', error);
    return NextResponse.json(
      { error: 'Failed to save story' },
      { status: 500 }
    );
  }
}