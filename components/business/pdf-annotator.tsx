'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { OperationLoading } from '@/components/ui/page-loading';
import { FileText, Upload, Download, Highlighter } from 'lucide-react';

export function PDFAnnotator() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisType, setAnalysisType] = useState('business');
  const [customWatermark, setCustomWatermark] = useState('');
  const [addComments, setAddComments] = useState(true);
  const [addHeaders, setAddHeaders] = useState(true);
  const [highlightKeywords, setHighlightKeywords] = useState(['Action Item', 'Conclusion', 'Recommendation', 'Important', 'Key Finding']);
  const [isAnnotating, setIsAnnotating] = useState(false);
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
    }
  };

  const handleAnnotatePDF = async () => {
    if (!selectedFile) {
      toast({
        title: 'Error',
        description: 'Please select a PDF file to annotate.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnnotating(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('options', JSON.stringify({
        highlightKeywords,
        addComments,
        addWatermark: customWatermark.trim() || undefined,
        addHeaders,
        analysisType,
      }));

      const response = await fetch('/api/business/annotate-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to annotate PDF');
      }

      // Download the annotated PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `annotated_${selectedFile.name}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'PDF annotated and downloaded successfully!',
      });

      // Reset form
      setSelectedFile(null);
      setCustomWatermark('');
    } catch (error) {
      console.error('Error annotating PDF:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to annotate PDF',
        variant: 'destructive',
      });
    } finally {
      setIsAnnotating(false);
    }
  };

  const addKeyword = () => {
    const keyword = prompt('Enter keyword to highlight:');
    if (keyword && keyword.trim() && !highlightKeywords.includes(keyword.trim())) {
      setHighlightKeywords([...highlightKeywords, keyword.trim()]);
    }
  };

  const removeKeyword = (index: number) => {
    setHighlightKeywords(highlightKeywords.filter((_, i) => i !== index));
  };

  if (isAnnotating) {
    return <OperationLoading message="Annotating PDF with AI insights..." />;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Highlighter className="h-5 w-5" />
          Annotate PDF
        </CardTitle>
        <CardDescription>
          Upload a PDF to automatically highlight key phrases, add AI-generated comments, and insert headers or watermarks.
          <br />
          <strong>📥 Result:</strong> The annotated PDF will automatically download with "annotated_" prefix in the filename.
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
                  <SelectItem value="business">Business Document</SelectItem>
                  <SelectItem value="academic">Academic Paper</SelectItem>
                  <SelectItem value="legal">Legal Document</SelectItem>
                  <SelectItem value="general">General Document</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="watermark">Custom Watermark (Optional)</Label>
              <Input
                id="watermark"
                placeholder="e.g., REVIEWED, CONFIDENTIAL"
                value={customWatermark}
                onChange={(e) => setCustomWatermark(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Annotation Options</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="comments"
                  checked={addComments}
                  onCheckedChange={setAddComments}
                />
                <Label htmlFor="comments" className="text-sm font-normal">
                  Add AI-generated comments
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="headers"
                  checked={addHeaders}
                  onCheckedChange={setAddHeaders}
                />
                <Label htmlFor="headers" className="text-sm font-normal">
                  Add date headers
                </Label>
              </div>
            </div>

            <div>
              <Label>Keywords to Highlight</Label>
              <div className="mt-2 space-y-2">
                {highlightKeywords.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                    <span className="text-sm">{keyword}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeKeyword(index)}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addKeyword}
                  className="w-full"
                >
                  Add Keyword
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleAnnotatePDF}
            disabled={isAnnotating || !selectedFile}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Annotate PDF
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
