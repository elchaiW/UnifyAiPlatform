import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { classifyRequest } from '../server/services/aiClassifier';
import { processWithClaude } from '../server/services/claudeService';
import { processWithChatGPT } from '../server/services/openaiService';
import { processWithGemini } from '../server/services/geminiService';
import { processWithGrok } from '../server/services/grokService';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const user = await initDemoUser();

    if (req.method === 'POST') {
      const { content, message } = req.body;
      const messageContent = content || message;
      
      if (!messageContent || typeof messageContent !== 'string' || messageContent.trim().length === 0) {
        return res.status(400).json({ error: "Content is required" });
      }

      // Classify the request
      const startTime = Date.now();
      const classification = await classifyRequest(messageContent);
      
      // Create request record
      const request = await storage.createRequest({
        userId: user.id,
        type: 'prompt',
        content: messageContent,
        category: classification.category,
        selectedModel: classification.model,
        fileName: null,
      });

      // Update status to processing
      await storage.updateRequestStatus(request.id, 'processing');

      // Process with appropriate AI model
      let response: string;
      try {
        switch (classification.model) {
          case 'claude':
            response = await processWithClaude(messageContent);
            break;
          case 'chatgpt':
            response = await processWithChatGPT(messageContent);
            break;
          case 'gemini':
            response = await processWithGemini(messageContent);
            break;
          case 'grok':
            response = await processWithGrok(messageContent);
            break;
          default:
            throw new Error(`Unknown model: ${classification.model}`);
        }

        const processingTime = (Date.now() - startTime) / 1000;
        
        // Update request with response
        await storage.updateRequestStatus(request.id, 'completed', response, processingTime);
        
        // Create analytics record
        await storage.createAnalytics({
          userId: user.id,
          requestId: request.id,
          modelUsed: classification.model,
          responseTime: processingTime.toString(),
          success: true,
          errorType: null,
        });

        return res.json({
          id: request.id,
          classification,
          response,
          processingTime,
          status: 'completed'
        });

      } catch (error) {
        const processingTime = (Date.now() - startTime) / 1000;
        const errorMessage = error instanceof Error ? error.message : 'Processing failed';
        
        await storage.updateRequestStatus(request.id, 'failed', `Error: ${errorMessage}`, processingTime);
        
        await storage.createAnalytics({
          userId: user.id,
          requestId: request.id,
          modelUsed: classification.model,
          responseTime: processingTime.toString(),
          success: false,
          errorType: errorMessage,
        });

        return res.status(500).json({ error: errorMessage });
      }
    }

    if (req.method === 'GET') {
      // Get processing history
      const limit = parseInt(req.query.limit as string) || 10;
      const requests = await storage.getUserRequests(user.id, limit);
      return res.json(requests);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Request processing error:', error);
    return res.status(500).json({ error: "Failed to process request" });
  }
}