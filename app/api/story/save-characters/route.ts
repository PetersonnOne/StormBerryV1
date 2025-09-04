import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { textsService } from '@/lib/db/texts';

export async function POST(req: Request) {
  try {
    const { userId, getToken } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { characters } = await req.json();
    if (!Array.isArray(characters)) {
      return NextResponse.json({ error: 'Invalid characters data' }, { status: 400 });
    }

    const token = await getToken({ template: 'supabase' });

    // Save characters as structured content
    const charactersData = {
      content: JSON.stringify({
        characters,
        metadata: {
          type: 'characters',
          characterCount: characters.length,
          characterNames: characters.map((c: { name: string }) => c.name).filter(Boolean),
          lastModified: new Date().toISOString(),
        }
      })
    };

    const result = await textsService.create(userId, charactersData, token || undefined);

    return NextResponse.json({
      success: true,
      id: result.id,
      created_at: result.created_at,
    });

  } catch (error) {
    console.error('Error saving characters:', error);
    return NextResponse.json(
      { error: 'Failed to save characters' },
      { status: 500 }
    );
  }
}