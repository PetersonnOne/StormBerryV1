import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { textsService } from '@/lib/db/texts';

export async function POST(request: Request) {
  try {
    const { userId, getToken } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workflow = await request.json();
    
    // Validate workflow data
    if (!workflow.id || !workflow.name || !Array.isArray(workflow.steps)) {
      return NextResponse.json(
        { error: 'Invalid workflow data' },
        { status: 400 }
      );
    }

    const token = await getToken({ template: 'supabase' });

    // Store workflow in Supabase
    const workflowData = {
      content: JSON.stringify({
        workflow,
        metadata: {
          type: 'workflow',
          workflowId: workflow.id,
          name: workflow.name,
          stepCount: workflow.steps.length,
          lastModified: new Date().toISOString(),
        }
      })
    };

    const result = await textsService.create(userId, workflowData, token || undefined);

    return NextResponse.json({ 
      success: true,
      id: result.id 
    });
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
    const { userId, getToken } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = await getToken({ template: 'supabase' });
    const allTexts = await textsService.getAll(userId, token || undefined);
    
    const workflows = allTexts
      .filter(text => {
        try {
          const content = JSON.parse(text.content);
          return content.metadata?.type === 'workflow';
        } catch {
          return false;
        }
      })
      .map(text => {
        const content = JSON.parse(text.content);
        return content.workflow;
      });

    return NextResponse.json(workflows);
  } catch (error) {
    console.error('Workflow fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}