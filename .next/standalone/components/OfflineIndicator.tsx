'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { WifiOff, AlertCircle } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline || !showOfflineMessage) {
    return null;
  }

  return (
    <Card className="fixed top-4 left-4 right-4 z-50 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 max-w-md mx-auto">
      <div className="p-3 flex items-center space-x-3">
        <WifiOff className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        <div>
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
            You&apos;re offline
          </h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Your chat history is still available. New messages will sync when you&apos;re back online.
          </p>
        </div>
      </div>
    </Card>
  );
}