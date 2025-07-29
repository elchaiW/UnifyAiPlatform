// components/ChatInterface.tsx - Complete Supabase-only implementation
import { useState, useRef, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';
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
  Loader2 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "../hooks/use-toast";
import TypingAnimation from './TypingAnimation';
import { VoiceInput } from './VoiceInput';

// Database types
interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Conversation {
  id: string;
  user_id: string;
  title: string;
  model: string;
  is_pinned: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  content: string;
  response: string | null;
  model: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_time: number | null;
  token_usage: any;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Conversation, 'id' | 'created_at' | 'updated_at'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Message, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}

const getModelImage = (model: string) => {
  switch (model.toLowerCase()) {
    case 'claude': return '/attached_assets/claude_1753267938951.webp';
    case 'chatgpt': return '/attached_assets/Chatgpt_1753267928029.webp';
    case 'gemini': return '/attached_assets/gemini_1753267772227.png';
    case 'grok': return '/attached_assets/grok_1753267912240.png';
    default: return null;
  }
};

export default function ChatInterface() {
  // State management
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<Profile | null>(null);
  
  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize Supabase client
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Load user and initialize conversation on mount
  useEffect(() => {
    initializeUser();
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      loadMessages();
      setupRealtimeSubscription();
    }
  }, [currentConversation]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize or get current user
  const initializeUser = async () => {
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        // Create demo user for development
        await createDemoUser();
        return;
      }

      if (session?.user) {
        // Get or create user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email!,
              full_name: session.user.user_metadata?.full_name || null,
              avatar_url: session.user.user_metadata?.avatar_url || null
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            return;
          }
          setUser(newProfile);
        } else if (profile) {
          setUser(profile);
        }

        // Get or create default conversation
        await getOrCreateDefaultConversation(session.user.id);
      } else {
        // No session, create demo user
        await createDemoUser();
      }
    } catch (error) {
      console.error('Error initializing user:', error);
      await createDemoUser();
    }
  };

  // Create demo user for development
  const createDemoUser = async () => {
    const demoUser: Profile = {
      id: 'demo-user-id',
      email: 'demo@luminadoc.com',
      full_name: 'Demo User',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setUser(demoUser);
    await getOrCreateDefaultConversation(demoUser.id);
  };

  // Get or create default conversation
  const getOrCreateDefaultConversation = async (userId: string) => {
    try {
      // Try to get existing conversation
      const { data: conversations, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error('Error fetching conversations:', fetchError);
        return;
      }

      if (conversations && conversations.length > 0) {
        setCurrentConversation(conversations[0]);
      } else {
        // Create new conversation
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            user_id: userId,
            title: 'New Chat',
            model: 'claude',
            is_pinned: false,
            metadata: {}
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating conversation:', createError);
          return;
        }
        setCurrentConversation(newConversation);
      }
    } catch (error) {
      console.error('Error getting/creating conversation:', error);
    }
  };

  // Load messages for current conversation
  const loadMessages = async () => {
    if (!currentConversation) return;

    setIsLoading(true);
    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', currentConversation.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
        return;
      }

      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Setup realtime subscription for messages
  const setupRealtimeSubscription = () => {
    if (!currentConversation) return;

    const subscription = supabase
      .channel(`messages:${currentConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${currentConversation.id}`,
        },
        (payload) => {
          console.log('Realtime message update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new as Message]);
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === payload.new.id ? payload.new as Message : msg
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => 
              prev.filter(msg => msg.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  // Send message function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !currentConversation || !user) return;

    const userMessage = message.trim();
    setMessage("");
    setIsTyping(true);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
    }

    try {
      // Create user message in database
      const { data: userMessageData, error: userMessageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: currentConversation.id,
          user_id: user.id,
          content: userMessage,
          response: null,
          model: 'user',
          status: 'completed',
          processing_time: null,
          token_usage: {},
          metadata: { type: 'user_message' }
        })
        .select()
        .single();

      if (userMessageError) {
        throw userMessageError;
      }

      // Create AI response message (initially processing)
      const { data: aiMessageData, error: aiMessageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: currentConversation.id,
          user_id: user.id,
          content: userMessage,
          response: null,
          model: currentConversation.model,
          status: 'processing',
          processing_time: null,
          token_usage: {},
          metadata: { type: 'ai_response', processing: true }
        })
        .select()
        .single();

      if (aiMessageError) {
        throw aiMessageError;
      }

      // Call your AI API to get response
      await processAIResponse(aiMessageData.id, userMessage);

      // Update conversation title if it's the first message
      if (messages.length === 0) {
        const title = userMessage.length > 50 
          ? userMessage.substring(0, 50) + '...' 
          : userMessage;
        
        await supabase
          .from('conversations')
          .update({ 
            title, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', currentConversation.id);
        
        setCurrentConversation(prev => prev ? { ...prev, title } : null);
      }

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

  // Process AI response
  const processAIResponse = async (messageId: string, userMessage: string) => {
    const startTime = Date.now();
    
    try {
      // Call your existing AI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          model: currentConversation?.model || 'claude',
          conversation_id: currentConversation?.id
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const processingTime = (Date.now() - startTime) / 1000;

      // Update message with response
      await supabase
        .from('messages')
        .update({
          response: data.response || data.content,
          status: 'completed',
          processing_time: processingTime,
          token_usage: data.usage || {},
          metadata: { 
            ...data.metadata,
            type: 'ai_response',
            processing: false 
          }
        })
        .eq('id', messageId);

      // Track analytics
      await supabase
        .from('analytics')
        .insert({
          user_id: user!.id,
          event_type: 'message_sent',
          model: currentConversation?.model,
          processing_time: processingTime,
          token_count: data.usage?.total_tokens || 0,
          metadata: {
            success: true,
            response_length: data.response?.length || 0
          }
        });

    } catch (error) {
      console.error('Error processing AI response:', error);
      
      // Update message with error
      await supabase
        .from('messages')
        .update({
          status: 'failed',
          metadata: { 
            type: 'ai_response',
            error: error instanceof Error ? error.message : 'Unknown error',
            processing: false 
          }
        })
        .eq('id', messageId);

      // Track failed analytics
      await supabase
        .from('analytics')
        .insert({
          user_id: user!.id,
          event_type: 'message_failed',
          model: currentConversation?.model,
          processing_time: (Date.now() - Date.now()) / 1000,
          metadata: {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
    }
  };

  // Delete message
  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('user_id', user!.id); // Ensure user can only delete their own messages

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Message deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message.",
        variant: "destructive",
      });
    }
  };

  // Clear all messages in conversation
  const clearAllMessages = async () => {
    if (!currentConversation || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', currentConversation.id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "All messages cleared successfully.",
      });
    } catch (error) {
      console.error('Error clearing messages:', error);
      toast({
        title: "Error",
        description: "Failed to clear messages.",
        variant: "destructive",
      });
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
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

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile || !currentConversation || !user) return;

    try {
      // Upload file to Supabase Storage
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(fileName, selectedFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(fileName);

      // Create message with file
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: currentConversation.id,
          user_id: user.id,
          content: `Uploaded file: ${selectedFile.name}`,
          response: null,
          model: 'file',
          status: 'completed',
          metadata: {
            type: 'file_upload',
            file_name: selectedFile.name,
            file_url: publicUrl,
            file_size: selectedFile.size,
            file_type: selectedFile.type
          }
        });

      if (messageError) {
        throw messageError;
      }

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: "Success",
        description: "File uploaded successfully.",
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file.",
        variant: "destructive",
      });
    }
  };

  // Auto-resize textarea
  const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = '40px';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    setMessage(textarea.value);
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  // Export conversation
  const exportConversation = () => {
    if (!messages.length) return;

    const conversationData = {
      title: currentConversation?.title || 'Chat Export',
      messages: messages.map(msg => ({
        timestamp: msg.created_at,
        type: msg.metadata?.type || 'message',
        content: msg.content,
        response: msg.response,
        model: msg.model
      })),
      exported_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(conversationData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading conversation...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold truncate">
            {currentConversation?.title || 'New Chat'}
          </h2>
          <Badge variant="outline" className="text-xs">
            {currentConversation?.model || 'claude'}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportConversation}
            disabled={messages.length === 0}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllMessages}
            disabled={messages.length === 0}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={msg.id} className="group">
              {msg.metadata?.type === 'user_message' ? (
                // User Message
                <div className="flex items-start space-x-3 justify-end">
                  <div className="flex-1 max-w-[80%]">
                    <div className="bg-blue-600 text-white rounded-lg p-3 ml-auto">
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <div className="flex items-center justify-end mt-1 text-xs text-muted-foreground">
                      <span>{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </div>
              ) : (
                // AI Response
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    {getModelImage(msg.model) ? (
                      <img
                        src={getModelImage(msg.model)!}
                        alt={msg.model}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 max-w-[80%]">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                      {msg.status === 'processing' ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <TypingAnimation />
                        </div>
                      ) : msg.status === 'failed' ? (
                        <div className="text-red-500">
                          <p>❌ Failed to process message</p>
                          <p className="text-xs mt-1">{msg.metadata?.error}</p>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.response || 'No response'}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {msg.model}
                        </Badge>
                        {msg.processing_time && (
                          <span>{msg.processing_time.toFixed(1)}s</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMessage(msg.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                <TypingAnimation />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t">
        {selectedFile && (
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {selectedFile.name}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFileUpload}
                  disabled={isTyping}
                >
                  Upload
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaResize}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="w-full p-3 pr-12 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
              style={{ minHeight: '40px', maxHeight: '120px' }}
              disabled={isTyping}
            />
            <div className="absolute right-2 top-2">
              <VoiceInput onTranscription={setMessage} disabled={isTyping} />
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isTyping}
            className="p-3"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Button
            type="submit"
            disabled={(!message.trim() && !selectedFile) || isTyping}
            className="p-3"
          >
            {isTyping ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}