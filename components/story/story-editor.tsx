'use client';

import { useState, useCallback, useEffect } from 'react';
import { Editor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEditor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ModelSelector from '@/components/ui/model-selector';

export function StoryEditor() {
  const [suggestions, setSuggestions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-pro');
  const [storyMetadata, setStoryMetadata] = useState({
    title: '',
    genre: '',
    synopsis: '',
  });

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      // Save content to Netlify Blobs periodically
      saveContent(editor.getHTML());
    },
  });

  const saveContent = useCallback(async (content: string) => {
    try {
      await fetch('/api/story/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          metadata: storyMetadata,
        }),
      });
    } catch (error) {
      console.error('Error saving content:', error);
    }
  }, [storyMetadata]);

  const generateSuggestions = useCallback(async () => {
    if (!editor?.getHTML()) {
      toast.error('Please write some content first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/story/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Continue this story: ${editor.getText()}`,
          genre: storyMetadata.genre || 'general',
          length: 'short',
          style: 'narrative',
          characters: [],
          setting: '',
          tone: 'neutral',
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate suggestions');
      }

      const data = await response.json();
      setSuggestions(data.story);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate suggestions');
    } finally {
      setIsGenerating(false);
    }
  }, [editor, storyMetadata]);

  const applySuggestion = useCallback(() => {
    if (editor && suggestions) {
      editor.commands.setContent(editor.getHTML() + '\n' + suggestions);
      setSuggestions('');
    }
  }, [editor, suggestions]);

  if (!editor) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <Card className="p-4">
          <div className="mb-4 space-y-2">
            <input
              type="text"
              placeholder="Story Title"
              className="w-full p-2 border rounded"
              value={storyMetadata.title}
              onChange={(e) => setStoryMetadata(prev => ({ ...prev, title: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Genre"
              className="w-full p-2 border rounded"
              value={storyMetadata.genre}
              onChange={(e) => setStoryMetadata(prev => ({ ...prev, genre: e.target.value }))}
            />
            <textarea
              placeholder="Synopsis"
              className="w-full p-2 border rounded"
              value={storyMetadata.synopsis}
              onChange={(e) => setStoryMetadata(prev => ({ ...prev, synopsis: e.target.value }))}
              rows={3}
            />
            <div className="flex items-center gap-2 pt-2">
              <span className="text-sm font-medium">AI Model:</span>
              <ModelSelector
                value={selectedModel}
                onChange={setSelectedModel}
              />
            </div>
          </div>
          <EditorContent editor={editor} className="min-h-[500px] border rounded p-4" />
        </Card>

        <div className="flex justify-end">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => saveContent(editor.getHTML())}
            >
              Save Draft
            </Button>
            <Button
              onClick={generateSuggestions}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Get AI Suggestions'
              )}
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">AI Suggestions</h3>
        {suggestions ? (
          <div className="space-y-4">
            <div className="prose prose-sm">
              {suggestions}
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setSuggestions('')}
              >
                Dismiss
              </Button>
              <Button onClick={applySuggestion}>
                Apply Suggestion
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">
            AI suggestions will appear here. Click "Get AI Suggestions" to generate ideas for your story.
          </p>
        )}
      </Card>
    </div>
  );
}