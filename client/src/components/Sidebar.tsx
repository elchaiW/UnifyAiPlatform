import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  MessageSquare, 
  BarChart3, 
  History, 
  Download, 
  Eye,
  FileText,
  Clock,
  TrendingUp,
  Activity,
  Plus
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ThemeToggle } from "./ThemeToggle";

interface SidebarProps {
  activeView: 'chat' | 'analytics' | 'history';
  onViewChange: (view: 'chat' | 'analytics' | 'history') => void;
  onNewChat?: () => void;
  onLoadConversation?: (conversationId: number) => void;
}

interface ProcessingStats {
  totalRequests: number;
  successRate: number;
  avgProcessingTime: number;
  modelUsage: {
    claude: number;
    chatgpt: number;
    gemini: number;
    grok: number;
  };
}

const getModelColor = (model: string) => {
  switch (model) {
    case 'claude': return 'bg-blue-500';
    case 'chatgpt': return 'bg-green-500';
    case 'gemini': return 'bg-purple-500';
    case 'grok': return 'bg-orange-500';
    default: return 'bg-gray-500';
  }
};

export default function Sidebar({ activeView, onViewChange, onNewChat, onLoadConversation }: SidebarProps) {
  const { data: history = [] } = useQuery<any[]>({
    queryKey: ["/api/requests/history"],
    refetchInterval: 5000,
  });

  const { data: stats } = useQuery<ProcessingStats>({
    queryKey: ["/api/analytics/stats"],
    refetchInterval: 10000,
  });

  const recentRequests = history.slice(0, 5);

  const downloadHistory = () => {
    const csvContent = [
      'Date,Type,Content,Model,Status,Processing Time',
      ...history.map(item => 
        `"${new Date(item.createdAt).toLocaleString()}","${item.fileName ? 'File' : 'Text'}","${item.content.replace(/"/g, '""')}","${item.selectedModel}","${item.status}","${item.processingTime}s"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai_processing_history_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-64 lg:w-80 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0">
      {/* Header */}
      <div className="p-4 pt-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Multi-AI Assistant
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Intelligent AI Routing
        </p>
      </div>

      {/* Navigation */}
      <div className="p-4 space-y-2">
        <Button
          variant={activeView === 'chat' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onViewChange('chat')}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Chat
        </Button>
        <Button
          variant={activeView === 'analytics' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onViewChange('analytics')}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Analytics
        </Button>
        <Button
          variant={activeView === 'history' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onViewChange('history')}
        >
          <History className="h-4 w-4 mr-2" />
          History
        </Button>
      </div>

      <Separator />

      {/* Quick Stats */}
      {stats && (
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Quick Stats
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
              </div>
              <Badge variant="secondary">{stats.totalRequests}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Success</span>
              </div>
              <Badge variant="secondary">{Math.round(stats.successRate * 100)}%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Time</span>
              </div>
              <Badge variant="secondary">{stats.avgProcessingTime.toFixed(1)}s</Badge>
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* Recent Conversations */}
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Recent Chats
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (onNewChat) {
                onNewChat();
              } else {
                onViewChange('chat');
              }
            }}
            className="h-6 px-2 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            New
          </Button>
        </div>
        
        <ScrollArea className="h-full">
          <div className="space-y-2">
            {recentRequests.map((item) => (
              <div 
                key={item.id} 
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                onClick={() => {
                  if (onLoadConversation) {
                    onLoadConversation(item.id);
                  } else {
                    onViewChange('chat');
                  }
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {item.fileName ? (
                      <FileText className="h-4 w-4 text-gray-500" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-gray-500" />
                    )}
                    <div className={`w-3 h-3 ${getModelColor(item.selectedModel)} rounded-full`} />
                  </div>
                  <Badge 
                    variant={item.status === 'completed' ? 'default' : 
                            item.status === 'processing' ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    {item.status}
                  </Badge>
                </div>
                
                <p className="text-xs text-gray-700 dark:text-gray-200 mb-2 line-clamp-2">
                  {item.fileName || item.content.substring(0, 50) + '...'}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                  <span>{item.selectedModel}</span>
                  <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            ))}
            
            {recentRequests.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs">Start a new chat to begin</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      
      {/* Theme Toggle at bottom of sidebar */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}