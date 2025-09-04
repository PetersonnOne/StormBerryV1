import { NextRequest, NextResponse } from 'next/server';
import { elevenLabsService } from '@/lib/elevenlabs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const model = formData.get('model') as string;
    const language = formData.get('language') as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    const transcription = await elevenLabsService.speechToText({
      audioFile,
      model,
      language
    });

    return NextResponse.json({
      text: transcription,
      success: true
    });

  } catch (error) {
    console.error('ElevenLabs STT error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Speech-to-text failed' },
      { status: 500 }
    );
  }
}