import { NextRequest, NextResponse } from 'next/server';
import { AIClassifier } from '@/lib/services/aiClassifier';
import { processWithChatGPT } from '@/lib/services/openaiService';
import { processWithClaude } from '@/lib/services/claudeService';
import { processWithGemini } from '@/lib/services/geminiService';
import { processWithGrok } from '@/lib/services/grokService';

// Lightweight API for client-side storage mode
// All persistence happens on client-side via localStorage

export async function POST(request: NextRequest) {
  try {
    const { content, type } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Classify request using fast keyword-based approach for speed
    const classifier = new AIClassifier();
    const classification = await classifier.classifyRequest(content);

    // Process with appropriate AI model
    let response: string;
    const startTime = Date.now();

    try {
      switch (classification.selectedModel) {
        case 'claude':
          response = await processWithClaude(content);
          break;
        case 'chatgpt':
          response = await processWithChatGPT(content);
          break;
        case 'gemini':
          response = await processWithGemini(content);
          break;
        case 'grok':
          response = await processWithGrok(content);
          break;
        default:
          response = await processWithChatGPT(content);
      }

      const processingTime = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        response,
        classification,
        processingTime,
        message: 'Client-side storage mode - no database required'
      });

    } catch (error) {
      console.error('AI processing error:', error);
      return NextResponse.json({
        error: 'AI processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json({
      error: 'Request processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    mode: 'client-storage',
    database: 'disabled',
    timestamp: new Date().toISOString()
  });
}