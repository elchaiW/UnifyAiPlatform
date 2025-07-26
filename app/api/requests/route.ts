import { NextRequest, NextResponse } from 'next/server';
import { dbStorage } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { AIClassifier } from '@/lib/services/aiClassifier';
import { processWithClaude } from '@/lib/services/claudeService';
import { processWithChatGPT } from '@/lib/services/openaiService';
import { processWithGemini } from '@/lib/services/geminiService';
import { processWithGrok } from '@/lib/services/grokService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, message } = body;
    const messageContent = content || message;
    
    if (!messageContent || typeof messageContent !== 'string' || messageContent.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Get authenticated user from Supabase
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !supabaseUser) {
      return NextResponse.json({ error: "Invalid authentication" }, { status: 401 });
    }

    // Get or create user in our database
    const user = await getCurrentUser(supabaseUser);
    if (!user) {
      return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
    }

    const userId = user.id;

    console.log(`📝 Processing request for user ${userId}: "${messageContent.substring(0, 50)}..."`);
    
    // Classify the request to determine the best AI model
    const classifier = new AIClassifier();
    const classification = await classifier.classifyRequest(messageContent);
    console.log(`🤖 Classification result:`, classification);
    
    // Create request record
    const requestRecord = await dbStorage.createRequest({
      userId: userId,
      type: 'prompt',
      prompt: messageContent,
      content: messageContent,
      category: 'general',
      selectedModel: classification.selectedModel,
      status: 'processing',
      confidence: classification.confidence,
      reasoning: classification.reasoning
    });
    
    let response: string;
    let processingTimeMs: number;
    const startTime = Date.now();
    
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
      
      processingTimeMs = Date.now() - startTime;
      
      // Update request with response
      await dbStorage.updateRequest(requestRecord.id, {
        status: 'completed',
        response: response,
        processingTime: processingTimeMs,
        completedAt: new Date()
      });
      
      // Return the response with classification details
      return NextResponse.json({
        success: true,
        response,
        classification,
        processingTime: processingTimeMs,
        requestId: requestRecord.id,
        model: classification.selectedModel
      });
      
    } catch (error) {
      console.error(`❌ Processing failed:`, error);
      processingTimeMs = Date.now() - startTime;
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown processing error';
      
      // Update request with error
      await dbStorage.updateRequest(requestRecord.id, {
        status: 'failed',
        response: `Error: ${errorMessage}`,
        processingTime: processingTimeMs,
        completedAt: new Date()
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
    // Get authenticated user from Supabase
    const authHeader = request.headers.get('authorization');
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    );

    // For now, fallback to demo user if no authentication (backwards compatibility)
    let userId = 1; // Demo user
    if (supabaseUser && !authError) {
      const user = await getCurrentUser(supabaseUser);
      if (user) {
        userId = user.id;
      }
    }
    
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit');
    const limitNum = limit ? parseInt(limit, 10) : 50;

    const requests = await dbStorage.getAllRequests(userId, limitNum);
    
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}