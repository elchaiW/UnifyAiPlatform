'use client';

import { useEffect } from 'react';

export default function usePWAShortcuts(
  onChatShortcut?: () => void,
  onAnalyticsShortcut?: () => void
) {
  useEffect(() => {
    // Handle PWA shortcuts from manifest
    const urlParams = new URLSearchParams(window.location.search);
    const shortcut = urlParams.get('shortcut');
    
    if (shortcut === 'chat' && onChatShortcut) {
      onChatShortcut();
      // Clean URL without refreshing
      window.history.replaceState({}, '', window.location.pathname);
    } else if (shortcut === 'analytics' && onAnalyticsShortcut) {
      onAnalyticsShortcut();
      // Clean URL without refreshing
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Handle keyboard shortcuts for PWA
    const handleKeyboardShortcuts = (event: KeyboardEvent) => {
      // Ctrl/Cmd + N for new chat
      if ((event.ctrlKey || event.metaKey) && event.key === 'n' && onChatShortcut) {
        event.preventDefault();
        onChatShortcut();
      }
      
      // Ctrl/Cmd + A for analytics
      if ((event.ctrlKey || event.metaKey) && event.key === 'a' && onAnalyticsShortcut) {
        event.preventDefault();
        onAnalyticsShortcut();
      }
    };

    window.addEventListener('keydown', handleKeyboardShortcuts);
    
    return () => {
      window.removeEventListener('keydown', handleKeyboardShortcuts);
    };
  }, [onChatShortcut, onAnalyticsShortcut]);
}