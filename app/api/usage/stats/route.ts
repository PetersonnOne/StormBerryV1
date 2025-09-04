import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { usageStatsService } from '@/lib/db/usage-stats';

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = await usageStatsService.getUserMetrics(userId)
    const recentInteractions = await usageStatsService.getRecentInteractions(userId)
    
    const metrics = {
      totalTokens: stats.totalTokens,
      totalCost: stats.totalCost,
      totalInteractions: stats.totalInteractions,
      monthlyLimit: 10000,
      remainingTokens: Math.max(0, 10000 - stats.totalTokens)
    }

    return NextResponse.json({
      metrics,
      recentInteractions
    })
  } catch (error) {
    console.error('Error fetching usage stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage stats' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usageData = await request.json();
    
    await usageStatsService.recordUsage({
      user_id: userId,
      model_used: usageData.model,
      tokens_used: usageData.tokensUsed,
      cost: usageData.cost,
      interaction_type: usageData.interactionType,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording usage:', error);
    return NextResponse.json(
      { error: 'Failed to record usage' },
      { status: 500 }
    );
  }
}
