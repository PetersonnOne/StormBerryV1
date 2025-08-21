'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StoryEditor } from '@/components/story/story-editor';
import { WorldBuilder } from '@/components/story/world-builder';
import { CharacterManager } from '@/components/story/character-manager';
import { StoryExporter } from '@/components/story/story-exporter';

export default function StoryPage() {
  const [activeTab, setActiveTab] = useState('editor');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Story Creator Studio</h1>
      
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