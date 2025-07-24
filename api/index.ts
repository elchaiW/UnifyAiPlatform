import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Simple health check for main API endpoint
  if (req.method === 'GET') {
    return res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'multi-ai-platform',
      message: 'Multi-AI Platform API is running on Vercel'
    })
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}