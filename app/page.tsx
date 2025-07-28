'use client';

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, FileText, Bot, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClassificationResult {
  category: string;
  selectedModel: string;
  confidence: number;
  reasoning: string;
}

interface Message {
  id: string;
  content: string;
  response?: string;
  status: 'processing' | 'completed' | 'failed';
  classification?: ClassificationResult;
  timestamp: Date;
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

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isProcessing) return;

    const currentMessage = message.trim();
    setMessage("");
    setIsProcessing(true);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      status: 'processing',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Send to API
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: currentMessage }),
      });

      const result = await response.json();

      if (response.ok) {
        // Update message with response
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id 
            ? { 
                ...msg, 
                response: result.response,
                status: 'completed',
                classification: result.classification
              }
            : msg
        ));
        
        toast({
          title: "Success",
          description: `Response generated using ${result.classification?.selectedModel || 'AI'}`,
        });
      } else {
        // Handle error
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'failed' }
            : msg
        ));
        
        toast({
          title: "Error",
          description: result.error || "Failed to process request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, status: 'failed' }
          : msg
      ));
      
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <img 
              src="/luminadoc-logo.png" 
              alt="LUMINADOC" 
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">LUMINADOC</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Multi-AI Assistant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6 mb-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Welcome to LUMINADOC
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Ask me anything! I'll automatically route your request to the best AI model 
                (Claude, ChatGPT, Gemini, or Grok) based on your content.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className="space-y-4">
              {/* User Message */}
              <div className="flex items-start space-x-3 justify-end">
                <div className="flex flex-col space-y-1 max-w-[80%]">
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-md px-4 py-2">
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <div className="text-xs text-gray-500 text-right">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>

              {/* AI Response */}
              {msg.status === 'processing' && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 border rounded-2xl rounded-tl-md px-4 py-2">
                    <p className="text-sm text-gray-500">Processing your request...</p>
                  </div>
                </div>
              )}

              {msg.response && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    {getModelImage(msg.classification?.selectedModel || '') ? (
                      <img 
                        src={getModelImage(msg.classification?.selectedModel || '')!} 
                        alt={msg.classification?.selectedModel}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex flex-col space-y-2 max-w-[80%]">
                    {msg.classification && (
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {msg.classification.selectedModel}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {msg.classification.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {(msg.classification.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                    )}
                    <div className="bg-white dark:bg-gray-800 border rounded-2xl rounded-tl-md px-4 py-2">
                      <p className="text-sm whitespace-pre-wrap">{msg.response}</p>
                    </div>
                  </div>
                </div>
              )}

              {msg.status === 'failed' && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl rounded-tl-md px-4 py-2">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Failed to process your request. Please try again.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="min-h-[60px] resize-none border-0 focus:ring-0 p-0"
                disabled={isProcessing}
              />
            </div>
            <Button
              type="submit"
              disabled={!message.trim() || isProcessing}
              className="px-6 py-2 h-auto"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}