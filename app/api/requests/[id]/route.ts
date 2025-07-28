import { NextRequest, NextResponse } from 'next/server';
import { dbStorage } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // Get authenticated user from Supabase
    const authHeader = request.headers.get('authorization');
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    );

    // For now, fallback to demo user if no authentication (backwards compatibility)
    let userId = "demo-user-1"; // Demo user
    if (supabaseUser && !authError) {
      const user = await getCurrentUser(supabaseUser);
      if (user) {
        userId = user.id;
      }
    }

    const success = await dbStorage.deleteRequest(id, userId);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error deleting request:', error);
    return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 });
  }
}