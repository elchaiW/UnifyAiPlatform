import { NextRequest, NextResponse } from 'next/server';
import { storage, initializeDemoUser } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    // Initialize demo user
    await initializeDemoUser();
    
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit');
    const limitNum = limit ? parseInt(limit, 10) : 50;

    // Get requests for demo user (ID: 1)
    const requests = await storage.getAllRequests(1);
    const limitedRequests = requests.slice(0, limitNum);
    
    return NextResponse.json(limitedRequests);
  } catch (error) {
    console.error('Error fetching request history:', error);
    return NextResponse.json({ error: 'Failed to fetch request history' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // For demo purposes, we'll just return success
    // In a real implementation, you would clear user-specific data
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing history:', error);
    return NextResponse.json({ error: 'Failed to clear history' }, { status: 500 });
  }
}