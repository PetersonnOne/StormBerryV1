'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mic, MicOff, Save, Volume2, VolumeX } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';

interface TranscriptionPanelProps {
  isOfflineMode: boolean;
  fontSize: string;
}

interface Highlight {
  text: string;
  color: string;
}

type VoiceMode = 'elevenlabs';

export default function TranscriptionPanel({ isOfflineMode, fontSize }: TranscriptionPanelProps) {
  const { user } = useUser();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [newHighlight, setNewHighlight] = useState('');
  const [highlightColor, setHighlightColor] = useState('#FFD700');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('elevenlabs');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize speech recognition when listening starts
    if (isListening) {
      if (!isOfflineMode && voiceMode === 'ai-ml') {
        // Use AI-ML WebSocket for real-time transcription
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
          toast.error('AI-ML connection failed, switching to browser mode');
          fallbackToOfflineMode();
        };

        webSocketRef.current = ws;

        return () => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.close();
          }
        };
      } else {
        // Use browser's built-in speech recognition or ElevenLabs
        fallbackToOfflineMode();
      }
    }
  }, [isListening, isOfflineMode, selectedLanguage, voiceMode]);

  const fallbackToOfflineMode = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in this browser.');
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedLanguage;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      toast.success('Listening... Speak now');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Recognition error:', event.error);
      setIsListening(false);
      
      switch (event.error) {
        case 'no-speech':
          toast.error('No speech detected. Please try again.');
          break;
        case 'audio-capture':
          toast.error('Microphone not accessible. Please check permissions.');
          break;
        case 'not-allowed':
          toast.error('Microphone access denied. Please allow microphone access.');
          break;
        default:
          toast.error(`Speech recognition failed: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      if (isListening) {
        // Restart recognition if still listening
        setTimeout(() => {
          if (isListening) {
            recognition.start();
          }
        }, 100);
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      toast.info('Starting speech recognition...');
    } catch (error) {
      console.error('Failed to start recognition:', error);
      toast.error('Failed to start speech recognition');
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      // Stop listening
      if (webSocketRef.current?.readyState === WebSocket.OPEN) {
        webSocketRef.current.close();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      toast.info('Stopped listening');
    } else {
      // Start listening
      toast.info('Preparing to listen...');
    }
    setIsListening(!isListening);
  };

  const saveTranscript = async () => {
    if (!user) return;

    setIsProcessing(true);
    try {
      // Save transcript to backend
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

      setTranscript('');
      toast.success('Transcript saved successfully');
    } catch (error) {
      console.error('Error saving transcript:', error);
      toast.error('Failed to save transcript. Please try again.');
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

  // Text-to-Speech functionality
  const speakText = async (text: string) => {
    if (!text.trim()) {
      toast.error('No text to speak');
      return;
    }

    setIsPlaying(true);
    
    try {
      if (voiceMode === 'browser') {
        // Use browser's built-in speech synthesis
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = selectedLanguage;
          utterance.onend = () => setIsPlaying(false);
          utterance.onerror = () => {
            setIsPlaying(false);
            toast.error('Browser speech synthesis failed');
          };
          speechSynthesis.speak(utterance);
          toast.success('Playing with browser voice');
        } else {
          throw new Error('Speech synthesis not supported');
        }
      } else if (voiceMode === 'elevenlabs') {
        // Use ElevenLabs API
        const response = await fetch('/api/elevenlabs/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            voiceId: 'scOwDtmlUjD3prqpp97I',
            model: 'eleven_multilingual_v2',
            voiceSettings: {
              stability: 0.5,
              similarityBoost: 0.75,
              style: 0.0,
              useSpeakerBoost: true
            }
          }),
        });

        if (!response.ok) {
          throw new Error('ElevenLabs TTS failed');
        }

        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        const audio = new Audio(url);
        audioRef.current = audio;
        
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
          setAudioUrl(null);
        };
        
        audio.onerror = () => {
          setIsPlaying(false);
          toast.error('Audio playback failed');
          URL.revokeObjectURL(url);
          setAudioUrl(null);
        };

        await audio.play();
        toast.success('Playing with ElevenLabs voice');
        
      } else if (voiceMode === 'ai-ml') {
        // Use AI-ML API
        const response = await fetch('https://api.aimlapi.com/eleven-labs/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AIML_API_KEY}`,
          },
          body: JSON.stringify({
            text,
            voice_id: 'scOwDtmlUjD3prqpp97I',
            model_id: 'eleven_multilingual_v2'
          }),
        });

        if (!response.ok) {
          throw new Error('AI-ML TTS failed');
        }

        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        const audio = new Audio(url);
        audioRef.current = audio;
        
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
          setAudioUrl(null);
        };
        
        audio.onerror = () => {
          setIsPlaying(false);
          toast.error('Audio playback failed');
          URL.revokeObjectURL(url);
          setAudioUrl(null);
        };

        await audio.play();
        toast.success('Playing with AI-ML voice');
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsPlaying(false);
      toast.error(`Voice synthesis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const stopSpeaking = () => {
    if (voiceMode === 'browser' && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    
    setIsPlaying(false);
  };

  // Speech-to-Text with ElevenLabs
  const startElevenLabsSTT = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob);
          formData.append('model', 'scribe_v1');
          formData.append('language', selectedLanguage.split('-')[0]);

          const response = await fetch('/api/elevenlabs/speech-to-text', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('ElevenLabs STT failed');
          }

          const result = await response.json();
          if (result.text) {
            setTranscript(prev => prev + ' ' + result.text);
            toast.success('Transcription completed with ElevenLabs');
          }
        } catch (error) {
          console.error('ElevenLabs STT error:', error);
          toast.error('ElevenLabs transcription failed');
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      toast.info('Recording for 5 seconds...');
      
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 5000);
      
    } catch (error) {
      console.error('Microphone access error:', error);
      toast.error('Microphone access denied');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Tabs defaultValue="transcription" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="transcription">Speech-to-Text</TabsTrigger>
            <TabsTrigger value="synthesis">Text-to-Speech</TabsTrigger>
          </TabsList>

          <TabsContent value="transcription" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
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
                  value={voiceMode}
                  onChange={(e) => setVoiceMode(e.target.value as VoiceMode)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="elevenlabs">ElevenLabs (Premium)</option>
                </select>

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
                </select>
              </div>

              {voiceMode === 'elevenlabs' && (
                <Button
                  onClick={startElevenLabsSTT}
                  variant="outline"
                  className="space-x-2"
                >
                  <Mic className="h-4 w-4" />
                  <span>Record with ElevenLabs</span>
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="min-h-[150px] p-4 border rounded-md bg-white dark:bg-gray-900 whitespace-pre-wrap">
                <div dangerouslySetInnerHTML={{ __html: highlightText(transcript) }} />
              </div>

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

              <div className="flex items-center justify-between">
                <Button
                  onClick={saveTranscript}
                  disabled={!transcript || isProcessing}
                  className="space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Transcript</span>
                    </>
                  )}
                </Button>

                <div className="text-sm text-gray-600">
                  {transcript.length} characters
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
              <h3 className="font-semibold mb-2">Voice Options:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>ElevenLabs (Premium):</span>
                  <Badge variant="secondary">High Quality • Natural Voice</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>AI-ML API:</span>
                  <Badge variant="outline">Good Quality • Fast</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Browser (Offline):</span>
                  <Badge variant="outline">Basic Quality • No Internet Required</Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="synthesis" className="space-y-4">
            <div className="space-y-4">
              <textarea
                className="w-full min-h-[150px] p-4 border rounded-md resize-none"
                placeholder="Enter text to convert to speech..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                style={{ fontSize }}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <select
                    value={voiceMode}
                    onChange={(e) => setVoiceMode(e.target.value as VoiceMode)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="elevenlabs">ElevenLabs (Premium)</option>
                  </select>

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
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  {isPlaying ? (
                    <Button
                      onClick={stopSpeaking}
                      variant="destructive"
                      size="sm"
                      className="space-x-2"
                    >
                      <VolumeX className="h-4 w-4" />
                      <span>Stop</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => speakText(transcript)}
                      disabled={!transcript.trim()}
                      size="sm"
                      className="space-x-2"
                    >
                      <Volume2 className="h-4 w-4" />
                      <span>Speak Text</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}