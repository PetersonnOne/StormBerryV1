import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
});

interface NotificationJob {
  reminderId: string;
  type: 'email' | 'sms';
  scheduledTime: string;
  recipient: string;
  message: string;
}

async function processEmailNotification(job: NotificationJob) {
  // TODO: Implement Resend email sending
  try {
    const response = await fetch('https://api.resend.com/v1/email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'notifications@rytetime.com',
        to: job.recipient,
        subject: 'Storm Berry Reminder',
        html: `<h1>Storm Berry Reminder</h1><p>${job.message}</p>`
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return true;
  } catch (error) {
    console.error('Email notification failed:', error);
    return false;
  }
}

async function processSMSNotification(job: NotificationJob) {
  // TODO: Implement Twilio SMS sending
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: fromNumber!,
        To: job.recipient,
        Body: job.message
      }).toString()
    });

    if (!response.ok) {
      throw new Error('Failed to send SMS');
    }

    return true;
  } catch (error) {
    console.error('SMS notification failed:', error);
    return false;
  }
}

async function processNotificationQueue() {
  try {
    // Get all pending notifications
    const jobs = await redis.lrange('notification:queue', 0, -1);
    if (!jobs || jobs.length === 0) return;

    const now = new Date();
    const processedJobs: string[] = [];

    for (const jobStr of jobs) {
      const job: NotificationJob = JSON.parse(jobStr);
      const scheduledTime = new Date(job.scheduledTime);

      // Process if scheduled time has passed
      if (scheduledTime <= now) {
        let success = false;

        if (job.type === 'email') {
          success = await processEmailNotification(job);
        } else if (job.type === 'sms') {
          success = await processSMSNotification(job);
        }

        if (success) {
          processedJobs.push(jobStr);
        }
      }
    }

    // Remove processed jobs from queue
    for (const job of processedJobs) {
      await redis.lrem('notification:queue', 1, job);
    }

    return {
      processed: processedJobs.length,
      remaining: jobs.length - processedJobs.length
    };
  } catch (error) {
    console.error('Error processing notification queue:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const result = await processNotificationQueue();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process notification queue' },
      { status: 500 }
    );
  }
}