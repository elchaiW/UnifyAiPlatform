import { NextRequest, NextResponse } from 'next/server';
import { AIClassifier } from '@/lib/services/aiClassifier';
import { processWithClaude } from '@/lib/services/claudeService';
import { processWithChatGPT } from '@/lib/services/openaiService';
import { processWithGemini } from '@/lib/services/geminiService';
import { processWithGrok } from '@/lib/services/grokService';

// CLIENT-ONLY MODE: No database integration
// All data stored in browser localStorage for instant performance

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, message } = body;
    const messageContent = content || message;
    
    if (!messageContent || typeof messageContent !== 'string' || messageContent.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    console.log(`📝 Processing request: "${messageContent.substring(0, 50)}..."`);
    
    // Fast keyword-based classification for instant routing
    const classifier = new AIClassifier();
    const classification = await classifier.classifyRequest(messageContent);
    console.log(`🤖 Classification result:`, classification);
    
    const startTime = Date.now();
    let response: string;
    
    try {
      // Route to appropriate AI model based on classification
      switch (classification.selectedModel) {
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
      
      const processingTime = Date.now() - startTime;
      
      // Return the response with classification details
      return NextResponse.json({
        success: true,
        response,
        classification,
        processingTime,
        model: classification.selectedModel,
        mode: 'client-storage'
      });
      
    } catch (error) {
      console.error(`❌ Processing failed:`, error);
      const processingTime = Date.now() - startTime;
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown processing error';
      
      return NextResponse.json({
        success: false,
        error: errorMessage,
        classification,
        processingTime,
        mode: 'client-storage'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      mode: 'client-storage'
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    mode: 'client-storage',
    database: 'disabled',
    timestamp: new Date().toISOString(),
    message: 'API running in client-only mode for maximum performance'
  });
}