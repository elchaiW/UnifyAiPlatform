import type { VercelRequest, VercelResponse } from '@vercel/node'
import { storage } from '../server/storage'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Demo user for development
    let demoUser = await storage.getUserByUsername("demo")
    if (!demoUser) {
      demoUser = await storage.createUser({
        username: "demo",
        email: "demo@example.com",
        password: "demo123"
      })
    }

    const totalRequests = await storage.getTotalRequests(demoUser.id)
    const successRate = await storage.getSuccessRate(demoUser.id)
    const avgProcessingTime = await storage.getAverageResponseTime(demoUser.id)
    const modelUsage = await storage.getModelUsageStats(demoUser.id)

    return res.json({
      totalRequests,
      successRate,
      avgProcessingTime,
      modelUsage
    })

  } catch (error) {
    console.error('Analytics fetch error:', error)
    return res.status(500).json({ error: "Failed to fetch analytics" })
  }
}