import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { put, get } from '@vercel/blob';

export async function POST(req: Request) {
  try {
    const session = await getSession({ req });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { characters } = await req.json();
    if (!Array.isArray(characters)) {
      return NextResponse.json({ error: 'Invalid characters data' }, { status: 400 });
    }

    // Generate a unique filename for the characters data
    const timestamp = new Date().toISOString();
    const filename = `characters/${session.user.id}/characters-${timestamp}.json`;

    // Save characters data to Netlify Blobs
    const blob = await put(filename, JSON.stringify(characters), {
      access: 'private',
      contentType: 'application/json',
      metadata: {
        userId: session.user.id,
        lastModified: timestamp,
      },
    });

    // Save character metadata for easier querying
    const metadataFilename = `characters/${session.user.id}/metadata.json`;
    const existingMetadataBlob = await get(metadataFilename);
    let existingMetadata: any[] = [];
    
    if (existingMetadataBlob) {
      existingMetadata = JSON.parse(await existingMetadataBlob.text());
    }

    const updatedMetadata = [
      ...existingMetadata.filter((m: { filename: string }) => m.filename !== filename),
      {
        filename,
        characterCount: characters.length,
        characterNames: characters.map((c: { name: string }) => c.name).filter(Boolean),
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
    console.error('Error saving characters:', error);
    return NextResponse.json(
      { error: 'Failed to save characters' },
      { status: 500 }
    );
  }
}