'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  Settings,
  BookOpen,
  Briefcase,
  Sparkles,
  Accessibility
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Settings },
  { name: 'Education', href: '/education', icon: BookOpen },
  { name: 'Business / Productivity', href: '/business', icon: Briefcase },
  { name: 'Creativity', href: '/story', icon: Sparkles },
  { name: 'Accessibility', href: '/accessibility', icon: Accessibility },
]

const recentConversations = [
  { id: '1', title: 'Project Planning Discussion', updatedAt: '2 hours ago' },
  { id: '2', title: 'Code Review Session', updatedAt: '1 day ago' },
  { id: '3', title: 'Design System Questions', updatedAt: '3 days ago' },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-background border-r">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">Storm Berry</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Recent Items (optional placeholder retained) */}
      <div className="px-4 py-4 border-t">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Recent Items</h3>
          <Button variant="ghost" size="sm">
            {/* Placeholder for future quick actions */}
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="h-48">
          <div className="space-y-1">
            {recentConversations.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 text-sm rounded-md hover:bg-accent cursor-pointer group"
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.updatedAt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}