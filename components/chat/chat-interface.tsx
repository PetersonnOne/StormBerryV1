'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import ModelSelector from '@/components/ui/model-selector'
import { 
  Send, 
  Bot, 
  User, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  RefreshCw,
  Settings
} from 'lucide-react'
import { cn, copyToClipboard } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import dynamic from 'next/dynamic'
import { ExportButton } from '@/components/ui/export-button'
import { ExportableContent } from '@/lib/export-utils'

// Dynamically import heavy components
const ReactMarkdown = dynamic(() => import('react-markdown'), {
  loading: () => <LoadingSpinner />,
  ssr: false
})

const SyntaxHighlighter = dynamic(() => import('react-syntax-highlighter').then(mod => mod.Prism), {
  loading: () => <LoadingSpinner />,
  ssr: false
})

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

const mockMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'Hello! Can you help me with a React component?',
    timestamp: new Date('2024-01-15T10:30:00Z')
  },
  {
    id: '2',
    role: 'assistant',
    content: `Hello! I'd be happy to help you with React components. What specific component are you working on or what would you like to create?

I can help with:
- Component structure and best practices
- State management
- Props and event handling
- Styling and CSS-in-JS
- Performance optimization
- Testing strategies

What do you have in mind?`,
    timestamp: new Date('2024-01-15T10:30:30Z')
  }
]

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gpt-4')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          model: selectedModel,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get AI response')
      }

      const data = await response.json()
      
      const aiMessage: Message = {
        id: data.messageId || (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Chat error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to get AI response')
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleCopyMessage = async (content: string) => {
    try {
      await copyToClipboard(content)
      toast.success('Message copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy message')
    }
  }

  const handleFeedback = (messageId: string, isPositive: boolean) => {
    toast.success(`Feedback recorded: ${isPositive ? 'Positive' : 'Negative'}`)
    // TODO: Send feedback to backend
  }

  const formatMessageContent = (content: string) => {
    return content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `\`\`\`${lang || 'text'}\n${code}\n\`\`\``
    })
  }

  const prepareExportData = (): ExportableContent => {
    return {
      title: 'Storm Berry Chat Conversation',
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      metadata: {
        exportDate: new Date(),
        module: 'Chat',
        model: selectedModel,
        messageCount: messages.length
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/ai-avatar.png" />
            <AvatarFallback>
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">Storm Berry Assistant</h2>
            <p className="text-sm text-muted-foreground">Always here to help</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ModelSelector
            value={selectedModel}
            onValueChange={setSelectedModel}
          />
          <ExportButton 
            data={prepareExportData()} 
            filename={`storm-berry-chat-${new Date().toISOString().split('T')[0]}`}
          />
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'assistant' && (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src="/ai-avatar.png" />
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
            
            <div className={cn(
              'max-w-[80%] space-y-2',
              message.role === 'user' ? 'order-1' : 'order-2'
            )}>
              <Card className={cn(
                'p-4',
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              )}>
                <CardContent className="p-0">
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '')
                            return !inline && match ? (
                              <SyntaxHighlighter
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            )
                          }
                        }}
                      >
                        {formatMessageContent(message.content)}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </CardContent>
              </Card>
              
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyMessage(message.content)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback(message.id, true)}
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback(message.id, false)}
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </Button>
                  <span>
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
            
            {message.role === 'user' && (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src="/user-avatar.png" />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src="/ai-avatar.png" />
              <AvatarFallback>
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <Card className="p-4 bg-muted">
              <CardContent className="p-0">
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm text-muted-foreground">
                    AI is thinking...
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}