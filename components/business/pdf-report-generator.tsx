'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import ModelSelector from '@/components/ui/model-selector';
import { OperationLoading } from '@/components/ui/page-loading';
import { FileText, Download, Sparkles } from 'lucide-react';

export function PDFReportGenerator() {
  const [topic, setTopic] = useState('');
  const [reportType, setReportType] = useState('business-analysis');
  const [author, setAuthor] = useState('');
  const [watermark, setWatermark] = useState('');
  const [includeCoverPage, setIncludeCoverPage] = useState(true);
  const [includeTableOfContents, setIncludeTableOfContents] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-pro');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    if (!topic.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a topic for the report.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/business/generate-pdf-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          reportType,
          includeCharts,
          includeCoverPage,
          includeTableOfContents,
          author: author.trim() || undefined,
          watermark: watermark.trim() || undefined,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF report');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${topic.replace(/[^a-zA-Z0-9]/g, '_')}_report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'PDF report generated and downloaded successfully!',
      });

      // Reset form
      setTopic('');
      setAuthor('');
      setWatermark('');
    } catch (error) {
      console.error('Error generating PDF report:', error);
      console.error('Full error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        response: error
      });
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate PDF report',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return <OperationLoading message="Generating PDF report with AI..." />;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generate PDF Report
        </CardTitle>
        <CardDescription>
          Create professional PDF reports with AI-generated content, formatted with cover pages, table of contents, and professional styling.
          <br />
          <strong>📥 Result:</strong> Your PDF will automatically download to your browser's default download folder when ready.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="topic">Report Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., Q4 Sales Performance Analysis"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business-analysis">Business Analysis</SelectItem>
                  <SelectItem value="market-research">Market Research</SelectItem>
                  <SelectItem value="financial-report">Financial Report</SelectItem>
                  <SelectItem value="project-summary">Project Summary</SelectItem>
                  <SelectItem value="custom">Custom Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="author">Author (Optional)</Label>
              <Input
                id="author"
                placeholder="Your name or organization"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="watermark">Watermark (Optional)</Label>
              <Input
                id="watermark"
                placeholder="e.g., CONFIDENTIAL, DRAFT"
                value={watermark}
                onChange={(e) => setWatermark(e.target.value)}
                className="mt-1"
              />
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
              <Label>Report Options</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="coverPage"
                  checked={includeCoverPage}
                  onCheckedChange={setIncludeCoverPage}
                />
                <Label htmlFor="coverPage" className="text-sm font-normal">
                  Include cover page
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tableOfContents"
                  checked={includeTableOfContents}
                  onCheckedChange={setIncludeTableOfContents}
                />
                <Label htmlFor="tableOfContents" className="text-sm font-normal">
                  Include table of contents
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="charts"
                  checked={includeCharts}
                  onCheckedChange={setIncludeCharts}
                />
                <Label htmlFor="charts" className="text-sm font-normal">
                  Include charts and diagrams
                </Label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating || !topic.trim()}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate PDF Report
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
