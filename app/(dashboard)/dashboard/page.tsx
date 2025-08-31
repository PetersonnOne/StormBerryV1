'use client'

import { AIInteractions } from '@/components/dashboard/ai-interactions'

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome to Storm Berry - your AI-powered productivity platform
          </p>
        </div>
        
        {/* AI Interactions Component */}
        <AIInteractions />
      </div>
    </div>
  )
}
