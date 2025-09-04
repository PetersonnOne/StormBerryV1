'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import ModelSelector from '@/components/ui/model-selector';

type AnalysisResult = {
  summary: string;
  insights: string[];
  risks: string[];
  recommendations: string[];
  metadata: {
    fileName: string;
    fileType: string;
    pageCount?: number;
    wordCount?: number;
  };
};

export default function DocumentAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-pro');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'xlsx'].includes(fileType || '')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select a PDF, DOCX, or XLSX file',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
    setResult(null);
  };

  const analyzeDocument = async () => {
    if (!file) return;

    try {
      setAnalyzing(true);
      setProgress(0);

      // Upload file to Netlify Blob storage
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await fetch('/api/workflow/upload-document', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Failed to upload document');
      const { blobKey } = await uploadResponse.json();
      setProgress(30);

      // Send for AI analysis
      const analysisResponse = await fetch('/api/business/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `Document: ${file.name}`,
          type: 'other',
          analysisType: 'full',
          model: selectedModel,
        }),
      });

      if (!analysisResponse.ok) throw new Error('Failed to analyze document');
      const analysisResult = await analysisResponse.json();
      setProgress(100);
      setResult(analysisResult);

      toast({
        title: 'Success',
        description: 'Document analysis completed',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to analyze document',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Document Analyzer</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">AI Model:</span>
            <ModelSelector
              value={selectedModel}
              onChange={setSelectedModel}
            />
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={analyzing}
          >
            Select Document
          </Button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf,.docx,.xlsx"
          className="hidden"
        />
      </div>

      {file && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-medium">{file.name}</h3>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              onClick={analyzeDocument}
              disabled={analyzing}
            >
              {analyzing ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>

          {analyzing && (
            <Progress value={progress} className="w-full" />
          )}
        </Card>
      )}

      {result && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-medium mb-4">Document Summary</h3>
            <p className="whitespace-pre-wrap">{result.summary}</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-medium mb-4">Key Insights</h3>
            <ul className="list-disc list-inside space-y-2">
              {result.insights.map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-medium mb-4">Potential Risks</h3>
            <ul className="list-disc list-inside space-y-2">
              {result.risks.map((risk, index) => (
                <li key={index}>{risk}</li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-medium mb-4">Recommendations</h3>
            <ul className="list-disc list-inside space-y-2">
              {result.recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-medium mb-4">Document Metadata</h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">File Name</dt>
                <dd>{result.metadata.fileName}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">File Type</dt>
                <dd>{result.metadata.fileType.toUpperCase()}</dd>
              </div>
              {result.metadata.pageCount && (
                <div>
                  <dt className="text-sm text-gray-500">Page Count</dt>
                  <dd>{result.metadata.pageCount}</dd>
                </div>
              )}
              {result.metadata.wordCount && (
                <div>
                  <dt className="text-sm text-gray-500">Word Count</dt>
                  <dd>{result.metadata.wordCount}</dd>
                </div>
              )}
            </dl>
          </Card>
        </div>
      )}
    </div>
  );
}