// API endpoint for emergency cleanup operations
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { syncManager } = await import('@/lib/syncManager');
    
    const result = await syncManager.emergencyCleanup();
    
    return NextResponse.json({
      success: true,
      message: 'Emergency cleanup completed',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Emergency cleanup API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to perform emergency cleanup'
    }, { status: 500 });
  }
}