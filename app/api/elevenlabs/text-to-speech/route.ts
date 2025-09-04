import { NextRequest, NextResponse } from 'next/server';
import { elevenLabsService } from '@/lib/elevenlabs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voiceId, model, voiceSettings, outputFormat } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const audioBuffer = await elevenLabsService.textToSpeech({
      text,
      voiceId,
      model,
      voiceSettings,
      outputFormat
    });

    // Convert ArrayBuffer to Buffer for response
    const buffer = Buffer.from(audioBuffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });

  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Text-to-speech failed' },
      { status: 500 }
    );
  }
}