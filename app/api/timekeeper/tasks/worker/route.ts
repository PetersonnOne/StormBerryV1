import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { prisma } from '@/lib/prisma';
import { processNotification } from '../reminders/route';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const BATCH_SIZE = 10;
const PROCESSING_INTERVAL = 60 * 1000; // 1 minute

export async function GET() {
  return NextResponse.json({ status: 'Worker endpoint is active' });
}

export async function POST() {
  try {
    // Get pending reminders from Redis queue
    const reminders = await redis.lrange('notification:queue', 0, BATCH_SIZE - 1);

    if (!reminders.length) {
      return NextResponse.json({ status: 'No pending notifications' });
    }

    const now = new Date();
    const processedReminders = [];

    for (const reminderJson of reminders) {
      const reminder = JSON.parse(reminderJson);

      // Load full reminder data with task and user information
      const fullReminder = await prisma.reminder.findUnique({
        where: { id: reminder.id },
        include: {
          task: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!fullReminder || fullReminder.sent) {
        // Remove from queue if reminder doesn't exist or was already sent
        await redis.lrem('notification:queue', 1, reminderJson);
        continue;
      }

      // Check if it's time to send the notification
      if (fullReminder.scheduledAt <= now) {
        try {
          await processNotification(fullReminder);
          processedReminders.push(fullReminder.id);
          // Remove from queue after successful processing
          await redis.lrem('notification:queue', 1, reminderJson);
        } catch (error) {
          console.error(`Error processing reminder ${fullReminder.id}:`, error);
          // Leave in queue to retry later
        }
      }
    }

    return NextResponse.json({
      status: 'Success',
      processed: processedReminders.length,
      reminders: processedReminders,
    });
  } catch (error) {
    console.error('Worker error:', error);
    return NextResponse.json(
      { error: 'Failed to process notifications' },
      { status: 500 }
    );
  }
}

// Function to schedule recurring processing
export async function scheduleProcessing() {
  setInterval(async () => {
    try {
      const response = await fetch('/api/timekeeper/tasks/worker', {
        method: 'POST',
      });
      const result = await response.json();
      console.log('Worker processing result:', result);
    } catch (error) {
      console.error('Error in scheduled processing:', error);
    }
  }, PROCESSING_INTERVAL);
}

// Initialize scheduled processing if running in a worker environment
if (typeof window === 'undefined' && process.env.ENABLE_NOTIFICATION_WORKER === 'true') {
  scheduleProcessing().catch(console.error);
}