'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TranscriptionPanel } from '@/components/accessibility/transcription-panel';
import { SignLanguagePanel } from '@/components/accessibility/sign-language-panel';
import { SettingsPanel } from '@/components/accessibility/settings-panel';
import { ConversationHistory } from '@/components/accessibility/conversation-history';
import { PageLoading } from '@/components/ui/page-loading';

type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
type Contrast = 'normal' | 'high';

export default function AccessibilityPage() {
  const [mounted, setMounted] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [contrast, setContrast] = useState<Contrast>('normal');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    // Check network status
    const updateOnlineStatus = () => setIsOfflineMode(!navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Simulate page loading
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1400);
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearTimeout(timer);
    };
  }, []);

  if (!mounted || isPageLoading) {
    return <PageLoading message="Loading Accessibility Module..." />;
  }

  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    'extra-large': 'text-xl'
  };

  const contrastClasses = {
    normal: '',
    high: 'contrast-high'
  };

  return (
    <div className={`p-6 ${fontSizeClasses[fontSize]} ${contrastClasses[contrast]}`}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-4xl font-bold mb-4">Accessibility Module</h1>
        <p className="text-xl mb-6 opacity-90">
          Experience a more inclusive digital world with our AI-powered accessibility tools.
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

      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">AI Accessibility Companion</h1>
        {isOfflineMode && (
          <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-3 rounded-md mb-4">
            Offline Mode: Basic transcription available. GPT-5 features disabled.
          </div>
        )}
      </header>

      <Tabs defaultValue="transcription" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="transcription">Live Transcription</TabsTrigger>
          <TabsTrigger value="sign-language" disabled className="opacity-50 cursor-not-allowed">Sign Language (Coming Soon)</TabsTrigger>
          <TabsTrigger value="history" disabled className="opacity-50 cursor-not-allowed">Conversation History (Coming Soon)</TabsTrigger>
          <TabsTrigger value="settings" disabled className="opacity-50 cursor-not-allowed">Settings (Coming Soon)</TabsTrigger>
        </TabsList>

        <TabsContent value="transcription" className="space-y-4">
          <TranscriptionPanel 
            isOfflineMode={isOfflineMode}
            fontSize={fontSize}
          />
        </TabsContent>

        <TabsContent value="sign-language" className="space-y-4">
          <SignLanguagePanel 
            isOfflineMode={isOfflineMode}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <ConversationHistory 
            isOfflineMode={isOfflineMode}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <SettingsPanel
            theme={theme || 'light'}
            setTheme={setTheme}
            fontSize={fontSize}
            setFontSize={setFontSize}
            contrast={contrast}
            setContrast={setContrast}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
