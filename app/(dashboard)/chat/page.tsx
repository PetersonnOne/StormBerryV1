'use client'

import { Suspense, useState, useEffect } from 'react'
import { EnhancedChat } from '@/components/ai/enhanced-chat'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Badge } from '@/components/ui/badge'
import { PageLoading } from '@/components/ui/page-loading'
import ModelSelector from '@/components/ui/model-selector'
import { ModelType } from '@/lib/ai/unified-ai-service'

export default function ChatPage() {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<ModelType>('gemini-2.5-pro');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1100);

    return () => clearTimeout(timer);
  }, []);

  if (isPageLoading) {
    return <PageLoading message="Loading Chat Module..." />;
  }

  return (
    <div className="p-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-4">Chat Module</h1>
            <p className="text-xl opacity-90">
              Engage in intelligent conversations with our enhanced AI system.
            </p>
          </div>
          <div className="text-right">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">AI Model</label>
              <ModelSelector 
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                excludeModels={['gemini-2.5-flash-image']}
                className="w-[250px]"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        <Suspense fallback={<LoadingSpinner />}>
          <EnhancedChat selectedModel={selectedModel} />
        </Suspense>
      </div>
    </div>
  )
}