import { Task } from '@prisma/client';
import { format } from 'date-fns';
import { Resend } from 'resend';
import { createReport } from 'docx-templates';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const resend = new Resend(process.env.RESEND_API_KEY);

// Export to Markdown
export function exportToMarkdown(tasks: Task[]): string {
  let markdown = '# Tasks Export\n\n';

  tasks.forEach((task) => {
    markdown += `## ${task.title}\n\n`;
    markdown += `**Priority:** ${task.priority}\n\n`;
    if (task.description) {
      markdown += `**Description:** ${task.description}\n\n`;
    }
    markdown += `**Due Date:** ${format(task.originDatetime, 'PPpp')} (${task.originTimezone})\n\n`;
    markdown += `**Local Time:** ${format(task.localDatetime, 'PPpp')} (${task.localTimezone})\n\n`;
    if (task.tags) {
      markdown += `**Tags:** ${JSON.stringify(task.tags)}\n\n`;
    }
    if (task.recurrenceRule) {
      markdown += `**Recurrence:** ${task.recurrenceRule}\n\n`;
    }
    markdown += '---\n\n';
  });

  return markdown;
}

// Export to CSV
export function exportToCSV(tasks: Task[]): string {
  const headers = [
    'Title',
    'Description',
    'Priority',
    'Origin DateTime',
    'Origin Timezone',
    'Local DateTime',
    'Local Timezone',
    'Tags',
    'Recurrence Rule',
  ].join(',');

  const rows = tasks.map((task) => [
    `"${task.title.replace(/"/g, '""')}"`,
    `"${(task.description || '').replace(/"/g, '""')}"`,
    task.priority,
    format(task.originDatetime, 'yyyy-MM-dd HH:mm:ss'),
    task.originTimezone,
    format(task.localDatetime, 'yyyy-MM-dd HH:mm:ss'),
    task.localTimezone,
    `"${JSON.stringify(task.tags || []).replace(/"/g, '""')}"`,
    `"${(task.recurrenceRule || '').replace(/"/g, '""')}"`,
  ].join(','));

  return [headers, ...rows].join('\n');
}

// Export to DOCX
export async function exportToDOCX(tasks: Task[]): Promise<Buffer> {
  const template = `
    {#tasks}
    {title}
    Priority: {priority}
    Description: {description}
    Due Date: {originDateTime} ({originTimezone})
    Local Time: {localDateTime} ({localTimezone})
    Tags: {tags}
    Recurrence: {recurrenceRule}
    
    {/tasks}
  `;

  const data = {
    tasks: tasks.map((task) => ({
      title: task.title,
      priority: task.priority,
      description: task.description || '',
      originDateTime: format(task.originDatetime, 'PPpp'),
      originTimezone: task.originTimezone,
      localDateTime: format(task.localDatetime, 'PPpp'),
      localTimezone: task.localTimezone,
      tags: JSON.stringify(task.tags || []),
      recurrenceRule: task.recurrenceRule || '',
    })),
  };

  const buffer = await createReport({
    template: Buffer.from(template),
    data,
  });

  return buffer;
}

// Export to PDF
export function exportToPDF(tasks: Task[]): Buffer {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Tasks Export', 14, 15);

  const tableData = tasks.map((task) => [
    task.title,
    task.priority,
    format(task.originDatetime, 'PPpp'),
    task.originTimezone,
    task.description || '',
  ]);

  (doc as any).autoTable({
    startY: 25,
    head: [['Title', 'Priority', 'Due Date', 'Timezone', 'Description']],
    body: tableData,
    headStyles: { fillColor: [66, 139, 202] },
    styles: { overflow: 'linebreak' },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 20 },
      2: { cellWidth: 50 },
      3: { cellWidth: 30 },
      4: { cellWidth: 50 },
    },
  });

  return Buffer.from(doc.output('arraybuffer'));
}

// Email export
export async function emailTasksExport(
  tasks: Task[],
  email: string,
  format: 'markdown' | 'csv' | 'docx' | 'pdf'
): Promise<void> {
  let attachment;
  let filename;

  switch (format) {
    case 'markdown':
      attachment = Buffer.from(exportToMarkdown(tasks));
      filename = 'tasks.md';
      break;
    case 'csv':
      attachment = Buffer.from(exportToCSV(tasks));
      filename = 'tasks.csv';
      break;
    case 'docx':
      attachment = await exportToDOCX(tasks);
      filename = 'tasks.docx';
      break;
    case 'pdf':
      attachment = exportToPDF(tasks);
      filename = 'tasks.pdf';
      break;
  }

  await resend.emails.send({
    from: 'exports@rytetime.app',
    to: email,
    subject: 'Your Tasks Export',
    html: `
      <h2>Tasks Export</h2>
      <p>Please find your requested tasks export attached in ${format.toUpperCase()} format.</p>
      <p>This export was generated on ${format(new Date(), 'PPpp')}.</p>
    `,
    attachments: [{
      filename,
      content: attachment.toString('base64'),
    }],
  });
}