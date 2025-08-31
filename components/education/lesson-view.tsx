'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
// import { getStore } from '@netlify/blobs'; // TODO: Add when package is installed

interface LessonViewProps {
  loading: boolean;
}

interface Lesson {
  content: string;
  level: number;
  topic: string;
  timestamp: number;
}

export default function LessonView({ loading }: LessonViewProps) {
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadLatestLesson();
  }, []);

  const loadLatestLesson = async () => {
    try {
      const store = getStore({ name: 'education-lessons' });
      const lessonData = await store.get('latest-lesson');
      if (lessonData) {
        setCurrentLesson(JSON.parse(lessonData as string));
      }
    } catch (error) {
      console.error('Failed to load lesson:', error);
    }
  };

  const saveProgress = async (newProgress: number) => {
    try {
      const store = getStore({ name: 'education-progress' });
      await store.set('current-progress', JSON.stringify({
        lessonId: currentLesson?.timestamp,
        progress: newProgress,
        updatedAt: Date.now(),
      }));
      setProgress(newProgress);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <Progress value={30} className="w-[60%] mb-4" />
        <p className="text-sm text-gray-500">Generating lesson content...</p>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
        <p>No lesson content available.</p>
        <p className="text-sm mt-2">Ask a question to start learning!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold">{currentLesson.topic}</h3>
          <p className="text-sm text-gray-500">
            Level: {currentLesson.level}
          </p>
        </div>
        <Progress
          value={progress}
          className="w-[120px]"
        />
      </div>

      <ScrollArea className="h-[300px] rounded-md border p-4">
        <div className="prose prose-sm max-w-none">
          {currentLesson.content}
        </div>
      </ScrollArea>

      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => saveProgress(Math.max(0, progress - 10))}
          disabled={progress === 0}
        >
          Previous
        </Button>
        <Button
          onClick={() => saveProgress(Math.min(100, progress + 10))}
          disabled={progress === 100}
        >
          Next
        </Button>
      </div>
    </div>
  );
}