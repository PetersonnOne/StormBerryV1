'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

type SummaryResult = {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  participants: string[];
};

export default function TranscriptSummarizer() {
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const { toast } = useToast();

  const summarizeTranscript = async () => {
    if (!transcript.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a transcript to summarize',
        variant: 'destructive',
      });
      return;
    }

    try {
      setProcessing(true);

      // First save transcript, then summarize
      const saveResponse = await fetch('/api/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'text',
          content: transcript,
        }),
      });

      if (!saveResponse.ok) throw new Error('Failed to save transcript');
      
      const { id: transcriptId } = await saveResponse.json();

      // Send for AI analysis
      const response = await fetch('/api/workflow/summarize-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcriptId }),
      });

      if (!response.ok) throw new Error('Summarization failed');

      const summaryResult = await response.json();
      setResult(summaryResult);

      toast({
        title: 'Success',
        description: 'Transcript has been summarized successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to summarize transcript',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const resetSummary = () => {
    setTranscript('');
    setResult(null);
  };

  const sendSummaryEmail = async () => {
    if (!result) return;

    try {
      const response = await fetch('/api/workflow/send-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });

      if (!response.ok) throw new Error('Failed to send email');

      toast({
        title: 'Success',
        description: 'Summary has been sent via email',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send summary email',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Meeting Transcript Summarizer</h2>
      </div>

      {!result && (
        <div className="space-y-4">
          <Textarea
            placeholder="Paste your meeting transcript here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="min-h-[300px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={summarizeTranscript}
              disabled={processing || !transcript.trim()}
            >
              {processing ? 'Processing...' : 'Summarize Transcript'}
            </Button>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-medium mb-4">Meeting Summary</h3>
            <p className="whitespace-pre-wrap">{result.summary}</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-medium mb-4">Key Points</h3>
            <ul className="list-disc list-inside space-y-2">
              {result.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-medium mb-4">Action Items</h3>
            <ul className="list-disc list-inside space-y-2">
              {result.actionItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-medium mb-4">Participants</h3>
            <div className="flex flex-wrap gap-2">
              {result.participants.map((participant, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-secondary rounded-full text-sm"
                >
                  {participant}
                </span>
              ))}
            </div>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button onClick={sendSummaryEmail} variant="outline">
              Send via Email
            </Button>
            <Button onClick={resetSummary}>
              Summarize Another Transcript
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}