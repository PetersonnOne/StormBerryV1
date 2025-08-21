'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ZoneCardCreator } from '@/components/timekeeper/zone-card-creator';
import { TimeConverter } from '@/components/timekeeper/time-converter';
import { ReminderScheduler } from '@/components/timekeeper/reminder-scheduler';
import { SettingsPanel } from '@/components/timekeeper/settings-panel';

export default function TimeKeeper() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Time Keeper</h1>
        <p className="text-sm text-gray-500">
          Manage time zones, convert times, and schedule reminders
        </p>
      </div>
      
      <Tabs defaultValue="zones" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="zones">Zone Cards</TabsTrigger>
          <TabsTrigger value="converter">Time Converter</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="zones" className="space-y-4">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-2xl font-semibold mb-4">Time Zone Cards</h2>
            <p className="text-gray-500 mb-6">
              Create and manage your frequently used time zones with live time updates
            </p>
            <ZoneCardCreator />
          </div>
        </TabsContent>

        <TabsContent value="converter" className="space-y-4">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-2xl font-semibold mb-4">Time Converter</h2>
            <p className="text-gray-500 mb-6">
              Convert times between multiple time zones instantly
            </p>
            <TimeConverter />
          </div>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-2xl font-semibold mb-4">Reminders</h2>
            <p className="text-gray-500 mb-6">
              Schedule reminders and get notifications across different time zones
            </p>
            <ReminderScheduler />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-2xl font-semibold mb-4">Settings</h2>
            <p className="text-gray-500 mb-6">
              Configure your calendar connections and notification preferences
            </p>
            <SettingsPanel />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}