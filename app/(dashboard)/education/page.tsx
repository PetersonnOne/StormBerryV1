'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TextInput from '@/components/education/text-input';
import VoiceInput from '@/components/education/voice-input';
import ImageInput from '@/components/education/image-input';
import LessonView from '@/components/education/lesson-view';
import QuizSection from '@/components/education/quiz-section';
import { Toaster } from '@/components/ui/toaster';

export default function EducationModule() {
  const [activeTab, setActiveTab] = useState('text');
  const [loading, setLoading] = useState(false);

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
              <TextInput setLoading={setLoading} />
            </TabsContent>

            <TabsContent value="voice">
              <VoiceInput setLoading={setLoading} />
            </TabsContent>

            <TabsContent value="image">
              <ImageInput setLoading={setLoading} />
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Current Lesson</h2>
          <LessonView loading={loading} />
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
