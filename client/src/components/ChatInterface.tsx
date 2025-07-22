import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  type: 'prompt' | 'document';
  content: string;
  fileName?: string;
  category: string;
  selectedModel: string;
  status: string;
  response?: string;
  processingTime?: string;
  createdAt: string;
  classification?: {
    category: string;
    model: string;
    confidence: number;
    reasoning: string;
    keyTopics?: string[];
    documentType?: string;
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

const getModelIcon = (model: string) => {
  switch (model) {
    case 'claude': return 'C';
    case 'chatgpt': return 'G';
    case 'gemini': return 'G';
    case 'grok': return 'X';
    default: return '?';
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

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/requests/history"],
    refetchInterval: 3000,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type: 'prompt' }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests/history"] });
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = '24px';
      }
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
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload file');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests/history"] });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      const response = await fetch(`/api/requests/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete message');
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
    } else if (message.trim()) {
      sendMessageMutation.mutate(message);
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
    textarea.style.height = '24px';
    const scrollHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = scrollHeight + 'px';
  };

  const downloadResponse = (msg: Message) => {
    if (!msg.response) return;
    
    const content = `AI Response from ${msg.selectedModel}
Generated: ${new Date(msg.createdAt).toLocaleString()}

Request: ${msg.content}
${msg.fileName ? `File: ${msg.fileName}` : ''}

Response:
${msg.response}

${msg.classification ? `
Classification Details:
- Category: ${msg.classification.category}
- Model: ${msg.classification.model}
- Confidence: ${Math.round(msg.classification.confidence * 100)}%
- Reasoning: ${msg.classification.reasoning}
` : ''}
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
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900">
      {/* ChatGPT-style Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {/* Welcome Message - ChatGPT style */}
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-6 flex items-center justify-center shadow-lg">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
                How can I help you today?
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
                I'll automatically route your message to the best AI model for optimal results.
              </p>
              
              {/* ChatGPT-style suggestion cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mb-8">
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">C</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">Claude</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Legal documents & compliance analysis</p>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">ChatGPT</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">General questions & content creation</p>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">Gemini</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Marketing strategies & business plans</p>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">X</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">Grok</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Code debugging & technical analysis</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ChatGPT-style Messages */}
          <div className="px-4 space-y-6 pb-6">
            {messages.slice().reverse().map((msg) => (
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
                      <p className="text-gray-900 dark:text-white text-sm lg:text-base">{msg.content}</p>
                    </div>
                  </div>
                </div>

                {/* AI Response - ChatGPT style */}
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 ${getModelColor(msg.selectedModel || '')} rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                    {getModelIcon(msg.selectedModel || '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Enhanced Classification Info */}
                    {msg.classification && (
                      <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {msg.category || msg.classification.category}
                          </Badge>
                          <Badge variant="outline">
                            {Math.round(msg.classification.confidence * 100)}% confidence
                          </Badge>
                          {msg.classification.documentType && (
                            <Badge variant="outline" className="text-xs">
                              {msg.classification.documentType}
                            </Badge>
                          )}
                        </div>
                        
                        {msg.classification.keyTopics && msg.classification.keyTopics.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Key Topics:</p>
                            <div className="flex flex-wrap gap-1">
                              {msg.classification.keyTopics.map((topic: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <details className="text-xs text-gray-600 dark:text-gray-400">
                          <summary className="cursor-pointer hover:text-gray-900 dark:hover:text-white">
                            Analysis reasoning
                          </summary>
                          <p className="mt-2 text-xs">{msg.classification.reasoning}</p>
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

          {/* Loading State */}
          {(sendMessageMutation.isPending || uploadFileMutation.isPending) && (
            <div className="px-4 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                </div>
                <div className="flex-1">
                  <div className="bg-transparent">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <span>Analyzing and routing to best AI model...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scroll anchor for auto-scroll */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ChatGPT-style Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-4 safe-area-pb">
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm focus-within:shadow-md transition-all">
            {selectedFile && (
              <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-900 dark:text-blue-100">{selectedFile.name}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedFile(null)}
                    className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-end space-x-3 p-4">
              <div className="flex-1 min-w-0">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleInputChange}
                  placeholder="Message Multi-AI Assistant..."
                  className="w-full resize-none border-0 bg-transparent text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none min-h-[24px] max-h-[120px] py-2"
                  style={{ height: '24px' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
              </div>
              
              {/* File Upload & Send Buttons */}
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".txt,.docx,.pdf"
                  className="hidden"
                />
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 w-8 p-0"
                  disabled={sendMessageMutation.isPending || uploadFileMutation.isPending}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <Button
                  type="submit"
                  size="sm"
                  disabled={(!message.trim() && !selectedFile) || sendMessageMutation.isPending || uploadFileMutation.isPending}
                  className="h-8 w-8 p-0 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                >
                  {(sendMessageMutation.isPending || uploadFileMutation.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}