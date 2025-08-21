'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mic, MicOff, Save } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface TranscriptionPanelProps {
  isOfflineMode: boolean;
  fontSize: string;
}

interface Highlight {
  text: string;
  color: string;
}

export default function TranscriptionPanel({ isOfflineMode, fontSize }: TranscriptionPanelProps) {
  const { data: session } = useSession();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [newHighlight, setNewHighlight] = useState('');
  const [highlightColor, setHighlightColor] = useState('#FFD700');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const webSocketRef = useRef<WebSocket | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize WebSocket connection for real-time transcription
    if (!isOfflineMode && isListening) {
      const ws = new WebSocket('wss://api.aimlapi.com/eleven-labs/speech-to-text');
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        ws.send(JSON.stringify({
          action: 'start',
          language: selectedLanguage,
          apiKey: process.env.NEXT_PUBLIC_AIML_API_KEY
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.transcript) {
          setTranscript(prev => prev + ' ' + data.transcript);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        fallbackToOfflineMode();
      };

      webSocketRef.current = ws;

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    } else if (isOfflineMode && isListening) {
      fallbackToOfflineMode();
    }
  }, [isListening, isOfflineMode, selectedLanguage]);

  const fallbackToOfflineMode = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedLanguage;

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;
      setTranscript(prev => prev + ' ' + text);
    };

    recognition.onerror = (event: any) => {
      console.error('Recognition error:', event.error);
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const toggleListening = () => {
    if (isListening) {
      if (webSocketRef.current?.readyState === WebSocket.OPEN) {
        webSocketRef.current.close();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
    setIsListening(!isListening);
  };

  const saveTranscript = async () => {
    if (!session?.user) return;

    setIsProcessing(true);
    try {
      // Save transcript to Netlify Blobs
      const response = await fetch('/api/accessibility/save-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          language: selectedLanguage,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to save transcript');

      // If online, generate summary using GPT-5
      if (!isOfflineMode) {
        const summaryResponse = await fetch('/api/accessibility/summarize-transcript', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transcript,
            language: selectedLanguage,
          }),
        });

        if (!summaryResponse.ok) throw new Error('Failed to generate summary');
      }

      setTranscript('');
    } catch (error) {
      console.error('Error saving transcript:', error);
      alert('Failed to save transcript. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const addHighlight = () => {
    if (newHighlight.trim()) {
      setHighlights([...highlights, { text: newHighlight.trim(), color: highlightColor }]);
      setNewHighlight('');
    }
  };

  const highlightText = (text: string) => {
    let highlightedText = text;
    highlights.forEach(highlight => {
      const regex = new RegExp(`(${highlight.text})`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        `<span style="background-color: ${highlight.color};">$1</span>`
      );
    });
    return highlightedText;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="space-x-2">
            <Button
              onClick={toggleListening}
              variant={isListening ? 'destructive' : 'default'}
              className="space-x-2"
            >
              {isListening ? (
                <>
                  <MicOff className="h-4 w-4" />
                  <span>Stop Listening</span>
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  <span>Start Listening</span>
                </>
              )}
            </Button>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="en-US">English (US)</option>
              <option value="es-ES">Spanish</option>
              <option value="fr-FR">French</option>
              <option value="de-DE">German</option>
              <option value="it-IT">Italian</option>
              <option value="ja-JP">Japanese</option>
              <option value="ko-KR">Korean</option>
              <option value="zh-CN">Chinese (Simplified)</option>
            </select>
          </div>
          <Button
            onClick={saveTranscript}
            disabled={!transcript || isProcessing}
            className="space-x-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Transcript</span>
              </>
            )}
          </Button>
        </div>

        <div
          className="min-h-[200px] p-4 border rounded-md mb-4 whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: highlightText(transcript) }}
        />

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Add word or phrase to highlight"
              value={newHighlight}
              onChange={(e) => setNewHighlight(e.target.value)}
              className="flex-1"
            />
            <Input
              type="color"
              value={highlightColor}
              onChange={(e) => setHighlightColor(e.target.value)}
              className="w-20"
            />
            <Button onClick={addHighlight}>Add Highlight</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {highlights.map((highlight, index) => (
              <Badge
                key={index}
                style={{ backgroundColor: highlight.color }}
                className="cursor-pointer"
                onClick={() => setHighlights(highlights.filter((_, i) => i !== index))}
              >
                {highlight.text}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}