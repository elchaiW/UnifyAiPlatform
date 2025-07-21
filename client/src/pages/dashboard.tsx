import { useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import Sidebar from "@/components/Sidebar";
import AnalyticsView from "@/components/AnalyticsView";
import HistoryView from "@/components/HistoryView";

type View = 'chat' | 'analytics' | 'history';

export default function Dashboard() {
  const [activeView, setActiveView] = useState<View>('chat');

  const renderView = () => {
    switch (activeView) {
      case 'analytics':
        return <AnalyticsView />;
      case 'history':
        return <HistoryView />;
      default:
        return <ChatInterface />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 min-w-0">
        {renderView()}
      </div>
    </div>
  );
}