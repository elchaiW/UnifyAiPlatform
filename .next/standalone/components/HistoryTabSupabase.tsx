// Enhanced History Tab with real-time Supabase synchronization
'use client';

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { 
  Search, 
  Trash2, 
  Download, 
  Calendar,
  Clock,
  MessageSquare,
  Filter,
  RefreshCw,
  Wifi,
  WifiOff
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useToast } from "../hooks/use-toast";
import { useAuth } from './AuthProvider';
import { useConversations, useSupabaseSync } from '@/hooks/useSupabaseSync';
import { enhancedStorage } from '@/lib/enhanced-storage';
import { Conversation, Message } from '@/shared/schema';

const getModelImage = (model: string) => {
  switch (model.toLowerCase()) {
    case 'claude': return '/attached_assets/claude_1753267938951.webp';
    case 'chatgpt': return '/attached_assets/Chatgpt_1753267928029.webp';
    case 'gemini': return '/attached_assets/gemini_1753267772227.png';
    case 'grok': return '/attached_assets/grok_1753267912240.png';
    default: return null;
  }
};

export default function HistoryTabSupabase() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("all");
  const [isOnline, setIsOnline] = useState(true);
  const [localHistory, setLocalHistory] = useState<any[]>([]);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { conversations, loading, deleteConversation, refresh } = useConversations();
  const { syncState, syncLocalData, clearLocalData } = useSupabaseSync();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load local history for fallback
  useEffect(() => {
    const loadLocalHistory = async () => {
      const localData = enhancedStorage.getLocalData();
      setLocalHistory(localData.messages);
    };
    
    loadLocalHistory();
  }, []);

  // Combine Supabase conversations with local history
  const historyItems = conversations.length > 0 ? conversations : localHistory;

  // Filter history based on search and filters
  const filteredHistory = historyItems.filter(item => {
    const matchesSearch = searchTerm === "" || 
      (item.title || item.content || item.prompt || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.response || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModel = selectedModel === "all" || 
      (item.model || "").toLowerCase() === selectedModel.toLowerCase();
    
    const matchesTimeRange = selectedTimeRange === "all" || 
      filterByTimeRange(item.created_at || item.timestamp, selectedTimeRange);
    
    return matchesSearch && matchesModel && matchesTimeRange;
  });

  const filterByTimeRange = (dateString: string, range: string): boolean => {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    
    switch (range) {
      case "today": return diffInDays < 1;
      case "week": return diffInDays < 7;
      case "month": return diffInDays < 30;
      default: return true;
    }
  };

  const handleDeleteItem = async (item: any) => {
    try {
      if (item.id && typeof item.id === 'string') {
        // Supabase conversation
        await deleteConversation(item.id);
      } else {
        // Local message
        await enhancedStorage.deleteMessage(item.id);
        setLocalHistory(prev => prev.filter(msg => msg.id !== item.id));
      }
      
      toast({
        title: "Item deleted",
        description: "The item has been removed from your history.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item.",
        variant: "destructive",
      });
    }
  };

  const handleClearAllHistory = async () => {
    try {
      // Clear local data
      await clearLocalData();
      setLocalHistory([]);
      
      // Delete all conversations from Supabase
      await Promise.all(conversations.map(conv => deleteConversation(conv.id)));
      
      toast({
        title: "History cleared",
        description: "All chat history has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear history.",
        variant: "destructive",
      });
    }
  };

  const handleSyncData = async () => {
    try {
      const localData = enhancedStorage.getLocalData();
      if (localData.messages.length > 0) {
        await syncLocalData(localData.messages);
        await refresh(); // Refresh conversations list
        toast({
          title: "Sync completed",
          description: `Synced ${localData.messages.length} messages to cloud.`,
        });
      } else {
        toast({
          title: "No data to sync",
          description: "Your local data is already synchronized.",
        });
      }
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Failed to sync data to cloud.",
        variant: "destructive",
      });
    }
  };

  const exportHistory = () => {
    const dataToExport = {
      conversations: conversations,
      localMessages: localHistory,
      exportDate: new Date().toISOString(),
      user: user?.email
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luminadoc-history-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export completed",
      description: "Your chat history has been downloaded.",
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          Please sign in to view your chat history
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="p-6 bg-white dark:bg-gray-800 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold">Chat History</h2>
            {isOnline ? (
              <div className="flex items-center space-x-1 text-green-600">
                <Wifi className="h-4 w-4" />
                <span className="text-xs">Online</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-orange-600">
                <WifiOff className="h-4 w-4" />
                <span className="text-xs">Offline</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {syncState.isLoading && (
              <div className="flex items-center space-x-2 text-blue-600">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">Syncing...</span>
              </div>
            )}
            
            <Button onClick={handleSyncData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync
            </Button>
            
            <Button onClick={exportHistory} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button onClick={handleClearAllHistory} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations and messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
          >
            <option value="all">All Models</option>
            <option value="openai">ChatGPT</option>
            <option value="claude">Claude</option>
            <option value="gemini">Gemini</option>
            <option value="grok">Grok</option>
          </select>
          
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* History List */}
      <ScrollArea className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading history...</span>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No chat history found</h3>
            <p className="text-sm">
              {searchTerm || selectedModel !== "all" || selectedTimeRange !== "all"
                ? "Try adjusting your filters"
                : "Start a conversation to see it here"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item, index) => (
              <Card key={item.id || index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getModelImage(item.model) ? (
                        <img 
                          src={getModelImage(item.model)!} 
                          alt={item.model}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-base">
                          {item.title || `Chat with ${item.model || 'AI'}`}
                        </CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(item.created_at || item.timestamp), 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDistanceToNow(new Date(item.created_at || item.timestamp), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {item.model || 'AI'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <p className="font-medium text-gray-700 dark:text-gray-300">User:</p>
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                        {item.content || item.prompt || 'No message content'}
                      </p>
                    </div>
                    
                    {item.response && (
                      <div className="text-sm">
                        <p className="font-medium text-gray-700 dark:text-gray-300">AI Response:</p>
                        <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                          {item.response}
                        </p>
                      </div>
                    )}
                    
                    {item.processing_time && (
                      <div className="text-xs text-gray-500">
                        Processing time: {(item.processing_time / 1000).toFixed(1)}s
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Sync Status Footer */}
      {syncState.lastSync && (
        <div className="p-4 bg-white dark:bg-gray-800 border-t text-center text-sm text-gray-500">
          Last synced: {formatDistanceToNow(syncState.lastSync, { addSuffix: true })}
        </div>
      )}
    </div>
  );
}