import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  id: number;
  userId: number;
  prompt: string;
  selectedModel: string;
  status: string;
  confidence: number;
  reasoning: string;
  createdAt: string;
  updatedAt: string;
  response?: string;
  processingTime?: number;
  fileName?: string;
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch messages with explicit queryFn using authenticated API client
  const { data: messages = [], isLoading, error, refetch } = useQuery<Message[]>({
    queryKey: ["requests-history"],
    queryFn: async () => {
      const { apiClient } = await import('@/lib/apiClient');
      return apiClient.get('/api/requests/history');
    },
    refetchInterval: 2000, // Faster refresh
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache
  });

  // Debug: Log messages to console
  useEffect(() => {
    console.log('ChatInterface - Messages updated:', messages);
    console.log('ChatInterface - Message count:', messages.length);
    if (error) console.error('Query error:', error);
  }, [messages, error]);



  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const { apiClient } = await import('@/lib/apiClient');
      return apiClient.post('/api/requests', { content, type: 'prompt' });
    },
    onSuccess: () => {
      // Force immediate refetch of messages
      queryClient.invalidateQueries({ queryKey: ["requests-history"] });
      queryClient.refetchQueries({ queryKey: ["requests-history"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const { apiClient } = await import('@/lib/apiClient');
      // For file uploads, we need to handle FormData differently
      const response = await apiClient.makeRequest('/api/requests/document', {
        method: 'POST',
        body: formData
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests/history"] });
      // File already cleared in handleSubmit for immediate feedback
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete message mutation
  const deleteRequestMutation = useMutation({
    mutationFn: async (id: number) => {
      const { apiClient } = await import('@/lib/apiClient');
      return apiClient.delete(`/api/requests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests/history"] });
      toast({
        title: "Success",
        description: "Message deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      uploadFileMutation.mutate(formData);
      setSelectedFile(null); // Clear immediately
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else if (message.trim()) {
      const messageToSend = message;
      setMessage(""); // Clear immediately
      if (textareaRef.current) textareaRef.current.style.height = '40px';
      sendMessageMutation.mutate(messageToSend);
    }
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
    
    const content = `AI Response from ${msg.selectedModel}
Generated: ${new Date(msg.createdAt).toLocaleString()}

Request: ${msg.prompt}
${msg.fileName ? `File: ${msg.fileName}` : ''}

Response:
${msg.response}

Classification Details:
- Model: ${msg.selectedModel}
- Confidence: ${Math.round(msg.confidence)}%
- Reasoning: ${msg.reasoning}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${msg.selectedModel}_response_${msg.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#2A2A2A] relative">
      {/* ChatGPT-style Messages Area with Fixed Bottom Space */}
      <div className="flex-1 overflow-y-auto pt-4 pb-32 lg:pb-24 lg:pt-8 mobile-messages-top">
        <div className="max-w-3xl mx-auto">
          {/* Welcome Message - ChatGPT style */}
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
              <h2 className="text-2xl lg:text-3xl font-medium text-gray-900 dark:text-white mb-2 lg:mb-3 text-center">
                Ask anything
              </h2>
              <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-8 lg:mb-12 text-center max-w-lg">
                Your intelligent AI assistant that automatically routes to the best model
              </p>
              
              {/* Perplexity-style suggestion cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 w-full max-w-4xl mb-6 lg:mb-8">
                <div className="bg-gray-50 dark:bg-[#1E1E1E] rounded-lg p-3 lg:p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group">
                  <div className="flex flex-col items-center text-center space-y-1 lg:space-y-2">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg overflow-hidden group-hover:scale-105 transition-transform">
                      <img 
                        src="/attached_assets/claude_1753267938951.webp" 
                        alt="Claude" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-xs lg:text-sm">Claude</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Legal & Analysis</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-[#1E1E1E] rounded-lg p-3 lg:p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group">
                  <div className="flex flex-col items-center text-center space-y-1 lg:space-y-2">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg overflow-hidden group-hover:scale-105 transition-transform">
                      <img 
                        src="/attached_assets/Chatgpt_1753267928029.webp" 
                        alt="ChatGPT" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-xs lg:text-sm">ChatGPT</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">General & Creative</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-[#1E1E1E] rounded-lg p-3 lg:p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group">
                  <div className="flex flex-col items-center text-center space-y-1 lg:space-y-2">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg overflow-hidden group-hover:scale-105 transition-transform">
                      <img 
                        src="/attached_assets/gemini_1753267772227.png" 
                        alt="Gemini" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-xs lg:text-sm">Gemini</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Marketing & Business</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-[#1E1E1E] rounded-lg p-3 lg:p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group">
                  <div className="flex flex-col items-center text-center space-y-1 lg:space-y-2">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg overflow-hidden group-hover:scale-105 transition-transform">
                      <img 
                        src="/attached_assets/grok_1753267912240.png" 
                        alt="Grok" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-xs lg:text-sm">Grok</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Code & Technical</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Perplexity-style Messages */}
          <div className="px-6 space-y-8 pb-6 pt-4">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-4">
                {/* User Message - ChatGPT style */}
                <div className="flex justify-end">
                  <div className="max-w-[80%]">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                      {msg.fileName && (
                        <div className="flex items-center space-x-2 mb-2 text-gray-600 dark:text-gray-400">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{msg.fileName}</span>
                        </div>
                      )}
                      <p className="text-gray-900 dark:text-white text-sm lg:text-base">{msg.prompt}</p>
                    </div>
                  </div>
                </div>

                {/* AI Response - with custom model images */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {getModelImage(msg.selectedModel || '') ? (
                      <img 
                        src={getModelImage(msg.selectedModel || '') || ''} 
                        alt={msg.selectedModel || 'AI Model'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                        ?
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Enhanced Classification Info */}
                    {msg.confidence && msg.reasoning && (
                      <div className="mb-3 p-3 bg-gray-50 dark:bg-[#1E1E1E] rounded-lg border">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {msg.selectedModel}
                          </Badge>
                          <Badge variant="outline">
                            {Math.round(msg.confidence)}% confidence
                          </Badge>
                        </div>
                        
                        <details className="text-xs text-gray-600 dark:text-gray-400">
                          <summary className="cursor-pointer hover:text-gray-900 dark:hover:text-white">
                            Analysis reasoning
                          </summary>
                          <p className="mt-2 text-xs">{msg.reasoning}</p>
                        </details>
                      </div>
                    )}

                    {/* AI Response Content */}
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <p className="text-gray-900 dark:text-white text-sm lg:text-base whitespace-pre-wrap">
                        {msg.response}
                      </p>
                    </div>

                    {/* Response Actions */}
                    <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 flex-1">
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => downloadResponse(msg)}
                        className="h-8 px-2"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this message?")) {
                            deleteRequestMutation.mutate(msg.id);
                          }
                        }}
                        className="h-8 px-2 text-red-600 hover:text-red-700"
                        disabled={deleteRequestMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading State with ChatGPT-style typing animation */}
          {(sendMessageMutation.isPending || uploadFileMutation.isPending) && (
            <TypingAnimation text="Generating response..." />
          )}

          {/* Scroll anchor for auto-scroll */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Modern AI Chat Input Area - Dark Theme - Fixed Position */}
      <div className="fixed bottom-4 left-0 right-0 lg:left-80 bg-[#2A2A2A] px-4 py-4 safe-area-pb z-20 chat-input-fixed">
        <div className="max-w-4xl mx-auto">
          {selectedFile && (
            <div className="mb-3">
              <div className="flex items-center justify-between bg-[#1E1E1E] rounded-lg p-3 border border-gray-700">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-gray-300">{selectedFile.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedFile(null)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="relative bg-[#1E1E1E] rounded-3xl border border-gray-700 shadow-lg hover:border-gray-600 transition-all duration-200">
              <div className="flex items-center px-3 lg:px-4 py-2 lg:py-4 min-h-[40px] lg:min-h-[56px]">
                {/* Mobile Hamburger Menu Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const event = new CustomEvent('toggleMobileSidebar');
                    window.dispatchEvent(event);
                  }}
                  className="lg:hidden h-7 w-7 p-0 mr-2 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white border-none"
                  disabled={sendMessageMutation.isPending || uploadFileMutation.isPending}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
                
                {/* File Upload Button - Desktop Only - Centered Plus */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="hidden lg:flex h-9 w-9 p-0 mr-3 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white border-none items-center justify-center"
                  disabled={sendMessageMutation.isPending || uploadFileMutation.isPending}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </Button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".txt,.docx,.pdf"
                  className="hidden"
                />

                {/* Text Input */}
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleInputChange}
                    placeholder="Ask a question or share a document"
                    className="w-full resize-none bg-transparent text-gray-100 placeholder-gray-400 border-none outline-none focus:ring-0 text-sm lg:text-base leading-relaxed min-h-[24px] lg:min-h-[28px] max-h-32 py-2 lg:py-3"
                    style={{ fontSize: '16px' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    rows={1}
                  />
                </div>

                {/* Right Side Controls */}
                <div className="flex items-center space-x-1 lg:space-x-2 ml-2 lg:ml-3">
                  {/* Voice Input Component */}
                  <VoiceInput 
                    onTranscription={(text) => {
                      setMessage(text);
                      setTimeout(() => textareaRef.current?.focus(), 100);
                    }}
                    disabled={sendMessageMutation.isPending || uploadFileMutation.isPending}
                  />

                  {/* File Upload Button - Mobile Only */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="lg:hidden h-7 w-7 p-0 rounded-full text-gray-400 hover:text-white hover:bg-gray-700"
                    disabled={sendMessageMutation.isPending || uploadFileMutation.isPending}
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </Button>

                  {/* Send Button */}
                  <Button
                    type="submit"
                    size="sm"
                    disabled={(!message.trim() && !selectedFile) || sendMessageMutation.isPending || uploadFileMutation.isPending}
                    className="h-7 w-7 lg:h-9 lg:w-9 p-0 rounded-full bg-white text-gray-900 hover:bg-gray-100 disabled:bg-gray-600 disabled:text-gray-400 border-none"
                  >
                    {(sendMessageMutation.isPending || uploadFileMutation.isPending) ? (
                      <Loader2 className="h-3 w-3 lg:h-4 lg:w-4 animate-spin" />
                    ) : (
                      <Send className="h-3 w-3 lg:h-4 lg:w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}