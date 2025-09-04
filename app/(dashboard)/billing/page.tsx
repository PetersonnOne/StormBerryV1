'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Check, 
  Crown, 
  Zap, 
  Shield, 
  Star,
  ArrowRight,
  CreditCard
} from 'lucide-react'

export default function BillingPage() {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      window.open('/api/billing/checkout', '_blank')
    } catch (error) {
      console.error('Error opening checkout:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Unlock the full potential of Storm Berry with our flexible pricing plans
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Free Plan */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-gray-600" />
            </div>
            <CardTitle className="text-2xl">Free</CardTitle>
            <div className="text-3xl font-bold">
              $0<span className="text-sm font-normal text-muted-foreground">/forever</span>
            </div>
            <p className="text-muted-foreground">Perfect for getting started</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">20 OSS AI calls per day</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Basic AI models</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Community support</span>
              </li>
            </ul>
            <Button variant="outline" className="w-full" disabled>
              Current Plan
            </Button>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className="border-2 border-blue-500 shadow-lg relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-blue-500 text-white">
              Most Popular
            </Badge>
          </div>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Crown className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Pro</CardTitle>
            <div className="text-3xl font-bold">
              $19<span className="text-sm font-normal text-muted-foreground">/month</span>
            </div>
            <p className="text-muted-foreground">For power users and professionals</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Unlimited AI calls daily</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Premium AI models</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Priority support</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Advanced features</span>
              </li>
            </ul>
            <Button 
              className="w-full"
              onClick={handleUpgrade}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Upgrade to Pro'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}