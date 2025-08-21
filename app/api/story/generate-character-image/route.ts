import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { put } from '@vercel/blob';

export async function POST(req: Request) {
  try {
    const session = await getSession({ req });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, characterId } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Image prompt is required' }, { status: 400 });
    }

    // Generate image using flux-pro API
    const response = await fetch('https://api.aimlapi.com/flux-pro/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AIML_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        negative_prompt: 'blurry, low quality, distorted, deformed',
        width: 512,
        height: 512,
        num_inference_steps: 30,
        guidance_scale: 7.5,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    const data = await response.json();
    const imageUrl = data.output[0]; // The generated image URL

    // Download the generated image
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    // Save the image to Netlify Blobs
    const timestamp = new Date().toISOString();
    const filename = `characters/${session.user.id}/images/${characterId}-${timestamp}.png`;

    const blob = await put(filename, imageBuffer, {
      access: 'public',
      contentType: 'image/png',
      metadata: {
        userId: session.user.id,
        characterId,
        prompt,
        timestamp,
      },
    });

    return NextResponse.json({
      success: true,
      imageUrl: blob.url,
    });

  } catch (error) {
    console.error('Error generating character image:', error);
    return NextResponse.json(
      { error: 'Failed to generate character image' },
      { status: 500 }
    );
  }
}