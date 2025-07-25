import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../server/storage';
import { classifyRequest } from '../../../server/services/aiClassifier';
import { processWithClaude } from '../../../server/services/claudeService';
import { processWithChatGPT } from '../../../server/services/openaiService';
import { processWithGemini } from '../../../server/services/geminiService';
import { processWithGrok } from '../../../server/services/grokService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, message } = body;
    const messageContent = content || message;
    
    if (!messageContent || typeof messageContent !== 'string' || messageContent.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Get demo user (in production, use proper authentication)
    let demoUser = await storage.getUserByUsername("demo");
    if (!demoUser) {
      demoUser = await storage.createUser({
        username: "demo",
        email: "demo@example.com",
        password: "demo123"
      });
    }

    console.log(`📝 Processing request: "${messageContent.substring(0, 50)}..."`);
    
    // Classify the request to determine the best AI model
    const classification = await classifyRequest(messageContent);
    console.log(`🤖 Classification result:`, classification);
    
    // Create request record
    const requestRecord = await storage.createRequest({
      type: 'prompt',
      content: messageContent,
      userId: demoUser.id,
      category: classification.category,
      selectedModel: classification.model
    });
    
    // Update status to processing
    await storage.updateRequestStatus(requestRecord.id, 'processing');
    
    let response: string;
    let processingTimeMs: number;
    const startTime = Date.now();
    
    try {
      // Route to appropriate AI model based on classification
      switch (classification.model) {
        case 'claude':
          console.log(`🧠 Processing with Claude...`);
          response = await processWithClaude(messageContent);
          break;
        case 'chatgpt':
          console.log(`💬 Processing with ChatGPT...`);
          response = await processWithChatGPT(messageContent);
          break;
        case 'gemini':
          console.log(`✨ Processing with Gemini...`);
          response = await processWithGemini(messageContent);
          break;
        case 'grok':
          console.log(`🚀 Processing with Grok...`);
          response = await processWithGrok(messageContent);
          break;
        default:
          console.log(`💬 Defaulting to ChatGPT...`);
          response = await processWithChatGPT(messageContent);
      }
      
      processingTimeMs = Date.now() - startTime;
      
      // Update request with response
      await storage.updateRequestStatus(requestRecord.id, 'completed', response, processingTimeMs);
      
      // Create analytics record
      await storage.createAnalytics({
        userId: demoUser.id,
        requestId: requestRecord.id,
        modelUsed: classification.model,
        responseTime: processingTimeMs.toString(),
        success: true
      });
      
      // Return the response with classification details
      return NextResponse.json({
        success: true,
        response,
        classification,
        processingTime: processingTimeMs,
        requestId: requestRecord.id,
        model: classification.model
      });
      
    } catch (error) {
      console.error(`❌ Processing failed:`, error);
      processingTimeMs = Date.now() - startTime;
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown processing error';
      
      // Update request with error
      await storage.updateRequestStatus(requestRecord.id, 'failed', `Error: ${errorMessage}`, processingTimeMs);
      
      // Create failed analytics record
      await storage.createAnalytics({
        userId: demoUser.id,
        requestId: requestRecord.id,
        modelUsed: classification.model,
        responseTime: processingTimeMs.toString(),
        success: false,
        errorType: errorMessage
      });
      
      return NextResponse.json({
        success: false,
        error: errorMessage,
        classification,
        processingTime: processingTimeMs,
        requestId: requestRecord.id
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get demo user
    const demoUser = await storage.getUserByUsername("demo");
    if (!demoUser) {
      return NextResponse.json([], { status: 200 });
    }

    const url = new URL(request.url);
    const limit = url.searchParams.get('limit');
    const limitNum = limit ? parseInt(limit, 10) : 50;

    const requests = await storage.getUserRequests(demoUser.id, limitNum);
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}