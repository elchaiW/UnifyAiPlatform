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

    // Clear user-specific chat history
    await dbStorage.deleteAllRequests(userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing history:', error);
    return NextResponse.json({ error: 'Failed to clear history' }, { status: 500 });
  }
}