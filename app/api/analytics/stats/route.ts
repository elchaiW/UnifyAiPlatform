import { NextRequest, NextResponse } from 'next/server';
import { conversationStorage } from '@/lib/conversationStorage';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const stats = await conversationStorage.getAnalyticsStats(userId);
    
    return NextResponse.json({
      totalRequests: stats.totalRequests,
      successRate: stats.successRate,
      avgProcessingTime: stats.averageProcessingTime,
      modelUsage: Object.entries(stats.modelUsageStats).map(([model, count]) => ({
        model,
        count
      }))
    });
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics stats' }, { status: 500 });
  }
}