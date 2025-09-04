import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { gptService } from '@/lib/education/gpt-service';
import { textsService } from '@/lib/db/texts';
import { imagesService } from '@/lib/db/images';

export async function POST(request: NextRequest) {
  try {
    const { userId, getToken } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { type, content, topic, difficulty } = data;
    const token = await getToken({ template: 'supabase' });

    let response;

    switch (type) {
      case 'text':
        response = await gptService.processTextQuestion(content);
        break;

      case 'voice':
        response = await gptService.processVoiceInput(content);
        break;

      case 'image':
        // For image uploads, we expect content to be the image ID from Supabase
        const image = await imagesService.getById(content, userId, token || undefined);
        if (!image) {
          return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }
        response = await gptService.processImage(image.url);
        break;

      case 'quiz':
        response = await gptService.generateQuiz(topic, difficulty);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid request type' },
          { status: 400 }
        );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Education API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId, getToken } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const token = await getToken({ template: 'supabase' });

    switch (type) {
      case 'lesson':
        const lessons = await textsService.getAll(userId, token || undefined);
        const latestLesson = lessons
          .filter(text => {
            try {
              const content = JSON.parse(text.content);
              return content.metadata?.type === 'lesson';
            } catch {
              return false;
            }
          })
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        
        return NextResponse.json(latestLesson ? JSON.parse(latestLesson.content) : null);

      case 'quiz':
        const quizzes = await textsService.getAll(userId, token || undefined);
        const currentQuiz = quizzes
          .filter(text => {
            try {
              const content = JSON.parse(text.content);
              return content.metadata?.type === 'quiz';
            } catch {
              return false;
            }
          })
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        
        return NextResponse.json(currentQuiz ? JSON.parse(currentQuiz.content) : null);

      default:
        return NextResponse.json(
          { error: 'Invalid request type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Education API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}