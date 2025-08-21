'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Settings, 
  Trash2,
  Archive,
  Star,
  MoreVertical
} from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface Conversation {
  id: string
  title: string
  lastMessage: string
  updatedAt: string
  isActive: boolean
  isStarred: boolean
  messageCount: number
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    title: 'React Component Help',
    lastMessage: 'Can you help me with a React component?',
    updatedAt: '2024-01-15T10:30:00Z',
    isActive: true,
    isStarred: true,
    messageCount: 5
  },
  {
    id: '2',
    title: 'Project Planning',
    lastMessage: 'Let\'s discuss the timeline for the new feature.',
    updatedAt: '2024-01-14T16:45:00Z',
    isActive: true,
    isStarred: false,
    messageCount: 12
  },
  {
    id: '3',
    title: 'Code Review',
    lastMessage: 'The refactoring looks good, but we should add more error handling.',
    updatedAt: '2024-01-13T09:15:00Z',
    isActive: false,
    isStarred: false,
    messageCount: 8
  }
]

export function ChatSidebar() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeConversation, setActiveConversation] = useState('1')

  const filteredConversations = conversations.filter(conversation =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      lastMessage: 'Start a new conversation...',
      updatedAt: new Date().toISOString(),
      isActive: true,
      isStarred: false,
      messageCount: 0
    }
    setConversations(prev => [newConversation, ...prev])
    setActiveConversation(newConversation.id)
  }

  const handleConversationClick = (conversationId: string) => {
    setActiveConversation(conversationId)
  }

  const handleToggleStar = (conversationId: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId 
        ? { ...conv, isStarred: !conv.isStarred }
        : conv
    ))
  }

  const handleArchiveConversation = (conversationId: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId 
        ? { ...conv, isActive: false }
        : conv
    ))
  }

  const handleDeleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId))
    if (activeConversation === conversationId) {
      setActiveConversation(conversations[0]?.id || '')
    }
  }

  return (
    <div className="w-80 border-r bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <Button size="sm" onClick={handleNewConversation}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredConversations.map((conversation) => (
            <Card
              key={conversation.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                activeConversation === conversation.id && 'ring-2 ring-primary'
              )}
              onClick={() => handleConversationClick(conversation.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">
                        {conversation.title}
                      </h3>
                      {conversation.isStarred && (
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      )}
                      {!conversation.isActive && (
                        <Badge variant="outline" className="text-xs">
                          Archived
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {conversation.lastMessage}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatRelativeTime(conversation.updatedAt)}</span>
                      <span>{conversation.messageCount} messages</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleToggleStar(conversation.id)}>
                        {conversation.isStarred ? 'Unstar' : 'Star'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleArchiveConversation(conversation.id)}>
                        {conversation.isActive ? 'Archive' : 'Unarchive'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteConversation(conversation.id)}
                        className="text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="p-4 border-t">
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Archive className="h-4 w-4 mr-2" />
            Archived ({conversations.filter(c => !c.isActive).length})
          </Button>
        </div>
      </div>
    </div>
  )
} 