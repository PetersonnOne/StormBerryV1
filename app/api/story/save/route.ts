import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { put } from '@vercel/blob';

export async function POST(req: Request) {
  try {
    const session = await getSession({ req });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, metadata } = await req.json();
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Generate a unique filename for the story content
    const timestamp = new Date().toISOString();
    const filename = `stories/${session.user.id}/${metadata.title || 'untitled'}-${timestamp}.html`;

    // Save story content to Netlify Blobs
    const blob = await put(filename, content, {
      access: 'private',
      contentType: 'text/html',
      metadata: {
        userId: session.user.id,
        title: metadata.title,
        genre: metadata.genre,
        synopsis: metadata.synopsis,
        lastModified: timestamp,
      },
    });

    // Save metadata separately for easier querying
    const metadataFilename = `stories/${session.user.id}/metadata.json`;
    const existingMetadataBlob = await get(metadataFilename);
    let existingMetadata = [];
    
    if (existingMetadataBlob) {
      existingMetadata = JSON.parse(await existingMetadataBlob.text());
    }

    const updatedMetadata = [
      ...existingMetadata.filter(m => m.filename !== filename),
      {
        filename,
        title: metadata.title,
        genre: metadata.genre,
        synopsis: metadata.synopsis,
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
    console.error('Error saving story:', error);
    return NextResponse.json(
      { error: 'Failed to save story' },
      { status: 500 }
    );
  }
}