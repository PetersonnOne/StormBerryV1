import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Redis } from '@upstash/redis';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Task, NotificationType } from '@prisma/client';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const CACHE_TTL = 60 * 5; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to get tasks from cache
    const cacheKey = `tasks:${session.user.id}`;
    const cachedTasks = await redis.get<Task[]>(cacheKey);

    if (cachedTasks) {
      return NextResponse.json(cachedTasks);
    }

    // If not in cache, fetch from database
    const tasks = await prisma.task.findMany({
      where: { userId: session.user.id },
      include: { reminders: true },
      orderBy: { originDatetime: 'asc' },
    });

    // Cache the results
    await redis.set(cacheKey, tasks, { ex: CACHE_TTL });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
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
    const task = await prisma.task.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    });

    // Schedule reminders if provided
    if (data.reminders) {
      const reminders = await Promise.all(
        data.reminders.map((reminder: any) =>
          prisma.reminder.create({
            data: {
              taskId: task.id,
              notifyOffsetMinutes: reminder.offsetMinutes,
              notifyType: reminder.type as NotificationType,
              scheduledAt: new Date(task.originDatetime.getTime() - reminder.offsetMinutes * 60000),
            },
          })
        )
      );

      // Add reminders to notification queue
      await Promise.all(
        reminders.map((reminder) =>
          redis.lpush('notification:queue', JSON.stringify(reminder))
        )
      );
    }

    // Invalidate cache
    await redis.del(`tasks:${session.user.id}`);

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const taskId = data.id;

    // Verify task ownership
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: { reminders: true },
    });

    if (!existingTask || existingTask.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Update task
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description,
        originTimezone: data.originTimezone,
        originDatetime: data.originDatetime,
        localTimezone: data.localTimezone,
        localDatetime: data.localDatetime,
        priority: data.priority,
        tags: data.tags,
        recurrenceRule: data.recurrenceRule,
      },
    });

    // Update reminders if provided
    if (data.reminders) {
      // Delete existing reminders
      await prisma.reminder.deleteMany({
        where: { taskId },
      });

      // Create new reminders
      const reminders = await Promise.all(
        data.reminders.map((reminder: any) =>
          prisma.reminder.create({
            data: {
              taskId: task.id,
              notifyOffsetMinutes: reminder.offsetMinutes,
              notifyType: reminder.type as NotificationType,
              scheduledAt: new Date(task.originDatetime.getTime() - reminder.offsetMinutes * 60000),
            },
          })
        )
      );

      // Update notification queue
      await Promise.all(
        reminders.map((reminder) =>
          redis.lpush('notification:queue', JSON.stringify(reminder))
        )
      );
    }

    // Invalidate cache
    await redis.del(`tasks:${session.user.id}`);

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
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
    const taskId = url.pathname.split('/').pop();

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    // Verify task ownership
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Delete task (this will cascade delete reminders)
    await prisma.task.delete({
      where: { id: taskId },
    });

    // Invalidate cache
    await redis.del(`tasks:${session.user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}