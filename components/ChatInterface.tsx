import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { createSupabaseClient } from "@/lib/supabase";
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
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch messages from Supabase
  const { data: messages = [], isLoading, error, refetch } = useQuery<Message[]>({
    queryKey: ['/api/requests/history'],
    enabled: true,
    refetchInterval: 5000,
  });

  // File reading utility
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const sendMessage = useMutation({
    mutationKey: ['send-message'],
    mutationFn: async ({ message, file }: { message: string; file?: File }) => {
      console.log('🚀 Starting message send process...');
      
      let requestBody: any = { message };
      
      if (file) {
        const fileContent = await readFileContent(file);
        requestBody.file = {
          name: file.name,
          type: file.type,
          size: file.size,
          content: fileContent
        };
      }

      console.log('📡 Sending request to /api/requests...');
      const response = await apiRequest('POST', '/api/requests', requestBody);
      return await response.json();
    },
    onSuccess: (data) => {
      console.log('✅ Message processed successfully:', data);
      
      // Clear form and refresh
      setMessage("");
      setSelectedFile(null);
      setIsTyping(false);
      
      // Invalidate and refetch messages
      queryClient.invalidateQueries({ queryKey: ['/api/requests/history'] });
      
      toast({
        title: "Message sent successfully",
        description: `Processed by ${data.model} in ${data.processing_time?.toFixed(1) || 0}s`,
      });
    },
    onError: (error) => {
      console.error('❌ Error sending message:', error);
      setIsTyping(false);
      toast({
        title: "Error sending message",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  const deleteMessage = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await apiRequest('DELETE', `/api/requests/${messageId}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/requests/history'] });
      toast({
        title: "Message deleted",
        description: "The message has been removed from your history.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting message",
        description: error instanceof Error ? error.message : "Failed to delete message",
        variant: "destructive",
      });
    },
  });

  const clearAllHistory = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', '/api/requests/history/clear');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/requests/history'] });
      toast({
        title: "History cleared",
        description: "All messages have been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error clearing history",
        description: error instanceof Error ? error.message : "Failed to clear history",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = async () => {
    if (!message.trim() && !selectedFile) return;

    setIsTyping(true);
    sendMessage.mutate({
      message: message.trim(),
      file: selectedFile || undefined,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = '40px';
    const scrollHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = scrollHeight + 'px';
  };

  const downloadResponse = (msg: Message) => {
    if (!msg.response) return;
    
    const content = `AI Response from ${msg.model}
Generated: ${new Date(msg.created_at).toLocaleString()}

Request: ${msg.content}
${msg.metadata?.fileName ? `File: ${msg.metadata.fileName}` : ''}

Response:
${msg.response}

Classification Details:
- Model: ${msg.model}
- Processing Time: ${msg.processing_time?.toFixed(2)}s
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${msg.model}_response_${msg.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleVoiceTranscription = (transcription: string) => {
    setMessage(transcription);
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Auto-resize textarea
      textareaRef.current.style.height = '40px';
      const scrollHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = scrollHeight + 'px';
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#2A2A2A] relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pt-4 pb-32 lg:pb-24 lg:pt-8">
        <div className="max-w-3xl mx-auto">
          {/* Welcome Message */}
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
              <h2 className="text-2xl lg:text-3xl font-medium text-gray-900 dark:text-white mb-2 lg:mb-3 text-center">
                Ask anything
              </h2>
              <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-8 lg:mb-12 text-center max-w-lg">
                Your intelligent AI assistant that automatically routes to the best model
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="px-4 lg:px-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="group/message mb-6">
                <div className="flex items-start gap-3">
                  {/* User icon and message */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">You</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {message.content}
                      {message.metadata?.fileName && (
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <FileText className="w-3 h-3" />
                          <span>{message.metadata.fileName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Response */}
                {message.response && (
                  <div className="mt-4 flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      {getModelImage(message.model) ? (
                        <img 
                          src={getModelImage(message.model)!} 
                          alt={message.model}
                          className="w-6 h-6 object-contain"
                        />
                      ) : (
                        <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {message.model.toUpperCase()}
                        </Badge>
                        {message.processing_time && (
                          <span className="text-xs text-muted-foreground">
                            {message.processing_time.toFixed(1)}s
                          </span>
                        )}
                      </div>
                      <div className="text-sm prose dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap">{message.response}</div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 opacity-0 group-hover/message:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadResponse(message)}
                          className="h-7 px-2 text-xs"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMessage.mutate(message.id)}
                          className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Animation */}
            {isTyping && (
              <div className="flex items-start gap-3 mb-6">
                <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <TypingAnimation />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Fixed Input Area at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#2A2A2A] border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto p-4 lg:p-6">
          {/* File Preview */}
          {selectedFile && (
            <div className="mb-3 flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-800 dark:text-blue-200 flex-1 truncate">
                {selectedFile.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Input Area */}
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleInputChange}
                  placeholder="Fai una domanda..."
                  className="w-full px-4 py-3 pr-20 bg-gray-100 dark:bg-gray-800 border-0 rounded-2xl resize-none text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  style={{ minHeight: '48px', maxHeight: '120px', fontSize: '16px' }}
                  rows={1}
                  disabled={sendMessage.isPending}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <VoiceInput onTranscription={handleVoiceTranscription} />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={(!message.trim() && !selectedFile) || sendMessage.isPending}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    {sendMessage.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-7 px-2 text-xs"
                >
                  <Paperclip className="w-3 h-3 mr-1" />
                  Attach
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".txt,.md,.doc,.docx,.pdf"
                  className="hidden"
                />
              </div>
              <div className="flex items-center gap-2">
                <span>{messages.length} messages</span>
                {messages.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => clearAllHistory.mutate()}
                    className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}