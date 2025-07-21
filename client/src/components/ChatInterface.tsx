import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Send, Upload, Download, Eye, Loader2, Bot, User, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { Plus } from "lucide-react";

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  fileName?: string;
  category?: string;
  selectedModel?: string;
  status?: string;
  response?: string;
  processingTime?: string;
  createdAt: string;
  classification?: {
    category: string;
    model: string;
    confidence: number;
    reasoning: string;
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
    default: return 'A';
  }
};

interface ChatInterfaceProps {
  conversationId?: number | null;
  onNewChat?: () => void;
}

export default function ChatInterface({ conversationId, onNewChat }: ChatInterfaceProps = {}) {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/requests/history"],
    refetchInterval: 3000,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      setSelectedFile(file);
    } else {
      alert('Please upload a text file (.txt, .md)');
    }
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      const response = await fetch("/api/requests/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests/history"] });
      setMessage(""); // Clear input field after sending
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: (formData: FormData) =>
      fetch("/api/requests/document", { method: "POST", body: formData }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests/history"] });
      setSelectedFile(null); // Clear file after upload
      setMessage(""); // Clear message field too
    },
  });

  const handleSendMessage = () => {
    if (!message.trim() && !selectedFile) return;

    if (selectedFile) {
      const formData = new FormData();
      formData.append("document", selectedFile);
      uploadFileMutation.mutate(formData);
    } else {
      sendMessageMutation.mutate({ content: message });
    }
  };

  const downloadResponse = (item: Message) => {
    if (!item.response) return;
    
    const content = `AI Processing Result
===============================================

Request Details:
- File: ${item.fileName || 'Text prompt'}
- Category: ${item.category}
- AI Model: ${item.selectedModel}
- Status: ${item.status}
- Processing Time: ${item.processingTime}s
- Created: ${new Date(item.createdAt).toLocaleString()}

Original Request:
${item.content}

AI Response:
===============================================
${item.response}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.selectedModel}_response_${item.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className={`flex flex-col h-screen bg-gray-50 dark:bg-gray-900 flex-1 min-w-0 relative ${
        isDragOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <Upload className="h-12 w-12 text-blue-500 mx-auto mb-2" />
            <p className="text-lg font-semibold text-gray-900 dark:text-white">Drop your file here</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Supports .txt and .md files</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-800 px-4 lg:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
              Multi-AI Assistant
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Intelligent routing to Claude, ChatGPT, Gemini, and Grok
            </p>
          </div>
          {onNewChat && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMessage("");
                setSelectedFile(null);
                onNewChat();
              }}
              className="flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Chat</span>
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6">
        <div className="max-w-4xl mx-auto py-4 lg:py-6 space-y-4 lg:space-y-6">
          {/* Welcome Message */}
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Welcome to Multi-AI Assistant
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                Send a message or upload a document, and I'll automatically route it to the best AI model for your needs.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 max-w-2xl mx-auto">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mb-2">C</div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">Claude</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Legal & Compliance</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mb-2">G</div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">ChatGPT</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">General Knowledge</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mb-2">G</div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">Gemini</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Marketing Strategy</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mb-2">X</div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">Grok</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Coding & Tech</p>
                </div>
              </div>
            </div>
          )}

          {/* Messages - Show newest messages at bottom */}
          {messages.slice().reverse().map((msg) => (
            <div key={msg.id} className="space-y-4">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-3xl">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      <div className="bg-blue-500 text-white p-4 rounded-2xl rounded-tr-md">
                        {msg.fileName && (
                          <div className="flex items-center space-x-2 mb-2 text-blue-100">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{msg.fileName}</span>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      <User className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex justify-start">
                <div className="max-w-3xl w-full">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 ${getModelColor(msg.selectedModel || '')} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                      {getModelIcon(msg.selectedModel || '')}
                    </div>
                    <div className="flex-1">
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 p-4 rounded-2xl rounded-tl-md">
                        {/* Classification Info */}
                        {msg.classification && (
                          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Badge className={getModelColor(msg.selectedModel || '')} variant="secondary">
                                  {msg.selectedModel}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(msg.classification.confidence * 100)}% confidence
                                </Badge>
                              </div>
                            </div>
                            <p className="text-xs text-gray-700 dark:text-gray-300">
                              <strong>Reasoning:</strong> {msg.classification.reasoning}
                            </p>
                          </div>
                        )}

                        {/* Response Content */}
                        {msg.status === 'processing' && (
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Processing with {msg.selectedModel}...</span>
                          </div>
                        )}

                        {msg.status === 'completed' && msg.response && (
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <div className="whitespace-pre-wrap font-sans text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
                              {msg.response}
                            </div>
                          </div>
                        )}

                        {msg.status === 'failed' && (
                          <div className="text-red-600 dark:text-red-400">
                            <p>Processing failed. Please try again.</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {msg.status === 'completed' && msg.response && (
                          <div className="flex items-center space-x-2 mt-3 pt-3 border-t">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 text-xs">
                                  <Eye className="h-3 w-3 mr-1" />
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh]">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <div className={`w-6 h-6 ${getModelColor(msg.selectedModel || '')} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                                      {getModelIcon(msg.selectedModel || '')}
                                    </div>
                                    {msg.selectedModel} Response Details
                                  </DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Classification:</h4>
                                      <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                        <p><strong>Category:</strong> {msg.category}</p>
                                        <p><strong>Model:</strong> {msg.selectedModel}</p>
                                        <p><strong>Confidence:</strong> {msg.classification ? Math.round(msg.classification.confidence * 100) : 'N/A'}%</p>
                                        <p><strong>Processing Time:</strong> {msg.processingTime}s</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Original Request:</h4>
                                      <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                        {msg.content}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-gray-700 mb-2">AI Response:</h4>
                                      <div className="prose prose-sm max-w-none">
                                        <pre className="whitespace-pre-wrap text-sm">{msg.response}</pre>
                                      </div>
                                    </div>
                                  </div>
                                </ScrollArea>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 text-xs"
                              onClick={() => downloadResponse(msg)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                            <span className="text-xs text-gray-500">
                              {msg.processingTime}s
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Loading State */}
          {(sendMessageMutation.isPending || uploadFileMutation.isPending) && (
            <div className="flex justify-start">
              <div className="max-w-3xl w-full">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-white dark:bg-gray-800 border p-4 rounded-2xl rounded-tl-md">
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <span>Analyzing and routing to best AI model...</span>
                      </div>
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

      {/* Input Area - Positioned prominently */}
      <div className="border-t bg-white dark:bg-gray-800 px-4 lg:px-6 py-4 lg:py-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus-within:shadow-md focus-within:border-blue-500 transition-all">
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
                    ×
                  </Button>
                </div>
              </div>
            )}
            <div className="flex items-end space-x-3 p-3">
              <div className="flex-1">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={selectedFile ? "Add a message about your file..." : "Send a message or upload a document..."}
                  className="min-h-[60px] max-h-[200px] resize-none border-0 focus:ring-0 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
              </div>
              <div className="flex items-center space-x-2 pb-2">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  accept=".txt,.pdf,.docx,.md"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="h-10 w-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-600"
                  title="Upload file"
                >
                  <Upload className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() && !selectedFile}
                  className="h-10 w-10 p-0 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600"
                  title="Send message"
                >
                  <Send className="h-5 w-5 text-white" />
                </Button>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            AI will automatically select the best model: Claude, ChatGPT, Gemini, or Grok
          </p>
        </div>
      </div>
    </div>
  );
}