import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use anon key for server-side operations (in production, use service role key)
const supabase = createClient(supabaseUrl, supabaseKey);

export interface UsageStats {
  id?: string;
  user_id: string;
  model_used: string;
  tokens_used: number;
  cost: number;
  interaction_type: string;
  created_at?: string;
}

export interface UserMetrics {
  totalTokens: number;
  totalCost: number;
  totalInteractions: number;
  monthlyLimit: number;
  remainingTokens: number;
}

interface UsageData {
  tokensUsed: number;
  cost: number;
  model: string;
  interactionType: string;
  prompt: string;
  responseTime: number;
  status: string;
}

class UsageStatsService {
  async recordUsage(userId: string, data: UsageData): Promise<void> {
    try {
      // Temporarily disable usage recording due to RLS policy issues
      // TODO: Fix Supabase RLS policies or implement service role key
      console.log('Usage recording disabled - would record:', {
        user_id: userId,
        tokens_used: data.tokensUsed,
        cost: data.cost,
        model: data.model,
        interaction_type: data.interactionType
      });
      return;
      
      const { error } = await supabase
        .from('usage_stats')
        .insert({
          user_id: userId,
          tokens_used: data.tokensUsed,
          cost: data.cost,
          model: data.model,
          interaction_type: data.interactionType,
          prompt: data.prompt,
          response_time: data.responseTime,
          status: data.status,
          created_at: new Date().toISOString(),
        });

      if (error) {
        throw new Error(`Failed to record usage: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to record usage:', error);
      // Don't throw error to prevent blocking AI operations
      return;
    }
  }

  async getUserMetrics(userId: string): Promise<UserMetrics> {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('usage_stats')
        .select('tokens_used, cost')
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString());

      if (error) throw error;

      const totalTokens = data?.reduce((sum, record) => sum + record.tokens_used, 0) || 0;
      const totalCost = data?.reduce((sum, record) => sum + record.cost, 0) || 0;
      const totalInteractions = data?.length || 0;
      
      // Default monthly limit (can be made configurable per user)
      const monthlyLimit = 10000;
      const remainingTokens = Math.max(0, monthlyLimit - totalTokens);

      return {
        totalTokens,
        totalCost,
        totalInteractions,
        monthlyLimit,
        remainingTokens,
      };
    } catch (error) {
      console.error('Failed to get user metrics:', error);
      // Return default values on error
      return {
        totalTokens: 0,
        totalCost: 0,
        totalInteractions: 0,
        monthlyLimit: 10000,
        remainingTokens: 10000,
      };
    }
  }

  async checkRateLimit(userId: string): Promise<{ allowed: boolean; remainingTokens: number }> {
    try {
      const metrics = await this.getUserMetrics(userId);
      return {
        allowed: metrics.remainingTokens > 0,
        remainingTokens: metrics.remainingTokens,
      };
    } catch (error) {
      console.error('Failed to check rate limit:', error);
      // Allow on error to prevent blocking users
      return { allowed: true, remainingTokens: 10000 };
    }
  }

  async getRecentInteractions(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('usage_stats')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      return data?.map(row => ({
        id: row.id,
        type: row.interaction_type || 'chat',
        status: row.status || 'completed',
        prompt: row.prompt || '',
        tokensUsed: row.tokens_used,
        cost: row.cost,
        duration: row.response_time,
        createdAt: row.created_at,
        model: row.model
      })) || [];
    } catch (error) {
      console.error('Failed to get recent interactions:', error);
      return [];
    }
  }
}

export const usageStatsService = new UsageStatsService();
