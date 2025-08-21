'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Code, 
  Image, 
  Brain, 
  Zap, 
  Shield, 
  Users, 
  ArrowRight,
  Star,
  CheckCircle
} from 'lucide-react'

export default function HomePage() {
  const [showPopup, setShowPopup] = useState(false)

  const handleComingSoonClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowPopup(true)
    setTimeout(() => setShowPopup(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Storm Berry</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>

            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contact
            </Link>

            <a href="/auth/signin" className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">
              Sign In
            </a>
            <Link href="/auth/signup" passHref legacyBehavior>
              <Button>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container px-4 py-24 mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            <Zap className="mr-2 h-3 w-3" />
            Smart Time Management
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Master Your Time,{' '}
            <span className="gradient-text">Maximize Productivity</span>
            <br />
            Get Things Done at the Storm Berry
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform your productivity with intelligent scheduling, task management, and time tracking tools. 
            Optimize your workflow and achieve more in less time. Built for professionals, teams, and 
            anyone who values efficient time management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleComingSoonClick}>
              See Full Info
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="border-2 border-primary hover:border-primary/80 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200" asChild>
              <Link href="#demo">
                Watch Demo
              </Link>
            </Button>
          </div>
          
          {/* Social Proof */}
          <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span>4.9/5 from 10k+ users</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>2M+ hours saved</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container px-4 py-24 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Time Management Made Simple
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to optimize your time, boost productivity, and help you achieve your goals
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Smart Scheduling</CardTitle>
              <CardDescription>
                Intelligent calendar management that optimizes your schedule and prevents conflicts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Automatic conflict detection</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Optimal time slot suggestions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Meeting coordination</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>
                Organize, prioritize, and track your tasks with intelligent automation and reminders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Priority-based organization</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Automated reminders</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Progress tracking</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4">
                <Image className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Time Tracking</CardTitle>
              <CardDescription>
                Monitor how you spend your time with detailed analytics and productivity insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Automatic time logging</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Productivity analytics</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Custom reporting</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Goal Setting</CardTitle>
              <CardDescription>
                Set, track, and achieve your goals with intelligent milestone planning and progress monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>SMART goal framework</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Milestone tracking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Progress visualization</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Team Collaboration</CardTitle>
              <CardDescription>
                Coordinate team schedules, share calendars, and collaborate on projects efficiently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Shared calendars</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Project coordination</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Team availability</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>Smart Notifications</CardTitle>
              <CardDescription>
                Stay on track with intelligent reminders and notifications that adapt to your workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Context-aware alerts</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Priority-based notifications</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Cross-platform sync</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 py-24 mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to master your time and maximize productivity?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of professionals who are already using Storm Berry to optimize their schedules and achieve more
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleComingSoonClick}>
              See Full Info
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-black bg-white hover:bg-gray-100 hover:border-gray-200 transition-all duration-200" onClick={handleComingSoonClick}>
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container px-4 py-12 mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Storm Berry</span>
              </div>
              <p className="text-muted-foreground">
                Your intelligent time management and productivity platform.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features" className="hover:text-foreground">Features</Link></li>
                <li><a href="#" onClick={handleComingSoonClick} className="hover:text-foreground cursor-pointer">Pricing</a></li>
                <li><a href="#" onClick={handleComingSoonClick} className="hover:text-foreground cursor-pointer">API</a></li>
                <li><a href="#" onClick={handleComingSoonClick} className="hover:text-foreground cursor-pointer">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><a href="#" onClick={handleComingSoonClick} className="hover:text-foreground cursor-pointer">Blog</a></li>
                <li><a href="#" onClick={handleComingSoonClick} className="hover:text-foreground cursor-pointer">Careers</a></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" onClick={handleComingSoonClick} className="hover:text-foreground cursor-pointer">Help Center</a></li>
                <li><a href="#" onClick={handleComingSoonClick} className="hover:text-foreground cursor-pointer">Status</a></li>
                <li><a href="#" onClick={handleComingSoonClick} className="hover:text-foreground cursor-pointer">Privacy</a></li>
                <li><a href="#" onClick={handleComingSoonClick} className="hover:text-foreground cursor-pointer">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Storm Berry. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Coming Soon Popup - Centered */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-lg shadow-lg p-6 max-w-sm mx-4 animate-pulse">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse"></div>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Coming Sep 1 2025
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}