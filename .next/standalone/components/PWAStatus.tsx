'use client';

import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Wifi, WifiOff, Download } from 'lucide-react';

export default function PWAStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);
    
    // Check if running as PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setUpdateAvailable(true);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!isStandalone) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-40 flex space-x-2">
      {/* Online/Offline Status */}
      <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center space-x-1">
        {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        <span>{isOnline ? 'Online' : 'Offline'}</span>
      </Badge>

      {/* Update Available */}
      {updateAvailable && (
        <Badge 
          variant="secondary" 
          className="flex items-center space-x-1 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900"
          onClick={handleRefresh}
        >
          <Download className="h-3 w-3" />
          <span>Update Available</span>
        </Badge>
      )}
    </div>
  );
}