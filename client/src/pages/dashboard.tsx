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
        {/* ChatGPT-style Mobile Navigation */}
        <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <div>
                <h1 className="text-base font-medium text-gray-900 dark:text-white">
                  Multi-AI Assistant
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Intelligent AI Routing
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveView('chat')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  activeView === 'chat' 
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Chat
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveView('analytics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  activeView === 'analytics' 
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Stats
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveView('history')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  activeView === 'history' 
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
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