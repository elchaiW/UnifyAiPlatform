'use client';

import { useState, useEffect } from "react";
import ChatInterface from "@/components/ChatInterface";
import Sidebar from "@/components/Sidebar";
import AnalyticsView from "@/components/AnalyticsView";
import HistoryView from "@/components/HistoryView";

import { Button } from "@/components/ui/button";
import { MessageSquare, BarChart3, History, Menu, X } from "lucide-react";

type View = 'chat' | 'analytics' | 'history';

export default function Dashboard() {
  const [activeView, setActiveView] = useState<View>('chat');
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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
            conversationId={currentConversationId}
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
            conversationId={currentConversationId}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
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