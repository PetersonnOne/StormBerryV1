'use client'

import { useState, useCallback } from 'react'
import { aiService, AIStatus } from '@/lib/ai/unified-ai-service'
import { toast } from 'react-hot-toast'

interface UseAIWithStatusOptions {
  showToasts?: boolean
  autoHideSuccess?: boolean
  successHideDelay?: number
}

export function useAIWithStatus(options: UseAIWithStatusOptions = {}) {
  const {
    showToasts = true,
    autoHideSuccess = true,
    successHideDelay = 4000
  } = options

  const [isLoading, setIsLoading] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<AIStatus | null>(null)
  const [isStatusVisible, setIsStatusVisible] = useState(false)

  const generateContent = useCallback(async (
    prompt: string,
    model?: any,
    systemPrompt?: string,
    maxTokens?: number
  ) => {
    setIsLoading(true)
    setIsStatusVisible(true)

    try {
      const result = await aiService.generateContentWithStatus(
        prompt,
        model,
        systemPrompt,
        maxTokens,
        (status: AIStatus) => {
          setCurrentStatus(status)
          
          if (showToasts) {
            if (status.success) {
              if (status.fallbackUsed) {
                toast.success(`✅ Generated with ${status.model} (fallback used)`, {
                  duration: 3000,
                })
              } else {
                toast.success(`✅ Generated with ${status.model}`, {
                  duration: 2000,
                })
              }
            } else if (status.error) {
              toast.error(`❌ ${status.error}`, {
                duration: 5000,
              })
            } else {
              // Show trying status briefly
              toast.loading(`🔄 Trying ${status.model}...`, {
                duration: 1000,
              })
            }
          }
        }
      )

      if (autoHideSuccess) {
        setTimeout(() => {
          setIsStatusVisible(false)
        }, successHideDelay)
      }

      return result
    } catch (error) {
      if (showToasts) {
        toast.error(`❌ All AI models failed: ${error}`)
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [showToasts, autoHideSuccess, successHideDelay])

  const hideStatus = useCallback(() => {
    setIsStatusVisible(false)
    setCurrentStatus(null)
  }, [])

  return {
    generateContent,
    isLoading,
    currentStatus,
    isStatusVisible,
    hideStatus
  }
}