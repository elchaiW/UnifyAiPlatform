import { NextRequest, NextResponse } from 'next/server';
import { conversationStorage } from '@/lib/conversationStorage';
import { createSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit');
    const limitNum = limit ? parseInt(limit, 10) : 50;

    // Get user-specific messages
    const messages = await conversationStorage.getAllMessages(userId, limitNum);
    
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching request history:', error);
    return NextResponse.json({ error: 'Failed to fetch request history' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = createSupabaseClient();
    
    // Get authenticated user from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Clear user-specific chat history
    await conversationStorage.deleteAllMessages(userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing history:', error);
    return NextResponse.json({ error: 'Failed to clear history' }, { status: 500 });
  }
}