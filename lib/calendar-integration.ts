import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';
import { prisma } from './prisma';
import type { Task } from '@prisma/client';

// Google Calendar Integration
const googleAuth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
);

const calendar = google.calendar({ version: 'v3', auth: googleAuth });

export async function syncTaskToGoogleCalendar(task: Task, accessToken: string) {
  try {
    googleAuth.setCredentials({ access_token: accessToken });

    // Check if event already exists
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: {
        taskId: task.id,
        provider: 'google',
      },
    });

    const eventData = {
      summary: task.title,
      description: task.description,
      start: {
        dateTime: task.originDatetime.toISOString(),
        timeZone: task.originTimezone,
      },
      end: {
        dateTime: new Date(task.originDatetime.getTime() + 60 * 60 * 1000).toISOString(),
        timeZone: task.originTimezone,
      },
    };

    if (existingEvent) {
      // Update existing event
      const updatedEvent = await calendar.events.update({
        calendarId: 'primary',
        eventId: existingEvent.externalEventId,
        requestBody: eventData,
      });

      return updatedEvent.data;
    } else {
      // Create new event
      const newEvent = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: eventData,
      });

      // Store the event mapping
      await prisma.calendarEvent.create({
        data: {
          taskId: task.id,
          provider: 'google',
          externalEventId: newEvent.data.id!,
        },
      });

      return newEvent.data;
    }
  } catch (error) {
    console.error('Error syncing with Google Calendar:', error);
    throw error;
  }
}

// Microsoft Calendar Integration
export async function syncTaskToMicrosoftCalendar(task: Task, accessToken: string) {
  try {
    const client = Client.init({
      authProvider: (done) => done(null, accessToken),
    });

    // Check if event already exists
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: {
        taskId: task.id,
        provider: 'microsoft',
      },
    });

    const eventData = {
      subject: task.title,
      body: {
        contentType: 'text',
        content: task.description || '',
      },
      start: {
        dateTime: task.originDatetime.toISOString(),
        timeZone: task.originTimezone,
      },
      end: {
        dateTime: new Date(task.originDatetime.getTime() + 60 * 60 * 1000).toISOString(),
        timeZone: task.originTimezone,
      },
    };

    if (existingEvent) {
      // Update existing event
      await client
        .api(`/me/events/${existingEvent.externalEventId}`)
        .update(eventData);

      return existingEvent.externalEventId;
    } else {
      // Create new event
      const newEvent = await client
        .api('/me/events')
        .post(eventData);

      // Store the event mapping
      await prisma.calendarEvent.create({
        data: {
          taskId: task.id,
          provider: 'microsoft',
          externalEventId: newEvent.id,
        },
      });

      return newEvent.id;
    }
  } catch (error) {
    console.error('Error syncing with Microsoft Calendar:', error);
    throw error;
  }
}

// Function to sync task with all connected calendars
export async function syncTaskWithCalendars(task: Task) {
  try {
    // Get user's calendar connections
    const accounts = await prisma.account.findMany({
      where: {
        userId: task.userId,
        provider: { in: ['google', 'azure-ad'] },
      },
    });

    for (const account of accounts) {
      if (account.provider === 'google' && account.access_token) {
        await syncTaskToGoogleCalendar(task, account.access_token);
      } else if (account.provider === 'azure-ad' && account.access_token) {
        await syncTaskToMicrosoftCalendar(task, account.access_token);
      }
    }
  } catch (error) {
    console.error('Error syncing task with calendars:', error);
    throw error;
  }
}

// Function to delete task from connected calendars
export async function deleteTaskFromCalendars(task: Task) {
  try {
    const calendarEvents = await prisma.calendarEvent.findMany({
      where: { taskId: task.id },
    });

    const accounts = await prisma.account.findMany({
      where: {
        userId: task.userId,
        provider: { in: ['google', 'azure-ad'] },
      },
    });

    for (const event of calendarEvents) {
      const account = accounts.find(a =>
        (a.provider === 'google' && event.provider === 'google') ||
        (a.provider === 'azure-ad' && event.provider === 'microsoft')
      );

      if (!account?.access_token) continue;

      if (event.provider === 'google') {
        googleAuth.setCredentials({ access_token: account.access_token });
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: event.externalEventId,
        });
      } else if (event.provider === 'microsoft') {
        const client = Client.init({
          authProvider: (done) => done(null, account.access_token),
        });
        await client
          .api(`/me/events/${event.externalEventId}`)
          .delete();
      }
    }

    // Delete all calendar event mappings
    await prisma.calendarEvent.deleteMany({
      where: { taskId: task.id },
    });
  } catch (error) {
    console.error('Error deleting task from calendars:', error);
    throw error;
  }
}