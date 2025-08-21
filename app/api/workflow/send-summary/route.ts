import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const summaryData = await request.json();
    const { summary, keyPoints, actionItems, participants } = summaryData;

    const emailHtml = `
      <h2>Meeting Summary</h2>
      <p>${summary}</p>

      <h3>Key Points</h3>
      <ul>
        ${keyPoints.map(point => `<li>${point}</li>`).join('')}
      </ul>

      <h3>Action Items</h3>
      <ul>
        ${actionItems.map(item => `<li>${item}</li>`).join('')}
      </ul>

      <h3>Participants</h3>
      <p>${participants.join(', ')}</p>
    `;

    await resend.emails.send({
      from: 'workflow@stormberry.com',
      to: process.env.ADMIN_EMAIL || '',
      subject: 'Meeting Summary',
      html: emailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send summary email' },
      { status: 500 }
    );
  }
}