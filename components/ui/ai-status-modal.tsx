'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react'
import { AIStatus } from '@/lib/ai/unified-ai-service'

interface AIStatusModalProps {
  status: AIStatus | null
  isVisible: boolean
  onClose: () => void
}

export function AIStatusModal({ status, isVisible, onClose }: AIStatusModalProps) {
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    if (isVisible && status) {
      setShouldShow(true)
      
      // Auto-hide after 4 seconds if successful
      if (status.success) {
        const timer = setTimeout(() => {
          setShouldShow(false)
          setTimeout(onClose, 300) // Allow fade out animation
        }, 4000)
        
        return () => clearTimeout(timer)
      }
    } else {
      setShouldShow(false)
    }
  }, [isVisible, status, onClose])

  if (!isVisible || !status) return null

  const getStatusIcon = () => {
    if (status.success) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else if (status.error) {
      return <XCircle className="h-5 w-5 text-red-500" />
    } else {
      return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
    }
  }

  const getStatusMessage = () => {
    if (status.success) {
      if (status.fallbackUsed) {
        return `✅ Generated with ${status.model} (fallback)`
      } else {
        return `✅ Generated with ${status.model}`
      }
    } else if (status.error) {
      return `❌ ${status.error}`
    } else {
      return `🔄 Trying ${status.model}...`
    }
  }

  const getStatusColor = () => {
    if (status.success) {
      return status.fallbackUsed ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
    } else if (status.error) {
      return 'bg-red-50 border-red-200'
    } else {
      return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 pointer-events-none">
      <div
        className={`
          max-w-md w-full mx-4 p-4 rounded-lg border shadow-lg pointer-events-auto
          transform transition-all duration-300 ease-in-out
          ${shouldShow ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}
          ${getStatusColor()}
        `}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getStatusIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {getStatusMessage()}
            </p>
            {status.fallbackChain.length > 1 && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-1">Attempt sequence:</p>
                <div className="flex flex-wrap gap-1">
                  {status.fallbackChain.map((model, index) => (
                    <span
                      key={index}
                      className={`
                        inline-flex items-center px-2 py-1 rounded text-xs font-medium
                        ${index === status.fallbackChain.length - 1 && status.success
                          ? 'bg-green-100 text-green-800'
                          : index < status.fallbackChain.length - 1
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                        }
                      `}
                    >
                      {model}
                      {index === status.fallbackChain.length - 1 && status.success && (
                        <CheckCircle className="ml-1 h-3 w-3" />
                      )}
                      {index < status.fallbackChain.length - 1 && (
                        <XCircle className="ml-1 h-3 w-3" />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {status.fallbackUsed && status.success && (
              <div className="mt-2 flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3 text-yellow-600" />
                <p className="text-xs text-yellow-700">
                  Primary model unavailable, used fallback
                </p>
              </div>
            )}
          </div>
          {(status.success || status.error) && (
            <button
              onClick={() => {
                setShouldShow(false)
                setTimeout(onClose, 300)
              }}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}