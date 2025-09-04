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
  Accessibility,
  LayoutDashboard,
  MessageSquare
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Education', href: '/education', icon: BookOpen },
  { name: 'Business / Productivity', href: '/business', icon: Briefcase },
  { name: 'Creativity', href: '/story', icon: Sparkles },
  { name: 'Accessibility', href: '/accessibility', icon: Accessibility },
  { name: 'Settings', href: '/settings', icon: Settings },
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

    </div>
  )
}