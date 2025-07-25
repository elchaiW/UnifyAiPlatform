import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../../server/storage';

export async function GET(request: NextRequest) {
  try {
    // Get demo user
    const demoUser = await storage.getUserByUsername("demo");
    if (!demoUser) {
      return NextResponse.json({
        totalRequests: 0,
        successRate: 0,
        avgProcessingTime: 0,
        modelUsage: []
      });
    }

    const [totalRequests, successRate, avgProcessingTime, modelUsage] = await Promise.all([
      storage.getTotalRequests(demoUser.id),
      storage.getSuccessRate(demoUser.id),
      storage.getAverageResponseTime(demoUser.id),
      storage.getModelUsageStats(demoUser.id)
    ]);

    return NextResponse.json({
      totalRequests,
      successRate,
      avgProcessingTime,
      modelUsage
    });
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics stats' }, { status: 500 });
  }
}