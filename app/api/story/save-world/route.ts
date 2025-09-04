import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { textsService } from '@/lib/db/texts';

export async function POST(req: Request) {
  try {
    const { userId, getToken } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const worldData = await req.json();
    if (!worldData.name) {
      return NextResponse.json({ error: 'World name is required' }, { status: 400 });
    }

    const token = await getToken({ template: 'supabase' });

    // Save world data as structured content
    const worldContent = {
      content: JSON.stringify({
        worldData,
        metadata: {
          type: 'world',
          worldName: worldData.name,
          lastModified: new Date().toISOString(),
        }
      })
    };

    const result = await textsService.create(userId, worldContent, token || undefined);

    return NextResponse.json({
      success: true,
      id: result.id,
      created_at: result.created_at,
    });

  } catch (error) {
    console.error('Error saving world:', error);
    return NextResponse.json(
      { error: 'Failed to save world data' },
      { status: 500 }
    );
  }
}