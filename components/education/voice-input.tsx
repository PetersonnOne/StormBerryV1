'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Square } from 'lucide-react';

interface VoiceInputProps {
  setLoading: (loading: boolean) => void;
}

export default function VoiceInput({ setLoading }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Initialize voice recognition
    const initVoiceRecognition = async () => {
      try {
        // TODO: Implement voice recognition setup
      } catch (error) {
        console.error('Failed to initialize voice recognition:', error);
      }
    };

    initVoiceRecognition();
    
    // Cleanup
    return () => {
      // TODO: Cleanup voice recognition
    };
  }, []);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      // TODO: Implement start recording logic
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start recording',
        variant: 'destructive',
      });
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      // TODO: Implement stop recording logic
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to stop recording',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async () => {
    if (!transcript.trim()) {
      toast({
        title: 'Error',
        description: 'No speech detected',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement GPT-5 API call with transcript
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process speech',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          variant={isRecording ? 'destructive' : 'default'}
          className="rounded-full w-16 h-16 p-4"
        >
          {isRecording ? (
            <Square className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </Button>
      </div>

      <Textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="Your speech will appear here..."
        className="min-h-[100px]"
        readOnly
      />

      <Button
        onClick={handleSubmit}
        className="w-full"
        disabled={!transcript.trim()}
      >
        Submit Question
      </Button>
    </div>
  );
}