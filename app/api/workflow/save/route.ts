import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';

export async function POST(request: Request) {
  try {
    const workflow = await request.json();
    
    // Validate workflow data
    if (!workflow.id || !workflow.name || !Array.isArray(workflow.steps)) {
      return NextResponse.json(
        { error: 'Invalid workflow data' },
        { status: 400 }
      );
    }

    // Store workflow in Netlify Blobs
    const store = getStore({ name: 'Workflows' });
    await store.set(workflow.id, JSON.stringify(workflow));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Workflow save error:', error);
    return NextResponse.json(
      { error: 'Failed to save workflow' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const store = getStore({ name: 'Workflows' });
    const keys = await store.list();
    
    const workflows = await Promise.all(
      keys.map(async (key) => {
        const data = await store.get(key);
        return data ? JSON.parse(data as string) : null;
      })
    );

    return NextResponse.json(
      workflows.filter(Boolean)
    );
  } catch (error) {
    console.error('Workflow fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}