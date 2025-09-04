'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Settings page is working!</p>
            <Button onClick={() => setLoading(!loading)}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Toggle Loading'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}