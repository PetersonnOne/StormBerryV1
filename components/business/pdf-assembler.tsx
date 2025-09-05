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
import { FileStack, Plus, Trash2, Download, Sparkles } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  prompt: string;
}

interface AppendixItem {
  id: string;
  title: string;
  content: string;
}

export function PDFAssembler() {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [author, setAuthor] = useState('');
  const [documentType, setDocumentType] = useState('custom');
  const [sections, setSections] = useState<Section[]>([
    { id: '1', title: 'Introduction', prompt: 'Write an introduction for this document' }
  ]);
  const [includeAppendix, setIncludeAppendix] = useState(false);
  const [appendixItems, setAppendixItems] = useState<AppendixItem[]>([]);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-pro');
  const [isAssembling, setIsAssembling] = useState(false);
  const { toast } = useToast();

  const addSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      title: '',
      prompt: ''
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (id: string) => {
    if (sections.length > 1) {
      setSections(sections.filter(section => section.id !== id));
    }
  };

  const updateSection = (id: string, field: 'title' | 'prompt', value: string) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, [field]: value } : section
    ));
  };

  const addAppendixItem = () => {
    const newItem: AppendixItem = {
      id: Date.now().toString(),
      title: '',
      content: ''
    };
    setAppendixItems([...appendixItems, newItem]);
  };

  const removeAppendixItem = (id: string) => {
    setAppendixItems(appendixItems.filter(item => item.id !== id));
  };

  const updateAppendixItem = (id: string, field: 'title' | 'content', value: string) => {
    setAppendixItems(appendixItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleAssemblePDF = async () => {
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a document title.',
        variant: 'destructive',
      });
      return;
    }

    const validSections = sections.filter(s => s.title.trim() && s.prompt.trim());
    if (validSections.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one section with title and prompt.',
        variant: 'destructive',
      });
      return;
    }

    setIsAssembling(true);

    try {
      const requestData = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        author: author.trim() || undefined,
        sections: validSections.map(s => ({
          title: s.title.trim(),
          prompt: s.prompt.trim()
        })),
        includeAppendix,
        appendixData: includeAppendix ? appendixItems.filter(item => item.title.trim() && item.content.trim()) : undefined,
        documentType,
        model: selectedModel,
      };

      const response = await fetch('/api/business/assemble-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assemble PDF');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_assembled.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'PDF assembled and downloaded successfully!',
      });

      // Reset form
      setTitle('');
      setSubtitle('');
      setAuthor('');
      setSections([{ id: '1', title: 'Introduction', prompt: 'Write an introduction for this document' }]);
      setAppendixItems([]);
      setIncludeAppendix(false);
    } catch (error) {
      console.error('Error assembling PDF:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to assemble PDF',
        variant: 'destructive',
      });
    } finally {
      setIsAssembling(false);
    }
  };

  if (isAssembling) {
    return <OperationLoading message="Assembling PDF with AI-generated content..." />;
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileStack className="h-5 w-5" />
          Assemble PDF
        </CardTitle>
        <CardDescription>
          Create a comprehensive PDF document by combining AI-generated content with professional formatting and structure.
          <br />
          <strong>📥 Result:</strong> The assembled PDF will automatically download with your specified document title as the filename.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Document Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Document Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Business Strategy Report 2024"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="subtitle">Subtitle (Optional)</Label>
              <Input
                id="subtitle"
                placeholder="e.g., Comprehensive Analysis and Recommendations"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="mt-1"
              />
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
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="documentType">Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business-plan">Business Plan</SelectItem>
                  <SelectItem value="research-report">Research Report</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                  <SelectItem value="custom">Custom Document</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>AI Model</Label>
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                includeOnly={['gemini-2.5-pro', 'gemini-2.5-flash']}
                className="mt-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="appendix"
                checked={includeAppendix}
                onCheckedChange={setIncludeAppendix}
              />
              <Label htmlFor="appendix" className="text-sm font-normal">
                Include appendix section
              </Label>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-medium">Document Sections *</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={addSection}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Section
            </Button>
          </div>

          <div className="space-y-4">
            {sections.map((section, index) => (
              <Card key={section.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Section {index + 1}</h4>
                  {sections.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSection(section.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`section-title-${section.id}`}>Section Title</Label>
                    <Input
                      id={`section-title-${section.id}`}
                      placeholder="e.g., Market Analysis"
                      value={section.title}
                      onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`section-prompt-${section.id}`}>AI Prompt</Label>
                    <Textarea
                      id={`section-prompt-${section.id}`}
                      placeholder="Describe what content should be generated for this section..."
                      value={section.prompt}
                      onChange={(e) => updateSection(section.id, 'prompt', e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Appendix */}
        {includeAppendix && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-medium">Appendix Items</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addAppendixItem}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Appendix Item
              </Button>
            </div>

            <div className="space-y-4">
              {appendixItems.map((item, index) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Appendix Item {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAppendixItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`appendix-title-${item.id}`}>Title</Label>
                      <Input
                        id={`appendix-title-${item.id}`}
                        placeholder="e.g., Data Tables"
                        value={item.title}
                        onChange={(e) => updateAppendixItem(item.id, 'title', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`appendix-content-${item.id}`}>Content</Label>
                      <Textarea
                        id={`appendix-content-${item.id}`}
                        placeholder="Enter the content for this appendix item..."
                        value={item.content}
                        onChange={(e) => updateAppendixItem(item.id, 'content', e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleAssemblePDF}
            disabled={isAssembling || !title.trim() || sections.filter(s => s.title.trim() && s.prompt.trim()).length === 0}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Assemble PDF
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
