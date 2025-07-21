import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Download, 
  Eye, 
  FileText, 
  MessageSquare,
  Filter,
  Calendar,
  Clock,
  User
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface HistoryItem {
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

interface HistoryViewProps {
  onLoadConversation?: (conversationId: number) => void;
}

export default function HistoryView({ onLoadConversation }: HistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModel, setFilterModel] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: history = [], isLoading } = useQuery<HistoryItem[]>({
    queryKey: ["/api/requests/history"],
    refetchInterval: 5000,
  });

  const filteredHistory = history.filter(item => {
    const matchesSearch = !searchTerm || 
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.fileName && item.fileName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesModel = filterModel === "all" || item.selectedModel === filterModel;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    
    return matchesSearch && matchesModel && matchesStatus;
  });

  const downloadItem = (item: HistoryItem) => {
    if (!item.response) return;
    
    const content = `AI Processing Result
===============================================

Request Details:
- ID: ${item.id}
- Type: ${item.type}
- File: ${item.fileName || 'Text prompt'}
- Category: ${item.category}
- AI Model: ${item.selectedModel}
- Status: ${item.status}
- Processing Time: ${item.processingTime}s
- Created: ${format(new Date(item.createdAt), 'PPpp')}

Original Request:
${item.content}

AI Response:
===============================================
${item.response}

${item.classification ? `
Classification Details:
- Category: ${item.classification.category}
- Model: ${item.classification.model}
- Confidence: ${Math.round(item.classification.confidence * 100)}%
- Reasoning: ${item.classification.reasoning}
` : ''}
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

  const downloadAllHistory = () => {
    const csvContent = [
      'ID,Date,Type,Content,File Name,Category,Model,Status,Processing Time,Response Length',
      ...filteredHistory.map(item => 
        `${item.id},"${format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm:ss')}","${item.type}","${item.content.replace(/"/g, '""')}","${item.fileName || ''}","${item.category}","${item.selectedModel}","${item.status}","${item.processingTime}s","${item.response ? item.response.length : 0} chars"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai_processing_history_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600 dark:text-gray-400">Loading history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Processing History</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View and manage all your AI processing requests
            </p>
          </div>
          <Button onClick={downloadAllHistory} className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export All ({filteredHistory.length})
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select 
                value={filterModel}
                onChange={(e) => setFilterModel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">All Models</option>
                <option value="claude">Claude</option>
                <option value="chatgpt">ChatGPT</option>
                <option value="gemini">Gemini</option>
                <option value="grok">Grok</option>
              </select>
              
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </Card>

        {/* History List */}
        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <Card className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No requests found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || filterModel !== "all" || filterStatus !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Start a conversation to see your processing history here"
                }
              </p>
            </Card>
          ) : (
            filteredHistory.map((item) => (
              <Card key={item.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        {item.type === 'document' ? (
                          <FileText className="h-5 w-5 text-gray-500" />
                        ) : (
                          <MessageSquare className="h-5 w-5 text-gray-500" />
                        )}
                        <div className={`w-3 h-3 ${getModelColor(item.selectedModel)} rounded-full`} />
                      </div>
                      
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                      
                      <Badge variant="outline" className="text-xs">
                        {item.selectedModel}
                      </Badge>
                      
                      {item.processingTime && (
                        <Badge variant="secondary" className="text-xs">
                          {item.processingTime}s
                        </Badge>
                      )}
                    </div>

                    <div className="mb-3">
                      {item.fileName && (
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                          📄 {item.fileName}
                        </p>
                      )}
                      <p className="text-gray-900 dark:text-gray-100 line-clamp-2">
                        {item.content}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(item.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {onLoadConversation && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onLoadConversation(item.id)}
                        className="text-xs"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Load Chat
                      </Button>
                    )}
                    {item.status === 'completed' && item.response && (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <div className={`w-6 h-6 ${getModelColor(item.selectedModel)} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                                  {item.selectedModel[0].toUpperCase()}
                                </div>
                                Response Details - Request #{item.id}
                              </DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Request Info:</h4>
                                  <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                                    <p><strong>Type:</strong> {item.type}</p>
                                    <p><strong>Category:</strong> {item.category}</p>
                                    <p><strong>Model:</strong> {item.selectedModel}</p>
                                    <p><strong>Processing Time:</strong> {item.processingTime}s</p>
                                    <p><strong>Created:</strong> {format(new Date(item.createdAt), 'PPpp')}</p>
                                  </div>
                                </div>
                                
                                {item.fileName && (
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-700 mb-2">File:</h4>
                                    <div className="bg-blue-50 p-3 rounded-lg text-sm">
                                      {item.fileName}
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Original Request:</h4>
                                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                    {item.content}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700 mb-2">AI Response:</h4>
                                  <div className="prose prose-sm max-w-none">
                                    <pre className="whitespace-pre-wrap text-sm bg-white p-3 rounded-lg border">
                                      {item.response}
                                    </pre>
                                  </div>
                                </div>

                                {item.classification && (
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Classification:</h4>
                                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                      <p><strong>Confidence:</strong> {Math.round(item.classification.confidence * 100)}%</p>
                                      <p><strong>Reasoning:</strong> {item.classification.reasoning}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>

                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => downloadItem(item)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}