import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { get } from '@vercel/blob';

export async function GET(req: Request) {
  try {
    const session = await getSession({ req });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get transcript metadata
    const metadataFilename = `transcripts/${session.user.id}/metadata.json`;
    const metadataBlob = await get(metadataFilename);
    
    if (!metadataBlob) {
      return NextResponse.json({
        transcripts: [],
      });
    }

    const metadata = JSON.parse(await metadataBlob.text());

    // Sort transcripts by timestamp in descending order
    metadata.transcripts.sort((a: any, b: any) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return NextResponse.json({
      success: true,
      transcripts: metadata.transcripts,
    });

  } catch (error) {
    console.error('Error getting transcripts:', error);
    return NextResponse.json(
      { error: 'Failed to get transcripts' },
      { status: 500 }
    );
  }
}