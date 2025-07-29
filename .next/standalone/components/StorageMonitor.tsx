'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Database, Cloud, HardDrive, RotateCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StorageInfo {
  used: number;
  available: number;
  percentage: number;
  needsSync: boolean;
}

interface SyncStatus {
  isInitialized: boolean;
  syncInProgress: boolean;
  storageInfo: StorageInfo;
  config: {
    maxLocalStorageSize: number;
    batchSize: number;
    retentionDays: number;
    autoSyncInterval: number;
  };
}

export default function StorageMonitor() {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const { toast } = useToast();

  // Update storage info every 30 seconds
  useEffect(() => {
    const updateStorageInfo = async () => {
      try {
        const { clientStorage } = await import('@/lib/clientStorage');
        const { syncManager } = await import('@/lib/syncManager');
        
        const info = clientStorage.getStorageInfo();
        const status = syncManager.getSyncStatus();
        
        setStorageInfo(info);
        setSyncStatus(status);
        
        // Update last sync time
        const lastSyncTime = localStorage.getItem('last_sync_time');
        setLastSync(lastSyncTime);
      } catch (error) {
        console.error('Failed to update storage info:', error);
      }
    };

    updateStorageInfo();
    const interval = setInterval(updateStorageInfo, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    try {
      const { syncManager } = await import('@/lib/syncManager');
      
      toast({
        title: "Sync Started",
        description: "Syncing your data to the database...",
      });

      const result = await syncManager.forcSync();
      
      if (result.success) {
        localStorage.setItem('last_sync_time', new Date().toISOString());
        setLastSync(new Date().toISOString());
        
        toast({
          title: "Sync Completed",
          description: `${result.syncedCount} messages synced, ${result.deletedCount} cleaned up locally.`,
        });
      } else {
        toast({
          title: "Sync Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Sync Error",
        description: "Failed to sync data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEmergencyCleanup = async () => {
    try {
      const { syncManager } = await import('@/lib/syncManager');
      
      const result = await syncManager.emergencyCleanup();
      
      toast({
        title: "Cleanup Completed",
        description: `${result.deletedCount} old messages removed to free up space.`,
      });
      
      // Refresh storage info
      const { clientStorage } = await import('@/lib/clientStorage');
      const info = clientStorage.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      toast({
        title: "Cleanup Failed",
        description: "Failed to cleanup local storage",
        variant: "destructive",
      });
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatLastSync = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  if (!storageInfo || !syncStatus) {
    return null;
  }

  const getStatusColor = () => {
    if (storageInfo.percentage > 90) return 'text-red-500';
    if (storageInfo.percentage > 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (storageInfo.percentage > 90) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (syncStatus.syncInProgress) return <RotateCw className="h-4 w-4 text-blue-500 animate-spin" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <HardDrive className="h-5 w-5" />
          <h3 className="font-semibold">Storage & Sync</h3>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          {syncStatus.isInitialized ? (
            <Badge variant="outline" className="text-green-600">
              <Database className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="text-gray-500">
              <Cloud className="h-3 w-3 mr-1" />
              Local Only
            </Badge>
          )}
        </div>
      </div>

      {/* Storage Usage */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Local Storage</span>
          <span className={getStatusColor()}>
            {Math.round(storageInfo.percentage)}% used
          </span>
        </div>
        <Progress 
          value={storageInfo.percentage} 
          className="h-2"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatBytes(storageInfo.used)} used</span>
          <span>{formatBytes(storageInfo.available)} total</span>
        </div>
      </div>

      {/* Sync Status */}
      {syncStatus.isInitialized && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Last Sync</span>
            <span className="text-gray-600">{formatLastSync(lastSync)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-500">
              Retention: {syncStatus.config.retentionDays} days
            </div>
            <div className="text-gray-500">
              Auto-sync: {syncStatus.config.autoSyncInterval}m
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2">
        {syncStatus.isInitialized && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSync}
            disabled={syncStatus.syncInProgress}
            className="flex-1"
          >
            {syncStatus.syncInProgress ? (
              <>
                <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Cloud className="h-4 w-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>
        )}
        
        {storageInfo.percentage > 80 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleEmergencyCleanup}
            className="flex-1"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Cleanup
          </Button>
        )}
      </div>

      {/* Warning Messages */}
      {storageInfo.percentage > 90 && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700 dark:text-red-300">
              Storage critically full! Older messages will be automatically synced and removed.
            </span>
          </div>
        </div>
      )}
      
      {storageInfo.needsSync && storageInfo.percentage <= 90 && (
        <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center space-x-2">
            <Cloud className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-yellow-700 dark:text-yellow-300">
              Storage getting full. Background sync will start soon.
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}