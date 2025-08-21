'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  Clock,
  User,
  Bot
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface Conversation {
  id: string
  title: string
  lastMessage: string
  updatedAt: string
  messageCount: number
  isActive: boolean
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    title: 'Project Planning Discussion',
    lastMessage: 'Let\'s discuss the timeline for the new feature implementation.',
    updatedAt: '2024-01-15T10:30:00Z',
    messageCount: 24,
    isActive: true
  },
  {
    id: '2',
    title: 'Code Review Session',
    lastMessage: 'The refactoring looks good, but we should add more error handling.',
    updatedAt: '2024-01-14T16:45:00Z',
    messageCount: 18,
    isActive: true
  },
  {
    id: '3',
    title: 'Design System Questions',
    lastMessage: 'Can you help me understand the color palette guidelines?',
    updatedAt: '2024-01-13T09:15:00Z',
    messageCount: 12,
    isActive: false
  },
  {
    id: '4',
    title: 'API Integration Help',
    lastMessage: 'I\'m having trouble with the authentication flow.',
    updatedAt: '2024-01-12T14:20:00Z',
    messageCount: 8,
    isActive: true
  }
]

export function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all')

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && conversation.isActive) ||
                         (filter === 'archived' && !conversation.isActive)
    
    return matchesSearch && matchesFilter
  })

  const handleNewConversation = () => {
    // TODO: Implement new conversation creation
    console.log('Create new conversation')
  }

  const handleConversationClick = (conversationId: string) => {
    // TODO: Navigate to conversation
    console.log('Navigate to conversation:', conversationId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Conversations</h2>
          <p className="text-muted-foreground">
            {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={handleNewConversation}>
          <Plus className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              {filter === 'all' ? 'All' : filter === 'active' ? 'Active' : 'Archived'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilter('all')}>
              All Conversations
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('active')}>
              Active Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('archived')}>
              Archived Only
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Conversation List */}
      <div className="space-y-4">
        {filteredConversations.map((conversation) => (
          <Card 
            key={conversation.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleConversationClick(conversation.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold truncate">{conversation.title}</h3>
                    {conversation.isActive ? (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Archived
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {conversation.lastMessage}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {conversation.messageCount} messages
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(conversation.updatedAt)}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Rename</DropdownMenuItem>
                    <DropdownMenuItem>Archive</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredConversations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No conversations found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Start your first conversation to get help with your tasks.'
              }
            </p>
            {!searchQuery && filter === 'all' && (
              <Button onClick={handleNewConversation}>
                <Plus className="h-4 w-4 mr-2" />
                Start New Conversation
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 