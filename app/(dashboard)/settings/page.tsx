'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { PageLoading, OperationLoading } from '@/components/ui/page-loading'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Key,
  Trash2,
  Save,
  Crown,
  ExternalLink,
  Loader2,
  TrendingUp
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { generateCheckoutUrl, generateCustomerPortalUrl, POLAR_PRODUCTS, SUBSCRIPTION_TIERS } from '@/lib/polar'
import { useUserSettings } from '@/hooks/useUserSettings'

export default function SettingsPage() {
  const { user } = useUser()
  const { theme, setTheme } = useTheme()
  const { settings: userSettings, usage, isLoading, updateSettings } = useUserSettings()
  const [loading, setLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  
  // Local state for form management
  const [formData, setFormData] = useState({
    notifications: {
      email: true,
      push: false,
      marketing: false
    },
    privacy: {
      analytics: true,
      dataSharing: false
    },
    preferences: {
      defaultModel: 'gemini-2.5-pro',
      autoSave: true,
      compactMode: false,
      aiTemperature: 0.7,
      maxTokens: 1000
    },
    accessibility: {
      fontSize: 'medium',
      highContrast: false,
      screenReader: false,
      voiceProvider: 'elevenlabs',
      voiceSpeed: 1.0
    }
  })

  // Update form data when user settings are loaded
  useEffect(() => {
    if (userSettings) {
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          defaultModel: userSettings.default_ai_model,
          autoSave: userSettings.auto_save,
          compactMode: userSettings.compact_mode,
          aiTemperature: userSettings.ai_temperature,
          maxTokens: userSettings.max_tokens
        },
        notifications: {
          ...prev.notifications,
          email: userSettings.notifications_enabled,
          marketing: userSettings.marketing_consent
        },
        privacy: {
          ...prev.privacy,
          analytics: userSettings.analytics_consent,
          dataSharing: userSettings.data_collection_consent
        },
        accessibility: {
          ...prev.accessibility,
          fontSize: userSettings.font_size,
          highContrast: userSettings.high_contrast,
          screenReader: userSettings.screen_reader_enabled,
          voiceProvider: userSettings.default_voice_provider,
          voiceSpeed: userSettings.voice_speed
        }
      }))
    }
  }, [userSettings])

  // Page loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false)
    }, 1600)

    return () => clearTimeout(timer)
  }, [])

  const handleSaveSettings = async () => {
    if (!userSettings) {
      toast.error('Settings not loaded yet')
      return
    }

    setLoading(true)
    try {
      const updatedSettings = {
        default_ai_model: formData.preferences.defaultModel,
        ai_temperature: formData.preferences.aiTemperature,
        max_tokens: formData.preferences.maxTokens,
        auto_save: formData.preferences.autoSave,
        compact_mode: formData.preferences.compactMode,
        notifications_enabled: formData.notifications.email,
        marketing_consent: formData.notifications.marketing,
        data_collection_consent: formData.privacy.dataSharing,
        analytics_consent: formData.privacy.analytics,
        font_size: formData.accessibility.fontSize,
        high_contrast: formData.accessibility.highContrast,
        screen_reader_enabled: formData.accessibility.screenReader,
        default_voice_provider: formData.accessibility.voiceProvider,
        voice_speed: formData.accessibility.voiceSpeed,
        theme: theme || 'system'
      }

      const success = await updateSettings(updatedSettings)
      if (!success) {
        throw new Error('Failed to update settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // TODO: Implement account deletion
        toast.error('Account deletion not implemented yet')
      } catch (error) {
        toast.error('Failed to delete account')
      }
    }
  }

  const handleUpgradeToPro = () => {
    if (!user) {
      toast.error('Please sign in to upgrade')
      return
    }

    const checkoutUrl = generateCheckoutUrl({
      products: POLAR_PRODUCTS.PRO_MONTHLY,
      customerEmail: user.primaryEmailAddress?.emailAddress,
      customerName: `${user.firstName} ${user.lastName}`.trim(),
      customerExternalId: user.id,
      metadata: {
        userId: user.id,
        tier: 'pro',
        source: 'settings_page'
      }
    })

    // Open checkout in new tab
    window.open(checkoutUrl, '_blank')
  }

  const handleManageSubscription = () => {
    const portalUrl = generateCustomerPortalUrl()
    window.open(portalUrl, '_blank')
  }

  if (isLoading || isPageLoading) {
    return <PageLoading message="Loading Settings..." />
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Settings - Coming Soon
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 pointer-events-none opacity-50 select-none">
        {/* Usage Statistics */}
        {usage && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Usage Statistics
                <Badge variant={usage.tier === 'pro' ? 'default' : 'secondary'}>
                  {usage.tier.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{usage.today}</div>
                  <div className="text-sm text-muted-foreground">Today</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{usage.remaining_today}</div>
                  <div className="text-sm text-muted-foreground">Remaining</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{usage.weekly}</div>
                  <div className="text-sm text-muted-foreground">This Week</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{usage.monthly}</div>
                  <div className="text-sm text-muted-foreground">This Month</div>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Daily limit: {usage.daily_limit} API calls ({usage.tier === 'pro' ? 'Pro' : 'Free'} tier)
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  defaultValue={user?.firstName || ''}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  defaultValue={user?.lastName || ''}
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.primaryEmailAddress?.emailAddress || ''}
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed here. Please use your account provider settings.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred theme
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                >
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                >
                  Dark
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('system')}
                >
                  System
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Compact Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Use a more compact interface
                </p>
              </div>
              <Switch
                checked={formData.preferences.compactMode}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, compactMode: checked }
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              AI Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Default AI Model</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred AI model
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={formData.preferences.defaultModel === 'gemini-2.5-pro' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, defaultModel: 'gemini-2.5-pro' }
                    }))
                  }
                >
                  Gemini Pro
                </Button>
                <Button
                  variant={formData.preferences.defaultModel === 'gemini-2.5-flash' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, defaultModel: 'gemini-2.5-flash' }
                    }))
                  }
                >
                  Gemini Flash
                </Button>
                <Button
                  variant={formData.preferences.defaultModel === 'gpt-oss-120b' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, defaultModel: 'gpt-oss-120b' }
                    }))
                  }
                >
                  GPT-OSS 120B
                </Button>
                <Button
                  variant={formData.preferences.defaultModel === 'gpt-5' ? 'default' : 'outline'}
                  size="sm"
                  disabled={true}
                  className="opacity-50 cursor-not-allowed"
                  title="GPT-5 is coming soon"
                >
                  GPT-5 (Coming Soon)
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-save Conversations</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save your conversations
                </p>
              </div>
              <Switch
                checked={formData.preferences.autoSave}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, autoSave: checked }
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates via email
                </p>
              </div>
              <Switch
                checked={formData.notifications.email}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, email: checked }
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications in browser
                </p>
              </div>
              <Switch
                checked={formData.notifications.push}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, push: checked }
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Marketing Communications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive product updates and tips
                </p>
              </div>
              <Switch
                checked={formData.notifications.marketing}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, marketing: checked }
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Help improve our service with usage analytics
                </p>
              </div>
              <Switch
                checked={formData.privacy.analytics}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, analytics: checked }
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Data Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Share anonymized data for research
                </p>
              </div>
              <Switch
                checked={formData.privacy.dataSharing}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, dataSharing: checked }
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Usage & Billing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Usage & Billing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {usage ? (
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{usage.today}</div>
                  <div className="text-sm text-muted-foreground">Today</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{usage.remaining_today}</div>
                  <div className="text-sm text-muted-foreground">Remaining</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{usage.weekly}</div>
                  <div className="text-sm text-muted-foreground">This Week</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{usage.monthly}</div>
                  <div className="text-sm text-muted-foreground">This Month</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">--</div>
                  <div className="text-sm text-muted-foreground">Loading...</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">--</div>
                  <div className="text-sm text-muted-foreground">Loading...</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">--</div>
                  <div className="text-sm text-muted-foreground">Loading...</div>
                </div>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Current Plan</Label>
                <p className="text-sm text-muted-foreground">
                  Free Tier - 20 OSS calls/day
                </p>
              </div>
              <Badge variant="secondary">Free</Badge>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    Upgrade to Pro
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get {SUBSCRIPTION_TIERS.PRO.gptCalls} GPT-5 calls + {SUBSCRIPTION_TIERS.PRO.ossCalls} OSS calls daily
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleUpgradeToPro}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleManageSubscription}
                    size="sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  Pro Tier Benefits - ${SUBSCRIPTION_TIERS.PRO.price}/month:
                </h4>
                <ul className="text-sm space-y-1">
                  {SUBSCRIPTION_TIERS.PRO.features.map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-red-600">Delete Account</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={loading}
            className="min-w-32"
          >
            {loading ? (
              <OperationLoading message="Saving settings..." />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}