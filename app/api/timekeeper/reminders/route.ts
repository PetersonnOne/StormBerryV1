import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
});

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

interface NotificationJob {
  reminderId: string;
  type: 'email' | 'sms';
  scheduledTime: string;
  recipient: string;
  message: string;
}

async function scheduleEmailNotification(reminder: Reminder, recipient: string) {
  // TODO: Implement Resend API integration
  try {
    const job: NotificationJob = {
      reminderId: reminder.id,
      type: 'email',
      scheduledTime: reminder.datetime,
      recipient,
      message: reminder.message
    };

    await redis.lpush('notification:queue', JSON.stringify(job));
    return true;
  } catch (error) {
    console.error('Failed to schedule email notification:', error);
    return false;
  }
}

async function scheduleSMSNotification(reminder: Reminder, phoneNumber: string) {
  // TODO: Implement Twilio API integration
  try {
    const job: NotificationJob = {
      reminderId: reminder.id,
      type: 'sms',
      scheduledTime: reminder.datetime,
      recipient: phoneNumber,
      message: reminder.message
    };

    await redis.lpush('notification:queue', JSON.stringify(job));
    return true;
  } catch (error) {
    console.error('Failed to schedule SMS notification:', error);
    return false;
  }
}

async function addToGoogleCalendar(reminder: Reminder) {
  // TODO: Implement Google Calendar API integration
  try {
    // Add event to Google Calendar
    return true;
  } catch (error) {
    console.error('Failed to add to Google Calendar:', error);
    return false;
  }
}

async function addToOutlookCalendar(reminder: Reminder) {
  // TODO: Implement Microsoft Graph API integration
  try {
    // Add event to Outlook Calendar
    return true;
  } catch (error) {
    console.error('Failed to add to Outlook Calendar:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reminder, notifications } = body;

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder data is required' }, { status: 400 });
    }

    // Store reminder
    await redis.set(`reminder:${reminder.id}`, JSON.stringify(reminder));

    // Process notifications
    const results = {
      email: false,
      sms: false,
      googleCalendar: false,
      outlookCalendar: false
    };

    if (notifications.email) {
      results.email = await scheduleEmailNotification(reminder, notifications.emailAddress);
    }

    if (notifications.sms) {
      results.sms = await scheduleSMSNotification(reminder, notifications.phoneNumber);
    }

    if (notifications.googleCalendar) {
      results.googleCalendar = await addToGoogleCalendar(reminder);
    }

    if (notifications.outlookCalendar) {
      results.outlookCalendar = await addToOutlookCalendar(reminder);
    }

    return NextResponse.json({
      success: true,
      reminderId: reminder.id,
      notificationResults: results
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process reminder' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch user's reminders
    const reminders = await redis.get(`user:${userId}:reminders`);

    return NextResponse.json(reminders || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reminderId = searchParams.get('id');

    if (!reminderId) {
      return NextResponse.json({ error: 'Reminder ID is required' }, { status: 400 });
    }

    // Delete reminder and associated notifications
    await redis.del(`reminder:${reminderId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete reminder' }, { status: 500 });
  }
}