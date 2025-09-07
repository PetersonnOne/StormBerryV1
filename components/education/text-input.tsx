'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import ModelSelector from '@/components/ui/model-selector';

interface TextInputProps {
  setLoading: (loading: boolean) => void;
  onResponse: (response: string) => void;
}

export default function TextInput({ setLoading, onResponse }: TextInputProps) {
  const [question, setQuestion] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-pro');
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!question.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a question',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/education/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          type: 'text',
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process question');
      }

      const data = await response.json();
      onResponse(data.answer);
      setQuestion(''); // Clear input after successful submission
      
    } catch (error) {
      console.error('Education text input error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process question',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium">AI Model:</span>
        <ModelSelector
          value={selectedModel}
          onChange={setSelectedModel}
          excludeModels={['gemini-2.5-flash-image']}
        />
      </div>
      <Textarea
        placeholder="Type your question here..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="min-h-[100px]"
      />
      <Button
        onClick={handleSubmit}
        className="w-full"
        disabled={!question.trim()}
      >
        Submit Question
      </Button>
    </div>
  );
}