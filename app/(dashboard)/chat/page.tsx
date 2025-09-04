'use client'

import { Suspense, useState, useEffect } from 'react'
import { EnhancedChat } from '@/components/ai/enhanced-chat'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Badge } from '@/components/ui/badge'
import { PageLoading } from '@/components/ui/page-loading'

export default function ChatPage() {
  const [isPageLoading, setIsPageLoading] = useState(true);

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
            <Badge variant="secondary" className="mb-2">
              Gemini 2.5 Pro (Default)
            </Badge>
            <p className="text-sm opacity-75">
              Auto-fallback to Flash & GPT-5
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        <Suspense fallback={<LoadingSpinner />}>
          <EnhancedChat />
        </Suspense>
      </div>
    </div>
  )
}