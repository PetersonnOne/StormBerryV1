'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Brain, ArrowRight } from 'lucide-react';

const features = [
    {
      title: "ExperienceAI System",
      description: "This is the real-time visual AI interface, enabling users to analyze their environment through the mobile camera. Core capabilities include OCR, object detection, and scene understanding. Analysis results are presented using annotated visual overlays, persona-driven voice feedback (TTS), and context-sensitive haptic signals. A key feature is its integration with AI personas like \"Ada,\" whose traits influence how feedback is delivered—making interactions feel more personal and adaptive.",
      icon: "🤖"
    },
    {
      title: "Tutorial and Guidance System",
      description: "This module transforms ExperienceAI into an interactive learning companion. Users select a domain (e.g., healthcare, programming, business) and their skill level. Guided tutorials then progress step-by-step, adapting dynamically based on visual input, task complexity, and user performance. Progress is tracked visually, with Ada offering real-time feedback, encouragement, and next-step suggestions. This system supports both individual learning and broader educational goals.",
      icon: "📚"
    },
    {
      title: "Collaboration and Peer Features",
      description: "Built for offline environments, the PeerMediaSharing component supports direct file transfers via Bluetooth and Wi-Fi Direct. Users can send images, videos, and documents with real-time progress tracking, interactive device discovery, and batch operations. This enables collaboration without internet access. It's integrated with the larger platform to support both casual and academic media exchange.",
      icon: "🤝"
    },
    {
      title: "Teacher-Student Tools Component",
      description: "This module provides a comprehensive classroom management interface. Teachers can create digital classrooms, assign activities, manage permissions, and monitor student engagement. Students receive assignments (including AI-driven tasks), submit responses, and earn performance-based streaks and badges. Role-based UIs and privacy controls ensure secure and personalized experiences for both educators and learners. The component supports integration with ExperienceAI and collaboration features, creating a full-loop educational ecosystem.",
      icon: "🎓"
    },
    {
      title: "Healthcare Assistance System",
      description: "The HealthcareAssistanceService offers a suite of tools for visual medical analysis, mental health screening, wellness tracking, and emergency alerting. Using the device camera, it can detect medication labels, injuries, symptoms, or skin conditions. Users can log moods, medications, and daily activities, while emergency risks trigger alert flows and contact notifications. Data is encrypted and securely stored. This module provides safety-aware AI support, especially for users in underserved medical environments.",
      icon: "🏥"
    },
    {
      title: "Persona-Aware Camera Analysis",
      description: "This system enhances all visual AI tasks by adapting responses to the active AI persona's expertise and personality. It adjusts how camera input is processed, how feedback is styled (visually and verbally), and how confident or cautious results should be presented. For example, a healthcare persona would offer safety-first insights and calming language, while a programming persona would prioritize debugging feedback and technical analysis. This fusion of personality and AI vision makes the system both intelligent and deeply humanized.",
      icon: "📸"
    }
  ];

const FeaturesPage = () => {
  const [showPopup, setShowPopup] = useState(false);

  const handleComingSoonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

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
      {/* Header Banner with Swapped Gradients */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 rounded-2xl mx-6 mt-6 p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">Discover Storm Berry Features!</h1>
        <p className="text-xl mb-6 opacity-90">
          Explore our comprehensive AI-powered modules designed to enhance your productivity and learning experience.
        </p>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-sm">All systems operational</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-sm">Fast performance</span>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Coming Soon</h2>
          <p className="text-gray-600">Click any module to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={handleComingSoonClick}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 cursor-pointer border border-gray-100"
            >
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              <div className="mt-6 flex justify-end">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12 p-6 bg-white rounded-xl shadow-sm">
          <p className="text-gray-600 text-lg">
            <span className="font-semibold text-purple-600">These are just a few from over a dozen.</span>
          </p>
          <p className="text-gray-500 mt-2">
            More modules and features are continuously being added to enhance your experience.
          </p>
        </div>
      </div>

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
  );
};

export default FeaturesPage;