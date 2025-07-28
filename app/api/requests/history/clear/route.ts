import { NextRequest, NextResponse } from 'next/server';
import { dbStorage } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

    const success = await dbStorage.deleteAllRequests(userId);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error clearing all history:', error);
    return NextResponse.json({ error: 'Failed to clear all history' }, { status: 500 });
  }
}