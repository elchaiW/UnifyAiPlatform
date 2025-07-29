import { NextRequest, NextResponse } from 'next/server';
import { conversationStorage } from '@/lib/conversationStorage';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Ensure profile exists
    await conversationStorage.ensureProfile(userId, session.user);
    
    // Get all conversations for user
    const conversations = await conversationStorage.getAllConversations(userId);
    
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { title } = await request.json();
    
    // Ensure profile exists
    await conversationStorage.ensureProfile(userId, session.user);
    
    // Create new conversation
    const conversation = await conversationStorage.createOrGetConversation(userId, title);
    
    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}