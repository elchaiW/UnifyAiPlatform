// API endpoint for manual sync operations
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { syncManager } = await import('@/lib/syncManager');
    
    const result = await syncManager.forcSync();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Sync completed successfully',
        syncedCount: result.syncedCount,
        deletedCount: result.deletedCount
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Sync failed'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Sync API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to perform sync'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { syncManager } = await import('@/lib/syncManager');
    
    const status = syncManager.getSyncStatus();
    
    return NextResponse.json({
      status: 'healthy',
      syncStatus: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sync status API error:', error);
    return NextResponse.json({
      status: 'error',
      error: 'Failed to get sync status'
    }, { status: 500 });
  }
}