'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageLoading } from '@/components/ui/page-loading';

// Dynamic imports for better performance
const StoryEditor = dynamic(() => import('@/components/story/story-editor').then(mod => ({ default: mod.StoryEditor })), {
  loading: () => <LoadingSpinner />
});
const WorldBuilder = dynamic(() => import('@/components/story/world-builder').then(mod => ({ default: mod.WorldBuilder })), {
  loading: () => <LoadingSpinner />
});
const CharacterManager = dynamic(() => import('@/components/story/character-manager').then(mod => ({ default: mod.CharacterManager })), {
  loading: () => <LoadingSpinner />
});
const StoryExporter = dynamic(() => import('@/components/story/story-exporter').then(mod => ({ default: mod.StoryExporter })), {
  loading: () => <LoadingSpinner />
});

export default function StoryPage() {
  const [activeTab, setActiveTab] = useState('editor');
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1300);

    return () => clearTimeout(timer);
  }, []);

  if (isPageLoading) {
    return <PageLoading message="Loading Creativity Module..." />;
  }

  return (
    <div className="p-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-4xl font-bold mb-4">Creativity Module</h1>
        <p className="text-xl opacity-90">
          Unleash your creativity with AI-powered story writing and world building tools.
        </p>
      </div>
      
      <Tabs defaultValue="editor" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="editor">Story Editor</TabsTrigger>
          <TabsTrigger value="world">World Builder</TabsTrigger>
          <TabsTrigger value="characters">Characters</TabsTrigger>
          <TabsTrigger value="export">Export Story</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <StoryEditor />
        </TabsContent>

        <TabsContent value="world" className="space-y-4">
          <WorldBuilder />
        </TabsContent>

        <TabsContent value="characters" className="space-y-4">
          <CharacterManager />
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <StoryExporter />
        </TabsContent>
      </Tabs>
    </div>
  );
}
