'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import ChatInterface from "./ChatInterface";
import Sidebar from "./Sidebar";
import AnalyticsView from "./AnalyticsView";
import HistoryView from "./HistoryView";
import PWAInstallPrompt from "./PWAInstallPrompt";
import PWAStatus from "./PWAStatus";
import OfflineIndicator from "./OfflineIndicator";
import usePWAShortcuts from "../hooks/usePWAShortcuts";

import { Button } from "./ui/button";
import { MessageSquare, BarChart3, History, Menu, X } from "lucide-react";

type View = 'chat' | 'analytics' | 'history';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState<View>('chat');
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <img 
            src="/luminadoc-logo.png" 
            alt="LUMINADOC" 
            className="h-16 w-auto mx-auto mb-6"
          />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!user) {
    return null;
  }

  // Handle PWA shortcuts
  usePWAShortcuts(
    () => handleNewChat(),
    () => setActiveView('analytics')
  );
  
  // Listen for mobile sidebar toggle from input area
  useEffect(() => {
    const handleToggleSidebar = () => {
      setIsSidebarOpen(prev => !prev);
    };
    
    window.addEventListener('toggleMobileSidebar', handleToggleSidebar);
    return () => window.removeEventListener('toggleMobileSidebar', handleToggleSidebar);
  }, []);

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setActiveView('chat');
  };

  const handleLoadConversation = (conversationId: number) => {
    setCurrentConversationId(conversationId);
    setActiveView('chat');
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const renderView = () => {
    switch (activeView) {
      case 'chat':
        return (
          <ChatInterface 
            key={currentConversationId || 'new'}
          />
        );
      case 'analytics':
        return <AnalyticsView />;
      case 'history':
        return <HistoryView onLoadConversation={handleLoadConversation} />;
      default:
        return (
          <ChatInterface 
            key={currentConversationId || 'new'}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* PWA Components */}
      <PWAInstallPrompt />
      <PWAStatus />
      <OfflineIndicator />
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar 
          activeView={activeView} 
          onViewChange={setActiveView}
          onNewChat={handleNewChat}
          onLoadConversation={handleLoadConversation}
        />
      </div>

      {/* Desktop Sidebar - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:block">
        <Sidebar 
          activeView={activeView} 
          onViewChange={setActiveView}
          onNewChat={handleNewChat}
          onLoadConversation={handleLoadConversation}
        />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">

        
        {/* Content */}
        <div className="flex-1 min-h-0">
          {renderView()}
        </div>
      </div>
    </div>
  );
}