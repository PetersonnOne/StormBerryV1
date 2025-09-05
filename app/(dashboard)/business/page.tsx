'use client';

import React, { useState, useEffect } from 'react';
import { PageLoading } from '@/components/ui/page-loading';
import { PDFReportGenerator } from '@/components/business/pdf-report-generator';
import { PDFAnnotator } from '@/components/business/pdf-annotator';
import { PDFAnalyzer } from '@/components/business/pdf-analyzer';
import { PDFAssembler } from '@/components/business/pdf-assembler';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
        <h1 className="text-4xl font-bold mb-4">
          Business & Productivity Module 
          <span className="text-purple-200 opacity-80 font-normal"> | Powered by https://www.foxit.com API's</span>
        </h1>
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
      
      {/* PDF Tools Tabs */}
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate">Generate PDF Report</TabsTrigger>
          <TabsTrigger value="annotate">Annotate PDF</TabsTrigger>
          <TabsTrigger value="analyze">Analyze PDF</TabsTrigger>
          <TabsTrigger value="assemble">Assemble PDF</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="mt-6">
          <PDFReportGenerator />
        </TabsContent>
        
        <TabsContent value="annotate" className="mt-6">
          <PDFAnnotator />
        </TabsContent>
        
        <TabsContent value="analyze" className="mt-6">
          <PDFAnalyzer />
        </TabsContent>
        
        <TabsContent value="assemble" className="mt-6">
          <PDFAssembler />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessPage;