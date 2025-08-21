'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorkflowBuilder from '@/components/workflow/workflow-builder';
import DocumentAnalyzer from '@/components/workflow/document-analyzer';
import TranscriptSummarizer from '@/components/workflow/transcript-summarizer';

export default function WorkflowModule() {
  const [activeTab, setActiveTab] = useState('builder');

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI Workflow Orchestrator</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="builder">Workflow Builder</TabsTrigger>
          <TabsTrigger value="analyzer">Document Analyzer</TabsTrigger>
          <TabsTrigger value="summarizer">Meeting Summarizer</TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <Card className="p-6">
            <WorkflowBuilder />
          </Card>
        </TabsContent>

        <TabsContent value="analyzer">
          <Card className="p-6">
            <DocumentAnalyzer />
          </Card>
        </TabsContent>

        <TabsContent value="summarizer">
          <Card className="p-6">
            <TranscriptSummarizer />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}