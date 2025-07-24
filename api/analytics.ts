import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

// Initialize demo user (in production, use proper authentication)
let demoUser: any = null;

async function initDemoUser() {
  if (!demoUser) {
    demoUser = await storage.createUser({
      username: "demo",
      email: "demo@example.com",
      password: "demo123"
    });
  }
  return demoUser;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await initDemoUser();

    const [
      totalRequests,
      successRate,
      averageResponseTime,
      modelUsageStats
    ] = await Promise.all([
      storage.getTotalRequests(user.id),
      storage.getSuccessRate(user.id),
      storage.getAverageResponseTime(user.id),
      storage.getModelUsageStats(user.id)
    ]);

    // Convert modelUsageStats array to object format
    const modelUsageMap = { claude: 0, chatgpt: 0, gemini: 0, grok: 0 };
    if (Array.isArray(modelUsageStats)) {
      modelUsageStats.forEach(stat => {
        if (stat && typeof stat === 'object' && 'modelUsed' in stat && 'count' in stat) {
          const modelName = stat.modelUsed as keyof typeof modelUsageMap;
          if (modelName in modelUsageMap) {
            modelUsageMap[modelName] = Number(stat.count) || 0;
          }
        }
      });
    }

    return res.json({
      totalRequests: Number(totalRequests) || 0,
      successRate: Number(successRate) || 0,
      avgProcessingTime: Number(averageResponseTime) || 0,
      modelUsage: modelUsageMap
    });

  } catch (error) {
    console.error('Analytics fetch error:', error);
    return res.status(500).json({ error: "Failed to fetch analytics" });
  }
}