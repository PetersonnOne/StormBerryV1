import { NextRequest, NextResponse } from 'next/server';
import { gptService } from '@/lib/education/gpt-service';
import { getStore } from '@netlify/blobs';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { type, content, topic, difficulty } = data;

    let response;

    switch (type) {
      case 'text':
        response = await gptService.processTextQuestion(content);
        break;

      case 'voice':
        response = await gptService.processVoiceInput(content);
        break;

      case 'image':
        // For image uploads, we expect content to be the Netlify Blobs key
        const imageStore = getStore({ name: 'education-images' });
        const imageUrl = await imageStore.getUrl(content);
        response = await gptService.processImage(imageUrl);
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
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');

    switch (type) {
      case 'lesson':
        const lessonStore = getStore({ name: 'education-lessons' });
        const lesson = await lessonStore.get('latest-lesson');
        return NextResponse.json(lesson ? JSON.parse(lesson as string) : null);

      case 'quiz':
        const quizStore = getStore({ name: 'education-quizzes' });
        const quiz = await quizStore.get('current-quiz');
        return NextResponse.json(quiz ? JSON.parse(quiz as string) : null);

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