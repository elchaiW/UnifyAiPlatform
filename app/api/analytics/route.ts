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
    
    // Get analytics stats for the user
    const stats = await conversationStorage.getAnalyticsStats(userId);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}