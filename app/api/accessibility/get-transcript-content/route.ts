import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { get } from '@vercel/blob';

export async function GET(req: Request) {
  try {
    const session = await getSession({ req });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const filename = url.searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { error: 'Missing filename parameter' },
        { status: 400 }
      );
    }

    // Verify that the requested transcript belongs to the user
    if (!filename.startsWith(`transcripts/${session.user.id}/`)) {
      return NextResponse.json(
        { error: 'Unauthorized access to transcript' },
        { status: 403 }
      );
    }

    // Get transcript content
    const transcriptBlob = await get(filename);
    if (!transcriptBlob) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      );
    }

    const content = await transcriptBlob.text();

    return NextResponse.json({
      success: true,
      content,
    });

  } catch (error) {
    console.error('Error getting transcript content:', error);
    return NextResponse.json(
      { error: 'Failed to get transcript content' },
      { status: 500 }
    );
  }
}