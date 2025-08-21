import { Suspense } from 'react'
import { ChatInterface } from '@/components/chat/chat-interface'
import { ChatSidebar } from '@/components/chat/chat-sidebar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function ChatPage() {
  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar />
      <div className="flex-1 flex flex-col">
        <Suspense fallback={<LoadingSpinner />}>
          <ChatInterface />
        </Suspense>
      </div>
    </div>
  )
} 