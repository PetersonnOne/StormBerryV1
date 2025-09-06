'use client';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';

interface SettingsPanelProps {
  theme: string;
  setTheme: (theme: string) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  contrast: string;
  setContrast: (contrast: string) => void;
}

export function SettingsPanel({
  theme,
  setTheme,
  fontSize,
  setFontSize,
  contrast,
  setContrast,
}: SettingsPanelProps) {
  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Display Settings</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <RadioGroup
              value={theme}
              onValueChange={setTheme}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="theme-light" />
                <Label htmlFor="theme-light">Light</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="theme-dark" />
                <Label htmlFor="theme-dark">Dark</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="theme-system" />
                <Label htmlFor="theme-system">System</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Font Size</Label>
            <RadioGroup
              value={fontSize}
              onValueChange={setFontSize}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="font-small" />
                <Label htmlFor="font-small" className="text-sm">Small</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="font-medium" />
                <Label htmlFor="font-medium" className="text-base">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="font-large" />
                <Label htmlFor="font-large" className="text-lg">Large</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="extra-large" id="font-xl" />
                <Label htmlFor="font-xl" className="text-xl">Extra Large</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Contrast</Label>
            <RadioGroup
              value={contrast}
              onValueChange={setContrast}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="contrast-normal" />
                <Label htmlFor="contrast-normal">Normal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="contrast-high" />
                <Label htmlFor="contrast-high">High Contrast</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Transcription Settings</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-save Transcripts</Label>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Automatically save transcripts when stopping recording
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-summarize</Label>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Generate summaries after saving transcripts
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Word Timing</Label>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Display timestamps for each word in transcripts
              </div>
            </div>
            <Switch />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Sign Language Settings</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-translate to Signs</Label>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Automatically convert speech to sign language
              </div>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Text with Signs</Label>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Display text captions with sign language animations
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Avatar Speed</Label>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Adjust the speed of sign language animations
              </div>
            </div>
            <div className="w-[120px]">
              <select className="w-full p-2 border rounded-md">
                <option value="0.75">Slower</option>
                <option value="1.0">Normal</option>
                <option value="1.25">Faster</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export { SettingsPanel as default };