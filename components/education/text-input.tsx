'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface TextInputProps {
  setLoading: (loading: boolean) => void;
}

export default function TextInput({ setLoading }: TextInputProps) {
  const [question, setQuestion] = useState('');
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
      // TODO: Implement GPT-5 API call
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process question',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
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