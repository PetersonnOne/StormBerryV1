'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import Carousel from '@/components/carousel'
import { InlineLoading } from '@/components/ui/page-loading'

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
  CheckCircle,
  X,
  Menu
} from 'lucide-react'

export default function HomePage() {
  const [showPopup, setShowPopup] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [signInLoading, setSignInLoading] = useState(false)
  const [signUpLoading, setSignUpLoading] = useState(false)

  const handleComingSoonClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowPopup(true)
    setTimeout(() => setShowPopup(false), 3000)
  }

  const handleSignInClick = () => {
    setSignInLoading(true)
    // Loading state will be cleared when navigation completes
  }

  const handleSignUpClick = () => {
    setSignUpLoading(true)
    // Loading state will be cleared when navigation completes
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
            <Button 
              variant="ghost" 
              asChild 
              disabled={signInLoading}
              onClick={handleSignInClick}
            >
              <Link href="/sign-in" className="text-sm font-medium">
                {signInLoading ? <InlineLoading /> : "Sign In"}
              </Link>
            </Button>
            <Button asChild disabled={signUpLoading} onClick={handleSignUpClick}>
              <Link href="/sign-up">
                {signUpLoading ? (
                  <InlineLoading />
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Link>
            </Button>
          </nav>
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="container px-4 py-4 space-y-4">
              <Link 
                href="/features" 
                className="block text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Button 
                variant="ghost" 
                asChild 
                className="w-full justify-start"
                disabled={signInLoading}
                onClick={() => {
                  handleSignInClick()
                  setMobileMenuOpen(false)
                }}
              >
                <Link href="/sign-in" className="text-sm font-medium">
                  {signInLoading ? <InlineLoading /> : "Sign In"}
                </Link>
              </Button>
              <Button 
                asChild 
                className="w-full"
                disabled={signUpLoading}
                onClick={() => {
                  handleSignUpClick()
                  setMobileMenuOpen(false)
                }}
              >
                <Link href="/sign-up">
                  {signUpLoading ? (
                    <InlineLoading />
                  ) : (
                    <>
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Carousel Hero Section */}
      <Carousel />

      {/* Social Proof Section */}
      <section className="container px-4 py-12 mx-auto">
        <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
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
      </section>


      {/* Features Section */}
      <section className="container px-4 py-16 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Your AI-Powered Modules</h2>
          <p className="text-lg text-muted-foreground mt-2">Explore the tools that will redefine your workflow.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Education Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Personalized learning paths and AI-driven insights to accelerate your knowledge.</CardDescription>
            </CardContent>
          </Card>

          {/* Business & Productivity Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Business & Productivity</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Streamline your tasks, manage projects, and boost your team's efficiency.</CardDescription>
            </CardContent>
          </Card>

          {/* Creativity Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <Image className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Creativity</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Unleash your creative potential with AI-powered content generation and brainstorming tools.</CardDescription>
            </CardContent>
          </Card>

          {/* Accessibility Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Accessibility</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Tools designed to make digital content more accessible for everyone.</CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4 py-2 text-center">
        <iframe 
            width="1280" 
            height="720" 
            src="https://www.youtube.com/embed/QZS0m20ZYLU" 
            title="YouTube video player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            className="mx-auto"
        ></iframe>
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
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90" 
              asChild
              disabled={signInLoading}
              onClick={handleSignInClick}
            >
              <Link href="/sign-in">
                {signInLoading ? <InlineLoading /> : "Sign In"}
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-black bg-white hover:bg-gray-100 hover:border-gray-200 transition-all duration-200" 
              asChild
              disabled={signUpLoading}
              onClick={handleSignUpClick}
            >
              <Link href="/sign-up">
                {signUpLoading ? (
                  <InlineLoading />
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container px-4 py-12 mx-auto">
          <div className="text-center text-sm text-muted-foreground">
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