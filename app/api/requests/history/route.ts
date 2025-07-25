import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../../server/storage';

export async function GET(request: NextRequest) {
  try {
    // Get demo user
    const demoUser = await storage.getUserByUsername("demo");
    if (!demoUser) {
      return NextResponse.json([], { status: 200 });
    }

    const url = new URL(request.url);
    const limit = url.searchParams.get('limit');
    const limitNum = limit ? parseInt(limit, 10) : 50;

    const requests = await storage.getUserRequests(demoUser.id, limitNum);
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching request history:', error);
    return NextResponse.json({ error: 'Failed to fetch request history' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get demo user
    const demoUser = await storage.getUserByUsername("demo");
    if (!demoUser) {
      return NextResponse.json({ success: true });
    }

    await storage.deleteAllUserRequests(demoUser.id);
    await storage.deleteAllUserAnalytics(demoUser.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing history:', error);
    return NextResponse.json({ error: 'Failed to clear history' }, { status: 500 });
  }
}