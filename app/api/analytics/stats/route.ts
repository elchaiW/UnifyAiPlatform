import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const stats = await storage.getAnalyticsStats();
    
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