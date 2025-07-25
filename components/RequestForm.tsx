import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Upload, FileText, MessageSquare, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";

interface ProcessingResult {
  id: number;
  classification: {
    category: string;
    model: string;
    confidence: number;
    reasoning: string;
  };
  response: string;
  processingTime: number;
  status: string;
}

export default function RequestForm() {
  const [activeTab, setActiveTab] = useState<'prompt' | 'document'>('prompt');
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const promptMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', '/api/requests/prompt', { content });
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['/api/requests/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
      toast({
        title: "Processing Complete",
        description: `Request processed with ${data.classification.model} in ${data.processingTime}s`,
      });
    },
    onError: (error) => {
      toast({
        title: "Processing Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const documentMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('document', file);
      const response = await fetch('/api/requests/document', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['/api/requests/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
      toast({
        title: "Document Processed",
        description: `Document analyzed with ${data.classification.model} in ${data.processingTime}s`,
      });
    },
    onError: (error) => {
      toast({
        title: "Document Processing Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePromptSubmit = () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }
    promptMutation.mutate(prompt);
  };

  const handleDocumentSubmit = () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      });
      return;
    }
    documentMutation.mutate(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['.txt', '.pdf', '.docx'];
      const fileExt = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExt)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a TXT, PDF, or DOCX file",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const isProcessing = promptMutation.isPending || documentMutation.isPending;

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Submit Your Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                activeTab === 'prompt'
                  ? 'bg-white shadow-sm text-primary font-medium'
                  : 'text-muted-foreground hover:text-primary'
              }`}
              onClick={() => setActiveTab('prompt')}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Text Prompt
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                activeTab === 'document'
                  ? 'bg-white shadow-sm text-primary font-medium'
                  : 'text-muted-foreground hover:text-primary'
              }`}
              onClick={() => setActiveTab('document')}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Document Upload
            </button>
          </div>

          {/* Prompt Input */}
          {activeTab === 'prompt' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Enter your prompt
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="h-32 resize-none"
                  placeholder="e.g., Review this contract for compliance issues, create a marketing strategy, or debug this Python code..."
                />
              </div>
              
              {/* AI Model Indicator */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    AI Model will be auto-selected
                  </span>
                  {isProcessing && (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-secondary" />
                      <span className="text-sm text-secondary font-medium">Processing...</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={handlePromptSubmit} 
                disabled={isProcessing || !prompt.trim()}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Process with AI'
                )}
              </Button>
            </div>
          )}

          {/* Document Upload */}
          {activeTab === 'document' && (
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-secondary transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-primary mb-2">
                  {file ? file.name : 'Upload your document'}
                </p>
                <p className="text-muted-foreground mb-4">
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : 'PDF, DOCX, TXT files up to 10MB'}
                </p>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".txt,.pdf,.docx"
                  onChange={handleFileChange}
                />
                <Button variant="outline" type="button">
                  Choose File
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary">4</div>
                  <div className="text-sm text-muted-foreground">AI Models</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-accent">98%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
              </div>
              
              <Button 
                onClick={handleDocumentSubmit} 
                disabled={isProcessing || !file}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Process Document'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Processing Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-primary mb-2">Classification</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <span className="text-sm font-medium capitalize">{result.classification.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">AI Model:</span>
                  <span className="text-sm font-medium capitalize">{result.classification.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Confidence:</span>
                  <span className="text-sm font-medium">{(result.classification.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Processing Time:</span>
                  <span className="text-sm font-medium">{result.processingTime}s</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-primary mb-2">Response</h3>
              <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-700">{result.response}</pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
