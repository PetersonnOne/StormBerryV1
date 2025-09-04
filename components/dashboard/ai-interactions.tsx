'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  MessageSquare, 
  Image, 
  Code, 
  TrendingUp,
  Zap,
  Clock,
  RefreshCw
} from 'lucide-react'
import { formatRelativeTime, truncateText } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useUser } from '@clerk/nextjs'

interface AIInteraction {
  id: string
  type: 'chat' | 'image' | 'code' | 'analysis'
  status: 'completed' | 'processing' | 'failed'
  prompt: string
  tokensUsed?: number
  cost?: number
  duration?: number
  createdAt: string
  model?: string
}

interface UsageMetrics {
  totalTokens: number
  totalCost: number
  totalInteractions: number
  monthlyLimit: number
  remainingTokens: number
}

const mockInteractions: AIInteraction[] = [
  {
    id: '1',
    type: 'chat',
    status: 'completed',
    prompt: 'Help me plan a project timeline',
    tokensUsed: 150,
    cost: 0.003,
    duration: 1200,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    type: 'code',
    status: 'completed',
    prompt: 'Generate a React component for user authentication',
    tokensUsed: 300,
    cost: 0.006,
    duration: 2500,
    createdAt: '2024-01-15T09:15:00Z'
  },
  {
    id: '3',
    type: 'image',
    status: 'completed',
    prompt: 'Create a modern dashboard design',
    tokensUsed: 50,
    cost: 0.02,
    duration: 8000,
    createdAt: '2024-01-14T16:45:00Z'
  },
  {
    id: '4',
    type: 'analysis',
    status: 'processing',
    prompt: 'Analyze this dataset for trends',
    createdAt: '2024-01-15T11:00:00Z'
  }
]

const usageStats: UsageMetrics = {
  totalTokens: 1250,
  totalCost: 0.029,
  totalInteractions: 45,
  monthlyLimit: 10000,
  remainingTokens: 10000
}

export function AIInteractions() {
  const { user } = useUser()
  const [interactions, setInteractions] = useState<AIInteraction[]>([])
  const [metrics, setMetrics] = useState<UsageMetrics>({
    totalTokens: 0,
    totalCost: 0,
    totalInteractions: 0,
    monthlyLimit: 10000,
    remainingTokens: 10000
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user) {
      loadUsageData()
    }
  }, [user])

  const loadUsageData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/usage/stats')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data.metrics)
        setInteractions(data.recentInteractions)
      }
    } catch (error) {
      console.error('Failed to load usage data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    try {
      setRefreshing(true)
      await loadUsageData()
    } finally {
      setRefreshing(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'chat': return <MessageSquare className="h-4 w-4" />
      case 'image': return <Image className="h-4 w-4" />
      case 'code': return <Code className="h-4 w-4" />
      case 'analysis': return <Brain className="h-4 w-4" />
      default: return <Brain className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="text-xs">Completed</Badge>
      case 'processing':
        return <Badge variant="outline" className="text-xs">Processing</Badge>
      case 'failed':
        return <Badge variant="destructive" className="text-xs">Failed</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading usage statistics...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Usage This Month
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Tokens</p>
              <p className="text-2xl font-bold">{metrics.totalTokens.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-bold">${metrics.totalCost.toFixed(3)}</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Monthly Limit</span>
              <span>{metrics.totalInteractions}/{metrics.monthlyLimit} tokens</span>
            </div>
            <Progress value={(metrics.totalTokens / metrics.monthlyLimit) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Interactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Interactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {interactions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No recent interactions found
              </div>
            ) : (
              interactions.slice(0, 5).map((interaction) => (
                <div key={interaction.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(interaction.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">
                        {truncateText(interaction.prompt, 50)}
                      </p>
                      {getStatusBadge(interaction.status)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{formatRelativeTime(interaction.createdAt)}</span>
                      {interaction.model && (
                        <span>{interaction.model}</span>
                      )}
                      {interaction.tokensUsed && (
                        <span>{interaction.tokensUsed} tokens</span>
                      )}
                      {interaction.cost && (
                        <span>${interaction.cost.toFixed(3)}</span>
                      )}
                      {interaction.duration && (
                        <span>{(interaction.duration / 1000).toFixed(1)}s</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-primary">{metrics.totalInteractions}</p>
              <p className="text-xs text-muted-foreground">Total Interactions</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-green-600">
                {interactions.length > 0 ? Math.round((interactions.filter(i => i.status === 'completed').length / interactions.length) * 100) : 0}%
              </p>
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-blue-600">
                {interactions.length > 0 ? 
                  (interactions.filter(i => i.duration).reduce((sum, i) => sum + (i.duration || 0), 0) / interactions.filter(i => i.duration).length / 1000).toFixed(1) 
                  : '0'}s
              </p>
              <p className="text-xs text-muted-foreground">Avg Response</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-purple-600">{metrics.remainingTokens}</p>
              <p className="text-xs text-muted-foreground">Remaining Tokens</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 