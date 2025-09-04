'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TextInput from '@/components/education/text-input';
import VoiceInput from '@/components/education/voice-input';
import ImageInput from '@/components/education/image-input';
import LessonView from '@/components/education/lesson-view';
import QuizSection from '@/components/education/quiz-section';
import { Toaster } from '@/components/ui/toaster';
import { PageLoading, OperationLoading } from '@/components/ui/page-loading';

export default function EducationModule() {
  const [activeTab, setActiveTab] = useState('text');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    // Simulate initial page loading
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  if (isPageLoading) {
    return <PageLoading message="Loading Education Module..." />;
  }

  return (
    <div className="p-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-4xl font-bold mb-4">Education Module</h1>
        <p className="text-xl opacity-90">
          Interactive learning with AI-powered assistance through text, voice, and image input.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Ask a Question</h2>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 gap-4 mb-6">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="voice">Voice</TabsTrigger>
              <TabsTrigger value="image">Image</TabsTrigger>
            </TabsList>

            <TabsContent value="text">
              <TextInput setLoading={setLoading} onResponse={setResponse} />
            </TabsContent>

            <TabsContent value="voice">
              <VoiceInput setLoading={setLoading} onResponse={setResponse} />
            </TabsContent>

            <TabsContent value="image">
              <ImageInput setLoading={setLoading} onResponse={setResponse} />
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">AI Response</h2>
          {loading ? (
            <OperationLoading message="Generating AI response..." />
          ) : response ? (
            <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg">
              <div className="whitespace-pre-wrap">{response}</div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              Ask a question to see the AI response here
            </div>
          )}
        </Card>

        <Card className="p-6 md:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Practice Quiz</h2>
          <QuizSection />
        </Card>
      </div>
      <Toaster />
    </div>
  );
}
