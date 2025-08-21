'use client'

import { analytics } from '@/lib/analytics'
import { Button } from '@/components/ui/button'

export function AnalyticsDemo() {
  const handleTrackEvent = () => {
    // Analytics disabled - button does nothing but won't break
    analytics.trackEvent({
      name: 'demo_button_clicked',
      properties: {
        page: 'analytics_demo',
        timestamp: Date.now()
      }
    })
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics demo: trackEvent called (but disabled)')
    }
  }

  const handleTrackFeature = () => {
    // Analytics disabled - button does nothing but won't break
    analytics.trackFeatureUsage('analytics_demo', {
      feature_type: 'demo',
      user_action: 'feature_test'
    })
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics demo: trackFeatureUsage called (but disabled)')
    }
  }

  const handleTrackInteraction = () => {
    // Analytics disabled - button does nothing but won't break
    analytics.trackUserInteraction('click', 'demo', 'interaction_test')
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics demo: trackUserInteraction called (but disabled)')
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Analytics Demo - DISABLED</h2>
      <p className="text-muted-foreground">
        Analytics functionality is currently disabled for deployment. Buttons are safe to click but won't track anything.
      </p>
      
      <div className="space-y-2">
        <Button onClick={handleTrackEvent} variant="outline" disabled>
          Track Custom Event (Disabled)
        </Button>
        
        <Button onClick={handleTrackFeature} variant="outline" disabled>
          Track Feature Usage (Disabled)
        </Button>
        
        <Button onClick={handleTrackInteraction} variant="outline" disabled>
          Track User Interaction (Disabled)
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p>Analytics Status: {analytics.enabled ? 'Enabled' : 'Disabled'}</p>
        <p>Analytics has been temporarily disabled for deployment compatibility.</p>
      </div>
    </div>
  )
}