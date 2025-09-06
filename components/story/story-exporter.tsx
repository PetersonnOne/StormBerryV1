'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

type ExportFormat = 'pdf' | 'epub' | 'web';

type ExportOptions = {
  includeCharacterProfiles: boolean;
  includeWorldGuide: boolean;
  includeImages: boolean;
  addTableOfContents: boolean;
  addNarration: boolean;
};

export function StoryExporter() {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeCharacterProfiles: true,
    includeWorldGuide: true,
    includeImages: true,
    addTableOfContents: true,
    addNarration: false,
  });
  const [exportTitle, setExportTitle] = useState('');
  const [exportDescription, setExportDescription] = useState('');

  const exportStory = useCallback(async () => {
    if (!exportTitle) {
      toast.error('Please enter a title for the export');
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch('/api/story/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: selectedFormat,
          options: exportOptions,
          title: exportTitle,
          description: exportDescription,
        }),
      });

      if (!response.ok) throw new Error('Failed to export story');
      
      const data = await response.json();

      // For web format, open the exported page in a new tab
      if (selectedFormat === 'web' && data.url) {
        window.open(data.url, '_blank');
      } else {
        // For other formats, trigger download
        const downloadLink = document.createElement('a');
        downloadLink.href = data.url;
        downloadLink.download = `${exportTitle}.${selectedFormat}`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }

      toast.success('Story exported successfully');
    } catch (error) {
      console.error('Error exporting story:', error);
      toast.error('Failed to export story');
    } finally {
      setIsExporting(false);
    }
  }, [selectedFormat, exportOptions, exportTitle, exportDescription]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-2xl font-bold mb-4">Export Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Export Title</label>
            <Input
              placeholder="Enter title for the export"
              value={exportTitle}
              onChange={(e) => setExportTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Input
              placeholder="Enter a description (optional)"
              value={exportDescription}
              onChange={(e) => setExportDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Export Format</label>
            <div className="flex space-x-4">
              <Button
                variant={selectedFormat === 'pdf' ? 'default' : 'outline'}
                onClick={() => setSelectedFormat('pdf')}
              >
                PDF
              </Button>
              <Button
                variant={selectedFormat === 'epub' ? 'default' : 'outline'}
                onClick={() => setSelectedFormat('epub')}
              >
                EPUB
              </Button>
              <Button
                variant={selectedFormat === 'web' ? 'default' : 'outline'}
                onClick={() => setSelectedFormat('web')}
              >
                Interactive Web Page
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-2xl font-bold mb-4">Export Options</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeCharacters"
              checked={exportOptions.includeCharacterProfiles}
              onCheckedChange={(checked) =>
                setExportOptions(prev => ({
                  ...prev,
                  includeCharacterProfiles: checked as boolean,
                }))
              }
            />
            <label
              htmlFor="includeCharacters"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Include Character Profiles
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeWorld"
              checked={exportOptions.includeWorldGuide}
              onCheckedChange={(checked) =>
                setExportOptions(prev => ({
                  ...prev,
                  includeWorldGuide: checked as boolean,
                }))
              }
            />
            <label
              htmlFor="includeWorld"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Include World Guide
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeImages"
              checked={exportOptions.includeImages}
              onCheckedChange={(checked) =>
                setExportOptions(prev => ({
                  ...prev,
                  includeImages: checked as boolean,
                }))
              }
            />
            <label
              htmlFor="includeImages"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Include Generated Images
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="addToc"
              checked={exportOptions.addTableOfContents}
              onCheckedChange={(checked) =>
                setExportOptions(prev => ({
                  ...prev,
                  addTableOfContents: checked as boolean,
                }))
              }
            />
            <label
              htmlFor="addToc"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Add Table of Contents
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="addNarration"
              checked={exportOptions.addNarration}
              onCheckedChange={(checked) =>
                setExportOptions(prev => ({
                  ...prev,
                  addNarration: checked as boolean,
                }))
              }
            />
            <label
              htmlFor="addNarration"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Add Text-to-Speech Narration (AIML Eleven Labs)
            </label>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={exportStory}
          disabled={isExporting || !exportTitle}
          className="w-full md:w-auto"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            'Export Story'
          )}
        </Button>
      </div>
    </div>
  );
}