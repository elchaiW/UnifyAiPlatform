import { useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import Sidebar from "@/components/Sidebar";
import AnalyticsView from "@/components/AnalyticsView";
import HistoryView from "@/components/HistoryView";
import { Button } from "@/components/ui/button";

type View = 'chat' | 'analytics' | 'history';

export default function Dashboard() {
  const [activeView, setActiveView] = useState<View>('chat');
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);

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
        return <ChatInterface conversationId={currentConversationId} onNewChat={handleNewChat} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Mobile Sidebar - Hidden on mobile, shown on desktop */}
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
        {/* Mobile Navigation Bar with proper spacing */}
        <div className="lg:hidden bg-white dark:bg-gray-800 border-b px-4 py-4 pt-8 safe-area-pt">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Multi-AI Assistant
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                AI-powered document analysis
              </p>
            </div>
            <div className="flex space-x-1">
              <Button
                variant={activeView === 'chat' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('chat')}
                className="px-2 py-1 text-xs h-8 min-w-[44px]"
              >
                Chat
              </Button>
              <Button
                variant={activeView === 'analytics' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('analytics')}
                className="px-2 py-1 text-xs h-8 min-w-[44px]"
              >
                Stats
              </Button>
              <Button
                variant={activeView === 'history' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('history')}
                className="px-2 py-1 text-xs h-8 min-w-[44px]"
              >
                History
              </Button>
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