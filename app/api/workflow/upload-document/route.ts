import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { uploadImage } from '@/utils/storage';

export async function POST(request: Request) {
  try {
    const { userId, getToken } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const token = await getToken({ template: 'supabase' });

    // Upload file to Supabase Storage
    const fileUrl = await uploadImage(file, userId, token || undefined);

    return NextResponse.json({ 
      success: true,
      fileUrl,
      fileName: file.name 
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}