'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TranscriptionPanel from '@/components/accessibility/transcription-panel';
import SignLanguagePanel from '@/components/accessibility/sign-language-panel';
import SettingsPanel from '@/components/accessibility/settings-panel';
import ConversationHistory from '@/components/accessibility/conversation-history';

type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
type Contrast = 'normal' | 'high';

export default function AccessibilityPage() {
  const [mounted, setMounted] = useState(false);
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
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  if (!mounted) return null;

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
    <div className={`min-h-screen p-4 ${fontSizeClasses[fontSize]} ${contrastClasses[contrast]}`}>
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
          <TabsTrigger value="sign-language">Sign Language</TabsTrigger>
          <TabsTrigger value="history">Conversation History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
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