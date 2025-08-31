'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselSlide {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  gradient: string;
}

const slides: CarouselSlide[] = [
  {
    id: 1,
    title: "AI-Powered Tools to Maximize",
    subtitle: "Productivity",
    description: "Transform your productivity with intelligent tools. Built for professionals, teams, and anyone who values efficient time management.",
    gradient: "from-blue-600 via-purple-600 to-blue-800"
  },
  {
    id: 2,
    title: "Education Module",
    subtitle: "Interactive Learning",
    description: "Ask questions through text, voice, or image. Get personalized lessons and practice with AI-powered quizzes for enhanced learning.",
    gradient: "from-green-600 via-teal-600 to-blue-600"
  },
  {
    id: 3,
    title: "Business & Productivity",
    subtitle: "Workflow Optimization",
    description: "Streamline your workflow and enhance productivity with AI-powered tools designed for fast performance and operational excellence.",
    gradient: "from-purple-600 via-purple-500 to-blue-600"
  },
  {
    id: 4,
    title: "Creativity Module",
    subtitle: "Story & Media Creator",
    description: "Collaborative storytelling with AI image generation, world-building tools, character management, and professional export capabilities.",
    gradient: "from-pink-600 via-rose-600 to-orange-600"
  },
  {
    id: 5,
    title: "Accessibility Module",
    subtitle: "Inclusive Communication",
    description: "AI companion for deaf & hard-of-hearing users with real-time transcription, sign language avatars, and conversation summarization.",
    gradient: "from-indigo-600 via-blue-600 to-cyan-600"
  }
];

export default function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <div className="relative w-full h-96 overflow-hidden rounded-2xl mx-6 mt-6 shadow-2xl">
      {/* Carousel Container */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className={`min-w-full h-full bg-gradient-to-r ${slide.gradient} flex items-center justify-center text-white relative`}
          >
            <div className="text-center px-8 max-w-4xl">
              {/* Robust and Intuitive indicator */}
              <div className="flex items-center justify-center mb-4">
                <div className="w-2 h-2 bg-white rounded-full opacity-70"></div>
                <span className="text-sm ml-2 opacity-70">Robust and Intuitive</span>
              </div>
              
              {/* Main Content */}
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                {slide.title}
                {slide.subtitle && (
                  <>
                    <br />
                    <span className="text-blue-200">{slide.subtitle}</span>
                  </>
                )}
              </h1>
              
              {slide.id === 1 && (
                <h2 className="text-2xl md:text-3xl font-semibold mb-6 opacity-90">
                  With Storm Berry Tools
                </h2>
              )}
              
              <p className="text-lg md:text-xl opacity-90 leading-relaxed max-w-3xl mx-auto">
                {slide.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide 
                ? 'bg-white scale-110' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200"
          aria-label={isAutoPlaying ? "Pause auto-play" : "Resume auto-play"}
        >
          <div className={`w-4 h-4 ${isAutoPlaying ? 'animate-pulse' : ''}`}>
            {isAutoPlaying ? (
              <div className="w-full h-full bg-white rounded-full"></div>
            ) : (
              <div className="w-full h-full border-2 border-white rounded-full"></div>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
