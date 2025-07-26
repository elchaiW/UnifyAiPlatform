import { NextRequest, NextResponse } from 'next/server';
import { dbStorage } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
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
    
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit');
    const limitNum = limit ? parseInt(limit, 10) : 50;

    // Get user-specific requests
    const requests = await dbStorage.getAllRequests(userId, limitNum);
    
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching request history:', error);
    return NextResponse.json({ error: 'Failed to fetch request history' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
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

    // Clear user-specific chat history
    await dbStorage.deleteAllRequests(userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing history:', error);
    return NextResponse.json({ error: 'Failed to clear history' }, { status: 500 });
  }
}