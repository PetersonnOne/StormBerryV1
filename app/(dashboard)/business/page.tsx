'use client';

import React, { useState, useEffect } from 'react';
import { PageLoading } from '@/components/ui/page-loading';

const BusinessPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <PageLoading message="Loading Business Module..." />;
  }

  return (
    <div className="p-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-4xl font-bold mb-4">Business & Productivity Module</h1>
        <p className="text-xl mb-6 opacity-90">
          Streamline your workflow and enhance your productivity with our AI-powered tools.
        </p>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-sm">All systems operational</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-sm">Fast performance</span>
          </div>
        </div>
      </div>
      
      <div className="min-h-screen bg-background text-foreground">
        {/* Add Business & Productivity specific content here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card text-card-foreground p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Workflow Builder</h3>
            <p className="text-muted-foreground">Create automated workflows with drag-and-drop interface</p>
          </div>
          <div className="bg-card text-card-foreground p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Document Analysis</h3>
            <p className="text-muted-foreground">AI-powered analysis of contracts and proposals</p>
          </div>
          <div className="bg-card text-card-foreground p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Meeting Summarizer</h3>
            <p className="text-muted-foreground">Generate summaries and action items from transcripts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessPage;