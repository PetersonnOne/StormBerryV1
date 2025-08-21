import { Suspense } from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { ConversationList } from '@/components/dashboard/conversation-list'
import { AIInteractions } from '@/components/dashboard/ai-interactions'
import { UserAnalytics } from '@/components/dashboard/user-analytics'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto px-2 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Module Cards */}
            <Link href="/features" className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 cursor-pointer border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="text-3xl mb-2">✨</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Features</h3>
                <p className="text-gray-600">Explore all AI-powered modules and capabilities.</p>
              </div>
              <div className="mt-4 flex justify-end">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </Link>
            <Link href="/about" className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 cursor-pointer border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="text-3xl mb-2">👥</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-gray-600">Learn about Storm Berry's mission and team.</p>
              </div>
              <div className="mt-4 flex justify-end">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </Link>
            <Link href="/contact" className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 cursor-pointer border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="text-3xl mb-2">📞</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Contact</h3>
                <p className="text-gray-600">Get in touch for support or feedback.</p>
              </div>
              <div className="mt-4 flex justify-end">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </Link>
            <Link href="/timekeeper" className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 cursor-pointer border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="text-3xl mb-2">⏰</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Timekeeper</h3>
                <p className="text-gray-600">Manage time zones, reminders, and conversions.</p>
              </div>
              <div className="mt-4 flex justify-end">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </Link>
          </div>
        </main>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations */}
          <div className="lg:col-span-2">
            <Suspense fallback={<LoadingSpinner />}>
              <ConversationList />
            </Suspense>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <Suspense fallback={<LoadingSpinner />}>
              <AIInteractions />
            </Suspense>
            <Suspense fallback={<LoadingSpinner />}>
              <UserAnalytics />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}