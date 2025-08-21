import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Redis } from '@upstash/redis';
import { Resend } from 'resend';
import twilio from 'twilio';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { NotificationType } from '@prisma/client';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const resend = new Resend(process.env.RESEND_API_KEY);

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const taskId = url.searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    const reminders = await prisma.reminder.findMany({
      where: {
        taskId,
        task: { userId: session.user.id },
      },
      include: { task: true },
    });

    return NextResponse.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { taskId, reminders } = data;

    // Verify task ownership
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== session.user.id) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Create reminders
    const createdReminders = await Promise.all(
      reminders.map((reminder: any) =>
        prisma.reminder.create({
          data: {
            taskId,
            notifyOffsetMinutes: reminder.offsetMinutes,
            notifyType: reminder.type as NotificationType,
            scheduledAt: new Date(task.originDatetime.getTime() - reminder.offsetMinutes * 60000),
          },
        })
      )
    );

    // Add reminders to notification queue
    await Promise.all(
      createdReminders.map((reminder) =>
        redis.lpush('notification:queue', JSON.stringify(reminder))
      )
    );

    return NextResponse.json(createdReminders);
  } catch (error) {
    console.error('Error creating reminders:', error);
    return NextResponse.json(
      { error: 'Failed to create reminders' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const reminderId = url.pathname.split('/').pop();

    if (!reminderId) {
      return NextResponse.json({ error: 'Reminder ID required' }, { status: 400 });
    }

    // Verify reminder ownership
    const reminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
      include: { task: true },
    });

    if (!reminder || reminder.task.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Delete reminder
    await prisma.reminder.delete({
      where: { id: reminderId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    );
  }
}

async function sendEmailNotification(reminder: any) {
  const { task } = reminder;
  await resend.emails.send({
    from: 'notifications@rytetime.app',
    to: task.user.email,
    subject: `Task Reminder: ${task.title}`,
    html: `
      <h2>Task Reminder</h2>
      <p>Your task "${task.title}" is due ${reminder.notifyOffsetMinutes} minutes from now.</p>
      <p><strong>Description:</strong> ${task.description || 'No description'}</p>
      <p><strong>Due:</strong> ${task.originDatetime.toLocaleString()}</p>
    `,
  });
}

async function sendSMSNotification(reminder: any) {
  const { task } = reminder;
  await twilioClient.messages.create({
    body: `Reminder: Your task "${task.title}" is due ${reminder.notifyOffsetMinutes} minutes from now.`,
    to: task.user.phone, // Assuming user has a phone field
    from: process.env.TWILIO_PHONE_NUMBER,
  });
}

async function sendPushNotification(reminder: any) {
  // Implement Web Push notification using the Web Push API
  // This would require setting up a service worker and managing push subscriptions
  // TODO: Implement push notifications
}

export async function processNotification(reminder: any) {
  switch (reminder.notifyType) {
    case NotificationType.EMAIL:
      await sendEmailNotification(reminder);
      break;
    case NotificationType.SMS:
      await sendSMSNotification(reminder);
      break;
    case NotificationType.PUSH:
      await sendPushNotification(reminder);
      break;
    default:
      throw new Error(`Unknown notification type: ${reminder.notifyType}`);
  }

  // Mark reminder as sent
  await prisma.reminder.update({
    where: { id: reminder.id },
    data: { sent: true },
  });
}