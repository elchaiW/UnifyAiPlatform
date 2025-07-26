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
    const requestId = parseInt(resolvedParams.id, 10);
    if (isNaN(requestId)) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
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

    // Delete request - only allows user to delete their own requests
    const success = await dbStorage.deleteRequest(requestId, userId);
    
    if (!success) {
      return NextResponse.json({ error: 'Request not found or unauthorized' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting request:', error);
    return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 });
  }
}