'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Square } from 'lucide-react';
import ModelSelector from '@/components/ui/model-selector';

interface VoiceInputProps {
  setLoading: (loading: boolean) => void;
  onResponse: (response: string) => void;
}

export default function VoiceInput({ setLoading, onResponse }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-pro');
  const { toast } = useToast();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    // Initialize voice recognition
    const initVoiceRecognition = async () => {
      try {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';
          
          recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += transcript;
              } else {
                interimTranscript += transcript;
              }
            }
            
            setTranscript(prev => prev + finalTranscript + interimTranscript);
          };
          
          recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            toast({
              title: 'Speech Recognition Error',
              description: `Error: ${event.error}`,
              variant: 'destructive',
            });
            setIsRecording(false);
          };
          
          recognition.onend = () => {
            setIsRecording(false);
          };
          
          recognitionRef.current = recognition;
        } else {
          toast({
            title: 'Speech Recognition Not Supported',
            description: 'Your browser does not support speech recognition. Please type your question instead.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Failed to initialize voice recognition:', error);
        toast({
          title: 'Initialization Error',
          description: 'Failed to initialize speech recognition',
          variant: 'destructive',
        });
      }
    };

    initVoiceRecognition();
    
    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  const startRecording = async () => {
    try {
      if (!recognitionRef.current) {
        toast({
          title: 'Error',
          description: 'Speech recognition not available',
          variant: 'destructive',
        });
        return;
      }

      setTranscript(''); // Clear previous transcript
      setIsRecording(true);
      recognitionRef.current.start();
      
      toast({
        title: 'Recording Started',
        description: 'Speak now, your speech will be transcribed',
      });
    } catch (error) {
      console.error('Start recording error:', error);
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
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      
      toast({
        title: 'Recording Stopped',
        description: 'Processing your speech...',
      });
    } catch (error) {
      console.error('Stop recording error:', error);
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
      
      const response = await fetch('/api/education/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: transcript.trim(),
          type: 'voice',
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process speech');
      }

      const data = await response.json();
      onResponse(data.answer);
      setTranscript(''); // Clear transcript after successful submission
      
    } catch (error) {
      console.error('Education voice input error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process speech',
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
        placeholder="Your speech will appear here... (You can also type directly)"
        className="min-h-[100px]"
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