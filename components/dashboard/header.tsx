'use client'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Bell, 
  Settings, 
  User, 
  Moon, 
  Sun,
  Search,
  Plus,
  LogOut,
  Crown
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { generateCheckoutUrl, POLAR_PRODUCTS } from '@/lib/polar'
import { toast } from 'react-hot-toast'

export function DashboardHeader() {
  const { theme, setTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useUser()
  const { openUserProfile, signOut } = useClerk()
  const router = useRouter()

  const handleProfileClick = () => {
    openUserProfile()
  }

  const handleSettingsClick = () => {
    router.push('/settings')
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
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
        source: 'header_dropdown'
      }
    })

    // Open checkout in new tab
    window.open(checkoutUrl, '_blank')
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Search */}
        <div className="flex items-center space-x-4 flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications - Hidden until implemented */}
          {/* <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </Button> */}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.imageUrl} alt={user?.fullName || 'User'} />
                  <AvatarFallback>
                    {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.fullName || user?.firstName || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.emailAddresses?.[0]?.emailAddress || 'No email'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfileClick}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSettingsClick}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleUpgradeToPro} className="text-blue-600 focus:text-blue-600">
                <Crown className="mr-2 h-4 w-4 text-yellow-500" />
                <span>Upgrade to Pro</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}