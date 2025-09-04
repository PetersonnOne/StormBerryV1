import { NextRequest, NextResponse } from 'next/server';
import { elevenLabsService } from '@/lib/elevenlabs';

export async function GET(request: NextRequest) {
  try {
    const voices = await elevenLabsService.getVoices();

    return NextResponse.json({
      voices,
      success: true
    });

  } catch (error) {
    console.error('ElevenLabs get voices error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get voices' },
      { status: 500 }
    );
  }
}