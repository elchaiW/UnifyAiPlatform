import { NextRequest, NextResponse } from 'next/server';
import { conversationStorage } from '@/lib/conversationStorage';
import { AIClassifier } from '@/lib/services/aiClassifier';
import { processWithClaude } from '@/lib/services/claudeService';
import { processWithChatGPT } from '@/lib/services/openaiService';
import { processWithGemini } from '@/lib/services/geminiService';
import { processWithGrok } from '@/lib/services/grokService';
import { createSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get authenticated user from Supabase
    const supabase = createSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('❌ JSON parsing error:', jsonError);
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }
    
    const { content, message, conversationId } = body;
    const messageContent = content || message;
    
    if (!messageContent || typeof messageContent !== 'string' || messageContent.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    console.log(`📝 Processing request: "${messageContent.substring(0, 50)}..."`);
    
    // Ensure profile exists
    await conversationStorage.ensureProfile(userId, session.user);
    
    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = { id: conversationId };
    } else {
      conversation = await conversationStorage.createOrGetConversation(userId);
    }
    
    // Fast keyword-based classification for instant routing
    const classifier = new AIClassifier();
    const classification = await classifier.classifyRequest(messageContent);
    console.log(`🤖 Classification result:`, classification);
    
    // Create message record
    const messageData = {
      conversation_id: conversation.id,
      user_id: userId,
      content: messageContent,
      model: classification.selectedModel,
      status: 'processing' as const,
      metadata: {
        classification: classification,
      },
    };

    const dbMessage = await conversationStorage.createMessage(messageData);
    
    let response: string;
    
    try {
      // Route to appropriate AI model based on classification with fallback
      try {
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
      } catch (modelError) {
        console.log(`❌ ${classification.selectedModel} failed, falling back to ChatGPT:`, modelError);
        response = await processWithChatGPT(messageContent);
        classification.selectedModel = 'chatgpt';
        classification.reasoning = `${classification.reasoning} (fallback to ChatGPT due to service error)`;
      }
      
      const processingTime = (Date.now() - startTime) / 1000;
      
      // Update message with response
      const updatedMessage = await conversationStorage.updateMessage(dbMessage.id, {
        response,
        status: 'completed',
        processing_time: processingTime,
      });

      // Track analytics
      await conversationStorage.trackEvent({
        user_id: userId,
        event_type: 'message_processed',
        model: classification.selectedModel,
        processing_time: processingTime,
        metadata: {
          classification,
          success: true,
        },
      });
      
      // Return the response with classification details
      return NextResponse.json({
        id: updatedMessage?.id,
        conversation_id: conversation.id,
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