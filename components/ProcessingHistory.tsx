import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Download, Eye, FileText } from "lucide-react";

interface HistoryItem {
  id: number;
  type: string;
  content: string;
  fileName?: string;
  category: string;
  selectedModel: string;
  status: string;
  response?: string;
  processingTime?: string;
  createdAt: string;
  completedAt?: string;
}

const getStatusClassName = (status: string) => {
  switch (status) {
    case 'pending': return 'status-pending';
    case 'processing': return 'status-processing';
    case 'completed': return 'status-completed';
    case 'failed': return 'status-failed';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getModelClassName = (model: string) => {
  switch (model) {
    case 'claude': return 'model-badge-claude';
    case 'chatgpt': return 'model-badge-chatgpt';
    case 'gemini': return 'model-badge-gemini';
    case 'grok': return 'model-badge-grok';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function ProcessingHistory() {
  const { data: history, isLoading, error } = useQuery<HistoryItem[]>({
    queryKey: ["/api/requests/history"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const downloadResponse = (item: HistoryItem) => {
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
- Completed: ${item.completedAt ? new Date(item.completedAt).toLocaleString() : 'N/A'}

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Failed to load processing history</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Processing History</CardTitle>
        {history && history.length > 0 && (
          <Button variant="ghost" size="sm">
            View All
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {history && history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Request</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">AI Model</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Time</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-4 px-4">
                      <div className="text-sm text-primary">
                        {item.fileName ? (
                          <span>{item.fileName}</span>
                        ) : (
                          <span className="truncate max-w-xs">
                            {item.content.length > 50 
                              ? `${item.content.substring(0, 50)}...` 
                              : item.content
                            }
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {item.category}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getModelClassName(item.selectedModel)}>
                        {item.selectedModel}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground capitalize">
                      {item.type}
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusClassName(item.status)}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        {item.status === 'completed' && item.response && (
                          <>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh]">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    AI Response - {item.selectedModel} 
                                    <Badge className={getModelClassName(item.selectedModel)}>
                                      {item.selectedModel}
                                    </Badge>
                                  </DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">Classification Details:</h4>
                                      <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                        <p><strong>Category:</strong> {item.category}</p>
                                        <p><strong>Selected Model:</strong> {item.selectedModel}</p>
                                        <p><strong>Processing Time:</strong> {item.processingTime}s</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">Original Request:</h4>
                                      <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                        {item.content}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">AI Response:</h4>
                                      <div className="prose prose-sm max-w-none">
                                        <pre className="whitespace-pre-wrap text-sm">{item.response}</pre>
                                      </div>
                                    </div>
                                  </div>
                                </ScrollArea>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => downloadResponse(item)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No processing history yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Submit a prompt or upload a document to get started
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
