'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Brain, 
  ArrowRight, 
  Users, 
  Target, 
  Lightbulb,
  Heart,
  Globe,
  Zap
} from 'lucide-react'

export default function AboutPage() {
  const [showPopup, setShowPopup] = useState(false)

  const handleComingSoonClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowPopup(true)
    setTimeout(() => setShowPopup(false), 3000)
  }

  const values = [
    {
      icon: Users,
      title: 'User-Centric',
      description: 'We put our users first, designing every feature with their needs and experience in mind.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We constantly push the boundaries of what\'s possible with time management and productivity tools.'
    },
    {
      icon: Heart,
      title: 'Accessibility',
      description: 'Effective time management should be accessible to everyone, regardless of their current productivity level.'
    },
    {
      icon: Globe,
      title: 'Global Impact',
      description: 'We aim to make a positive impact on productivity and creativity worldwide.'
    }
  ]

  const team = [
    {
      name: 'Alex Johnson',
      role: 'CEO & Founder',
      description: 'Former AI researcher with 10+ years in machine learning and product development.'
    },
    {
      name: 'Sarah Chen',
      role: 'CTO',
      description: 'Expert in distributed systems and AI infrastructure with experience at top tech companies.'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Head of Design',
      description: 'UX designer passionate about making complex AI tools simple and intuitive.'
    },
    {
      name: 'Emily Davis',
      role: 'Head of AI',
      description: 'PhD in Computer Science specializing in natural language processing and machine learning.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Storm Berry</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>

            <Link href="/about" className="text-sm font-medium text-primary">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            About Storm Berry
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            We're on a mission to revolutionize time management and productivity for everyone. 
            Storm Berry is more than just a scheduling tool—it's your intelligent companion for optimizing time, achieving goals, and maximizing efficiency.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                To transform how people manage their time and achieve their goals through intelligent scheduling, 
                task management, and productivity optimization. We believe technology should help you make the most of every moment.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Founded in 2024, Storm Berry emerged from the vision of creating a comprehensive time management platform 
                that adapts to your unique workflow and helps you achieve peak productivity.
              </p>
              <Button onClick={handleComingSoonClick}>
                Learn More About Our Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg transform rotate-3"></div>
              <Card className="relative bg-white dark:bg-gray-800">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Our Vision</h3>
                      <p className="text-muted-foreground">Empowering everyone</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    A world where everyone has the tools and insights to manage their time effectively, 
                    achieve their goals, and maintain a healthy work-life balance.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These core principles guide everything we do and every decision we make.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're a diverse team of engineers, designers, and productivity experts passionate about building the future of time management.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription className="text-blue-600 font-medium">{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join Our Journey
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Be part of the productivity revolution. Start using Storm Berry today and experience the future of time management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link href="/auth/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" onClick={handleComingSoonClick}>
              Join Our Newsletter
            </Button>
          </div>
        </div>
      </section>

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