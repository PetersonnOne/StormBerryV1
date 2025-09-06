'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface ConversationHistoryProps {
  isOfflineMode: boolean;
}

interface Transcript {
  filename: string;
  language: string;
  timestamp: string;
  summary: {
    summary: string;
    keyPoints: string[];
    actionItems: string[];
    importantDetails: string[];
  } | null;
}

export function ConversationHistory({ isOfflineMode }: ConversationHistoryProps) {
  const { user } = useUser();
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTranscript, setExpandedTranscript] = useState<string | null>(null);
  const [selectedTranscript, setSelectedTranscript] = useState<string | null>(null);
  const [transcriptContent, setTranscriptContent] = useState<string>('');

  useEffect(() => {
    if (!user || isOfflineMode) {
      setIsLoading(false);
      return;
    }

    loadTranscripts();
  }, [user, isOfflineMode]);

  const loadTranscripts = async () => {
    try {
      const response = await fetch('/api/accessibility/get-transcripts');
      if (!response.ok) throw new Error('Failed to load transcripts');

      const data = await response.json();
      setTranscripts(data.transcripts);
    } catch (error) {
      console.error('Error loading transcripts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTranscriptContent = async (filename: string) => {
    try {
      setSelectedTranscript(filename);
      const response = await fetch(`/api/accessibility/get-transcript-content?filename=${encodeURIComponent(filename)}`);
      if (!response.ok) throw new Error('Failed to load transcript content');

      const data = await response.json();
      setTranscriptContent(data.content);
    } catch (error) {
      console.error('Error loading transcript content:', error);
      setTranscriptContent('');
    }
  };

  const downloadTranscript = async (filename: string) => {
    try {
      const response = await fetch(`/api/accessibility/get-transcript-content?filename=${encodeURIComponent(filename)}`);
      if (!response.ok) throw new Error('Failed to download transcript');

      const data = await response.json();
      const blob = new Blob([data.content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename.split('/').pop() || 'transcript.txt';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading transcript:', error);
      alert('Failed to download transcript');
    }
  };

  if (isOfflineMode) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-600 dark:text-gray-400">
          Conversation history is not available in offline mode.
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Card>
    );
  }

  if (transcripts.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-600 dark:text-gray-400">
          No conversation history found.
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {transcripts.map((transcript) => (
          <div
            key={transcript.filename}
            className="border rounded-lg p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(transcript.timestamp).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  Language: {transcript.language}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTranscript(transcript.filename)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (expandedTranscript === transcript.filename) {
                      setExpandedTranscript(null);
                      setSelectedTranscript(null);
                      setTranscriptContent('');
                    } else {
                      setExpandedTranscript(transcript.filename);
                      loadTranscriptContent(transcript.filename);
                    }
                  }}
                >
                  {expandedTranscript === transcript.filename ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {expandedTranscript === transcript.filename && (
              <div className="mt-4 space-y-4">
                {selectedTranscript === transcript.filename && (
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Transcript</h4>
                    <div className="whitespace-pre-wrap text-sm">
                      {transcriptContent}
                    </div>
                  </div>
                )}

                {transcript.summary && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Summary</h4>
                      <p className="text-sm">{transcript.summary.summary}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Key Points</h4>
                      <ul className="list-disc list-inside text-sm">
                        {transcript.summary.keyPoints.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>

                    {transcript.summary.actionItems.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Action Items</h4>
                        <ul className="list-disc list-inside text-sm">
                          {transcript.summary.actionItems.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {transcript.summary.importantDetails.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Important Details</h4>
                        <ul className="list-disc list-inside text-sm">
                          {transcript.summary.importantDetails.map((detail, index) => (
                            <li key={index}>{detail}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

export { ConversationHistory as default };