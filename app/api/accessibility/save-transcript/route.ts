import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { put } from '@vercel/blob';

export async function POST(req: Request) {
  try {
    const session = await getSession({ req });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transcript, language, timestamp } = await req.json();

    if (!transcript || !language || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save transcript content
    const filename = `transcripts/${session.user.id}/${timestamp}.txt`;
    await put(filename, transcript, {
      access: 'public',
      contentType: 'text/plain',
      metadata: {
        userId: session.user.id,
        language,
        timestamp,
      },
    });

    // Update transcript metadata
    const metadataFilename = `transcripts/${session.user.id}/metadata.json`;
    const metadataBlob = await put(metadataFilename, JSON.stringify({
      transcripts: [{
        filename,
        language,
        timestamp,
        summary: null, // Will be updated by the summarization endpoint
      }],
    }), {
      access: 'public',
      contentType: 'application/json',
      addOnly: false,
    });

    return NextResponse.json({
      success: true,
      filename,
      metadataUrl: metadataBlob.url,
    });

  } catch (error) {
    console.error('Error saving transcript:', error);
    return NextResponse.json(
      { error: 'Failed to save transcript' },
      { status: 500 }
    );
  }
}