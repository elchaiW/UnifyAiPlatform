// Enhanced ChatInterface with real-time Supabase synchronization
'use client';

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { 
  Send, 
  Paperclip, 
  FileText, 
  User, 
  Bot, 
  Download, 
  Trash2, 
  X, 
  Eye,
  Loader2,
  Wifi,
  WifiOff
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "../hooks/use-toast";
import TypingAnimation from './TypingAnimation';
import { VoiceInput } from './VoiceInput';
import { useAuth } from './AuthProvider';
import { useConversations, useMessages, useSupabaseSync } from '@/hooks/useSupabaseSync';
import { enhancedStorage } from '@/lib/enhanced-storage';
import { Message, Conversation } from '@/shared/schema';

const getModelImage = (model: string) => {
  switch (model.toLowerCase()) {
    case 'claude': return '/attached_assets/claude_1753267938951.webp';
    case 'chatgpt': return '/attached_assets/Chatgpt_1753267928029.webp';
    case 'gemini': return '/attached_assets/gemini_1753267772227.png';
    case 'grok': return '/attached_assets/grok_1753267912240.png';
    default: return null;
  }
};

export default function ChatInterfaceSupabase() {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Supabase hooks
  const { conversations, createConversation, loading: conversationsLoading } = useConversations();
  const { messages, createMessage, updateMessage, loading: messagesLoading } = useMessages(currentConversationId);
  const { syncState, syncLocalData } = useSupabaseSync();

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

  // Initialize conversation and sync local data
  useEffect(() => {
    const initializeChat = async () => {
      if (!user) return;

      // Create default conversation if none exists
      if (conversations.length === 0 && !conversationsLoading) {
        const newConversation = await createConversation(
          'Chat History',
          'openai',
          { isDefault: true }
        );
        if (newConversation) {
          setCurrentConversationId(newConversation.id);
        }
      } else if (conversations.length > 0 && !currentConversationId) {
        setCurrentConversationId(conversations[0].id);
      }

      // Sync local data to Supabase on first load
      const localData = enhancedStorage.getLocalData();
      if (localData.messages.length > 0 && enhancedStorage.needsSync()) {
        await syncLocalData(localData.messages);
      }
    };

    initializeChat();
  }, [user, conversations, conversationsLoading, currentConversationId, createConversation, syncLocalData]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() && !selectedFile) return;
    if (!currentConversationId) return;

    const messageText = message.trim();
    setMessage("");
    setSelectedFile(null);
    setIsTyping(true);

    try {
      // Create message with content
      const newMessage = await createMessage(
        messageText,
        'openai', // Default model, can be made dynamic
        undefined, // Response will be added after AI processing
        undefined, // Processing time will be updated
        { hasFile: !!selectedFile, fileName: selectedFile?.name }
      );

      if (!newMessage) {
        throw new Error('Failed to create message');
      }

      // Process AI request
      const formData = new FormData();
      formData.append('content', messageText);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await fetch('/api/requests', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process AI request');
      }

      const result = await response.json();
      
      // Update message with response
      await updateMessage(newMessage.id, {
        response: result.response,
        status: 'completed',
        processing_time: result.processing_time,
        metadata: { 
          ...newMessage.metadata, 
          model: result.model,
          confidence: result.confidence 
        }
      });

      // Track analytics
      await enhancedStorage.trackEvent({
        type: 'message_sent',
        model: result.model,
        processingTime: result.processing_time,
        hasFile: !!selectedFile
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await enhancedStorage.deleteMessage(messageId);
      toast({
        title: "Message deleted",
        description: "Message has been removed from your chat history.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          Please sign in to start chatting
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header with sync status */}
      <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold">Chat</h2>
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
        
        {syncState.isLoading && (
          <div className="flex items-center space-x-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs">Syncing...</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messagesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading messages...</span>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                {/* User message */}
                <div className="flex items-start justify-end space-x-2">
                  <div className="flex flex-col items-end space-y-1 max-w-[80%]">
                    <div className="bg-blue-500 text-white rounded-2xl rounded-tr-md px-4 py-2">
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                        onClick={() => handleDeleteMessage(msg.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </div>

                {/* AI response */}
                {msg.response && (
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      {getModelImage(msg.model) ? (
                        <img 
                          src={getModelImage(msg.model)!} 
                          alt={msg.model}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex flex-col space-y-1 max-w-[80%]">
                      <div className="bg-white dark:bg-gray-800 border rounded-2xl rounded-tl-md px-4 py-2">
                        <p className="text-sm whitespace-pre-wrap">{msg.response}</p>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Badge variant="outline" className="text-xs">
                          {msg.model}
                        </Badge>
                        {msg.processing_time && (
                          <span>{(msg.processing_time / 1000).toFixed(1)}s</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-white dark:bg-gray-800 border rounded-2xl rounded-tl-md px-4 py-2">
                <TypingAnimation />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t">
        {selectedFile && (
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800 dark:text-blue-200">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-blue-600">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-end space-x-2">
          <div className="flex-1 min-h-[48px] bg-gray-100 dark:bg-gray-700 rounded-full flex items-center px-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Fai una domanda..."
              className="flex-1 bg-transparent border-none outline-none resize-none py-3 px-2 text-sm max-h-32 scrollbar-hide"
              rows={1}
            />
            
            <VoiceInput
              onTranscription={(text) => setMessage(prev => prev + ' ' + text)}
            />
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={(!message.trim() && !selectedFile) || isTyping}
            className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept=".txt,.pdf,.docx,.doc"
          className="hidden"
        />
      </div>
    </div>
  );
}