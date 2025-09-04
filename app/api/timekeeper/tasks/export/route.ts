import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import {
  exportToMarkdown,
  exportToCSV,
  exportToDOCX,
  exportToPDF,
  emailTasksExport,
} from '@/lib/task-export';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const format = url.searchParams.get('format') as 'markdown' | 'csv' | 'docx' | 'pdf';
    const email = url.searchParams.get('email');

    if (!format) {
      return NextResponse.json({ error: 'Format is required' }, { status: 400 });
    }

    // Get user's tasks
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { originDatetime: 'asc' },
    });

    // If email is provided, send export as email
    if (email) {
      await emailTasksExport(tasks, email, format);
      return NextResponse.json({ message: 'Export sent to email' });
    }

    // Otherwise, return the export directly
    let content: string | Buffer;
    let filename: string;
    let contentType: string;

    switch (format) {
      case 'markdown':
        content = exportToMarkdown(tasks);
        filename = 'tasks.md';
        contentType = 'text/markdown';
        break;

      case 'csv':
        content = exportToCSV(tasks);
        filename = 'tasks.csv';
        contentType = 'text/csv';
        break;

      case 'docx':
        content = await exportToDOCX(tasks);
        filename = 'tasks.docx';
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;

      case 'pdf':
        content = exportToPDF(tasks);
        filename = 'tasks.pdf';
        contentType = 'application/pdf';
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid format specified' },
          { status: 400 }
        );
    }

    // Set response headers for file download
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set(
      'Content-Disposition',
      `attachment; filename=${encodeURIComponent(filename)}`
    );

    return new NextResponse(content, { headers });
  } catch (error) {
    console.error('Error exporting tasks:', error);
    return NextResponse.json(
      { error: 'Failed to export tasks' },
      { status: 500 }
    );
  }
}