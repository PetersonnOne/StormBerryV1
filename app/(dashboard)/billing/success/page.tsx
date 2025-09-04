'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight, Crown } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { toast } from 'react-hot-toast'

export default function BillingSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useUser()
  const [checkoutId, setCheckoutId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = searchParams.get('checkout_id')
    setCheckoutId(id)
    
    if (id) {
      // Here you would typically verify the payment with your backend
      // and update the user's subscription status
      handlePaymentSuccess(id)
    }
    
    setLoading(false)
  }, [searchParams])

  const handlePaymentSuccess = async (checkoutId: string) => {
    try {
      // TODO: Implement backend verification of payment
      // This would typically involve:
      // 1. Verifying the checkout with Polar
      // 2. Updating user's subscription status in your database
      // 3. Updating user metadata in Clerk
      
      console.log('Payment successful for checkout:', checkoutId)
      toast.success('Welcome to Storm Berry Pro! 🎉')
      
      // Update user metadata to reflect Pro status
      // This is a placeholder - you'd implement this with your backend
      
    } catch (error) {
      console.error('Error processing payment success:', error)
      toast.error('There was an issue processing your payment. Please contact support.')
    }
  }

  const handleContinue = () => {
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Successful! 🎉
        </h1>
        <p className="text-lg text-gray-600">
          Welcome to Storm Berry Pro
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            You're now a Pro user!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">What you get with Pro:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                50 GPT-5 calls per day
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                50 OSS AI calls per day
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Priority support
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Advanced AI models access
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Enhanced productivity features
              </li>
            </ul>
          </div>
          
          {checkoutId && (
            <div className="text-sm text-gray-500 text-center">
              Transaction ID: {checkoutId}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center">
        <Button onClick={handleContinue} size="lg" className="min-w-48">
          Continue to Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Need help? Contact our support team at{' '}
          <a href="mailto:support@stormberry.com" className="text-primary hover:underline">
            support@stormberry.com
          </a>
        </p>
      </div>
    </div>
  )
}