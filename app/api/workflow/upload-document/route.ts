import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'xlsx'].includes(fileType || '')) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // Store file in Netlify Blobs
    const store = getStore({ name: 'Documents' });
    const blobKey = `doc-${Date.now()}-${file.name}`;
    
    const buffer = await file.arrayBuffer();
    await store.set(blobKey, buffer);

    return NextResponse.json({ blobKey });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}