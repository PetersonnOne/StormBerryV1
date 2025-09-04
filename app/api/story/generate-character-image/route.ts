import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { uploadImage } from '@/utils/storage';
import { imagesService } from '@/lib/db/images';

export async function POST(req: Request) {
  try {
    const { userId, getToken } = auth();
    if (!userId) {
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
    const imageUrl = data.output[0];

    // Download the generated image
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();
    const file = new File([imageBlob], `character-${characterId}.png`, { type: 'image/png' });

    const token = await getToken({ template: 'supabase' });

    // Upload to Supabase Storage
    const uploadedUrl = await uploadImage(file, userId, token || undefined);

    // Save image metadata to database
    const result = await imagesService.create(userId, {
      url: uploadedUrl,
      prompt: `Character: ${characterId} - ${prompt}`,
    }, token || undefined);

    return NextResponse.json({
      success: true,
      imageUrl: uploadedUrl,
      id: result.id,
    });

  } catch (error) {
    console.error('Error generating character image:', error);
    return NextResponse.json(
      { error: 'Failed to generate character image' },
      { status: 500 }
    );
  }
}