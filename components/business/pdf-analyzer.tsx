'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { ModelSelector } from '@/components/ui/model-selector';
import { OperationLoading } from '@/components/ui/page-loading';
import { FileSearch, Upload, Brain, FileText } from 'lucide-react';

interface AnalysisResult {
  aiInsights: string;
  extractedData: {
    fullText: string;
    sections: Array<{
      title: string;
      content: string;
      summary: string;
    }>;
    overallSummary: string;
    keyFindings: string[];
  };
  metadata: {
    fileName: string;
    fileSize: number;
    analysisType: string;
    focusArea: string;
    processingTime: number;
    model: string;
    tokensUsed: number;
  };
}

export function PDFAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisType, setAnalysisType] = useState('summary');
  const [focusArea, setFocusArea] = useState('business');
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-pro');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Error',
          description: 'Please select a PDF file.',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
      setAnalysisResult(null); // Clear previous results
    }
  };

  const handleAnalyzePDF = async () => {
    if (!selectedFile) {
      toast({
        title: 'Error',
        description: 'Please select a PDF file to analyze.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('options', JSON.stringify({
        analysisType,
        focusArea,
        includeRecommendations,
        model: selectedModel,
      }));

      const response = await fetch('/api/business/analyze-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze PDF');
      }

      const result = await response.json();
      setAnalysisResult(result.analysis);

      toast({
        title: 'Success',
        description: 'PDF analyzed successfully!',
      });
    } catch (error) {
      console.error('Error analyzing PDF:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to analyze PDF',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return <OperationLoading message="Analyzing PDF with AI..." />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5" />
            Analyze PDF
          </CardTitle>
          <CardDescription>
            Upload a PDF to extract text, analyze content, and generate AI-powered insights and summaries.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">PDF File *</Label>
                <div className="mt-1">
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="analysisType">Analysis Type</Label>
                <Select value={analysisType} onValueChange={setAnalysisType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary</SelectItem>
                    <SelectItem value="detailed">Detailed Analysis</SelectItem>
                    <SelectItem value="key-insights">Key Insights</SelectItem>
                    <SelectItem value="action-items">Action Items</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="focusArea">Focus Area</Label>
                <Select value={focusArea} onValueChange={setFocusArea}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>AI Model</Label>
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  includeOnly={['gemini-2.5-pro', 'gemini-2.5-flash']}
                  className="mt-1"
                />
              </div>

              <div className="space-y-3">
                <Label>Analysis Options</Label>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recommendations"
                    checked={includeRecommendations}
                    onCheckedChange={setIncludeRecommendations}
                  />
                  <Label htmlFor="recommendations" className="text-sm font-normal">
                    Include recommendations and next steps
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleAnalyzePDF}
              disabled={isAnalyzing || !selectedFile}
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              Analyze PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Analysis Results
            </CardTitle>
            <CardDescription>
              AI-powered insights and extracted data from your PDF document.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">File Size</p>
                <p className="text-sm text-muted-foreground">
                  {(analysisResult.metadata.fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Processing Time</p>
                <p className="text-sm text-muted-foreground">
                  {(analysisResult.metadata.processingTime / 1000).toFixed(1)}s
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Model Used</p>
                <p className="text-sm text-muted-foreground">
                  {analysisResult.metadata.model}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Tokens Used</p>
                <p className="text-sm text-muted-foreground">
                  {analysisResult.metadata.tokensUsed.toLocaleString()}
                </p>
              </div>
            </div>

            {/* AI Insights */}
            <div>
              <h3 className="text-lg font-semibold mb-3">AI Insights</h3>
              <div className="prose prose-sm max-w-none bg-background border rounded-lg p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {analysisResult.aiInsights}
                </pre>
              </div>
            </div>

            {/* Extracted Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Document Sections</h3>
                <div className="space-y-3">
                  {analysisResult.extractedData.sections.map((section, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <h4 className="font-medium text-sm">{section.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {section.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Key Findings</h3>
                <div className="space-y-2">
                  {analysisResult.extractedData.keyFindings.map((finding, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm">{finding}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h4 className="font-medium text-sm mb-2">Overall Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    {analysisResult.extractedData.overallSummary}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
