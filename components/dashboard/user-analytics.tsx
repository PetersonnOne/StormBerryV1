'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity,
  Calendar,
  Target
} from 'lucide-react'

interface AnalyticsData {
  dailyUsage: { date: string; interactions: number; tokens: number }[]
  topFeatures: { name: string; usage: number; percentage: number }[]
  performance: {
    avgResponseTime: number
    successRate: number
    totalCost: number
    tokensUsed: number
  }
}

const mockAnalyticsData: AnalyticsData = {
  dailyUsage: [
    { date: '2024-01-10', interactions: 5, tokens: 1200 },
    { date: '2024-01-11', interactions: 8, tokens: 1800 },
    { date: '2024-01-12', interactions: 3, tokens: 800 },
    { date: '2024-01-13', interactions: 12, tokens: 2500 },
    { date: '2024-01-14', interactions: 7, tokens: 1500 },
    { date: '2024-01-15', interactions: 9, tokens: 2000 },
  ],
  topFeatures: [
    { name: 'Chat Conversations', usage: 25, percentage: 55 },
    { name: 'Code Generation', usage: 12, percentage: 27 },
    { name: 'Image Creation', usage: 5, percentage: 11 },
    { name: 'Text Analysis', usage: 3, percentage: 7 },
  ],
  performance: {
    avgResponseTime: 2.3,
    successRate: 98.5,
    totalCost: 0.029,
    tokensUsed: 9800
  }
}

export function UserAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(mockAnalyticsData)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <p className="text-2xl font-bold text-green-600">
                {analyticsData.performance.avgResponseTime}s
              </p>
              <p className="text-xs text-muted-foreground">Avg Response</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <p className="text-2xl font-bold text-blue-600">
                {analyticsData.performance.successRate}%
              </p>
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <p className="text-2xl font-bold text-purple-600">
                ${analyticsData.performance.totalCost.toFixed(3)}
              </p>
              <p className="text-xs text-muted-foreground">Total Cost</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <p className="text-2xl font-bold text-orange-600">
                {analyticsData.performance.tokensUsed.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Tokens Used</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Feature Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyticsData.topFeatures.map((feature, index) => (
              <div key={feature.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-sm font-medium">{feature.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${feature.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right">
                    {feature.usage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Daily Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analyticsData.dailyUsage.map((day, index) => (
              <div key={day.date} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {new Date(day.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm">{day.interactions} interactions</span>
                  <span className="text-sm text-muted-foreground">
                    {day.tokens.toLocaleString()} tokens
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Usage Increased
                </p>
                <p className="text-xs text-green-600 dark:text-green-300">
                  Your AI interactions are up 25% this week compared to last week.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Activity className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Performance Optimized
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300">
                  Average response time improved by 15% this month.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 