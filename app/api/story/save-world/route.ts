import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { put } from '@vercel/blob';

export async function POST(req: Request) {
  try {
    const session = await getSession({ req });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const worldData = await req.json();
    if (!worldData.name) {
      return NextResponse.json({ error: 'World name is required' }, { status: 400 });
    }

    // Generate a unique filename for the world data
    const timestamp = new Date().toISOString();
    const filename = `worlds/${session.user.id}/${worldData.name.toLowerCase().replace(/\s+/g, '-')}.json`;

    // Save world data to Netlify Blobs
    const blob = await put(filename, JSON.stringify(worldData), {
      access: 'private',
      contentType: 'application/json',
      metadata: {
        userId: session.user.id,
        worldName: worldData.name,
        lastModified: timestamp,
      },
    });

    // Save world metadata for easier querying
    const metadataFilename = `worlds/${session.user.id}/metadata.json`;
    const existingMetadataBlob = await get(metadataFilename);
    let existingMetadata = [];
    
    if (existingMetadataBlob) {
      existingMetadata = JSON.parse(await existingMetadataBlob.text());
    }

    const updatedMetadata = [
      ...existingMetadata.filter(m => m.filename !== filename),
      {
        filename,
        worldName: worldData.name,
        lastModified: timestamp,
      }
    ];

    await put(metadataFilename, JSON.stringify(updatedMetadata), {
      access: 'private',
      contentType: 'application/json',
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename,
    });

  } catch (error) {
    console.error('Error saving world:', error);
    return NextResponse.json(
      { error: 'Failed to save world data' },
      { status: 500 }
    );
  }
}