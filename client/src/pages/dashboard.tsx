import { useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import Sidebar from "@/components/Sidebar";
import AnalyticsView from "@/components/AnalyticsView";
import HistoryView from "@/components/HistoryView";

import { Button } from "@/components/ui/button";
import { MessageSquare, BarChart3, History } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

type View = 'chat' | 'analytics' | 'history';

export default function Dashboard() {
  const [activeView, setActiveView] = useState<View>('chat');
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setActiveView('chat');
  };

  const handleLoadConversation = (conversationId: number) => {
    setCurrentConversationId(conversationId);
    setActiveView('chat');
  };

  const renderView = () => {
    switch (activeView) {
      case 'analytics':
        return <AnalyticsView />;
      case 'history':
        return <HistoryView onLoadConversation={handleLoadConversation} />;
      default:
        return <ChatInterface />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Mobile Sidebar - Slide-out menu */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(false)}
              className="p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <Button
            variant={activeView === 'chat' ? 'default' : 'ghost'}
            onClick={() => {setActiveView('chat'); setIsSidebarOpen(false);}}
            className="w-full justify-start"
          >
            <MessageSquare className="h-4 w-4 mr-3" />
            Chat
          </Button>
          <Button
            variant={activeView === 'analytics' ? 'default' : 'ghost'}
            onClick={() => {setActiveView('analytics'); setIsSidebarOpen(false);}}
            className="w-full justify-start"
          >
            <BarChart3 className="h-4 w-4 mr-3" />
            Analytics
          </Button>
          <Button
            variant={activeView === 'history' ? 'default' : 'ghost'}
            onClick={() => {setActiveView('history'); setIsSidebarOpen(false);}}
            className="w-full justify-start"
          >
            <History className="h-4 w-4 mr-3" />
            History
          </Button>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

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
        {/* Reference-style Mobile Navigation matching your design */}
        <div className="lg:hidden bg-gray-800 border-b border-gray-600 px-4 py-3 pt-8 safe-area-pt">
          <div className="flex items-center justify-between">
            {/* Left: webview label matching your design */}
            <div className="px-2 py-1 border border-gray-500 rounded text-xs text-gray-300 font-mono cursor-pointer"
                 onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              webview
            </div>
            
            {/* Right: LUMINADOC logo exactly as shown in your design */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1L15 8.5L23 10L17.5 15L19 23L12 19L5 23L6.5 15L1 10L9 8.5L12 1Z" fill="#4F8EF7"/>
                  <path d="M12 4L14 10L20 11L16 14.5L17 21L12 18L7 21L8 14.5L4 11L10 10L12 4Z" fill="#7BA7F7"/>
                </svg>
              </div>
              <span className="text-white font-medium text-base">
                <span className="text-blue-400">LUMINA</span>DOC
              </span>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-h-0">
          {renderView()}
        </div>
      </div>
    </div>
  );
}