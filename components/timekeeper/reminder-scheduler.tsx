'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Reminder {
  id: string;
  datetime: string;
  message: string;
  timezone: string;
  notifications: {
    email: boolean;
    sms: boolean;
    googleCalendar: boolean;
    outlookCalendar: boolean;
  };
}

export function ReminderScheduler() {
  const [datetime, setDatetime] = useState('');
  const [message, setMessage] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const addToGoogleCalendar = async (reminder: Reminder) => {
    // TODO: Implement Google Calendar API integration
    try {
      // Add event to Google Calendar
      console.log('Adding to Google Calendar:', reminder);
    } catch (error) {
      console.error('Error adding to Google Calendar:', error);
    }
  };

  const addToOutlookCalendar = async (reminder: Reminder) => {
    // TODO: Implement Microsoft Graph API integration
    try {
      // Add event to Outlook Calendar
      console.log('Adding to Outlook Calendar:', reminder);
    } catch (error) {
      console.error('Error adding to Outlook Calendar:', error);
    }
  };

  const scheduleEmailAlert = async (reminder: Reminder) => {
    // TODO: Implement Resend API integration
    try {
      // Schedule email notification
      console.log('Scheduling email alert:', reminder);
    } catch (error) {
      console.error('Error scheduling email alert:', error);
    }
  };

  const scheduleSMSAlert = async (reminder: Reminder) => {
    // TODO: Implement Twilio API integration
    try {
      // Schedule SMS notification
      console.log('Scheduling SMS alert:', reminder);
    } catch (error) {
      console.error('Error scheduling SMS alert:', error);
    }
  };

  const handleCreateReminder = () => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      datetime,
      message,
      timezone: selectedZone,
      notifications: {
        email: false,
        sms: false,
        googleCalendar: false,
        outlookCalendar: false
      }
    };

    setReminders([...reminders, newReminder]);
    setDatetime('');
    setMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="datetime">Date & Time</Label>
            <Input
              id="datetime"
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="timezone">Time Zone</Label>
            <Input
              id="timezone"
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              placeholder="Select timezone"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="message">Reminder Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your reminder message"
            className="h-24"
          />
        </div>

        <Button
          onClick={handleCreateReminder}
          disabled={!datetime || !message || !selectedZone}
        >
          Create Reminder
        </Button>
      </div>

      <ScrollArea className="h-[400px] rounded-md border p-4">
        {reminders.map((reminder) => (
          <Card key={reminder.id} className="p-4 mb-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{new Date(reminder.datetime).toLocaleString()}</h3>
                <p className="text-sm text-gray-500">{reminder.timezone}</p>
                <p className="mt-2">{reminder.message}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addToGoogleCalendar(reminder)}
                  disabled={reminder.notifications.googleCalendar}
                >
                  Add to Google Calendar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addToOutlookCalendar(reminder)}
                  disabled={reminder.notifications.outlookCalendar}
                >
                  Add to Outlook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => scheduleEmailAlert(reminder)}
                  disabled={reminder.notifications.email}
                >
                  Schedule Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => scheduleSMSAlert(reminder)}
                  disabled={reminder.notifications.sms}
                >
                  Schedule SMS
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </ScrollArea>
    </div>
  );
}