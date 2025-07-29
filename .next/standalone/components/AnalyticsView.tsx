import { useQuery } from "@tanstack/react-query";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Activity,
  Download,
  Zap,
  Target,
  Users
} from "lucide-react";
import StorageMonitor from './StorageMonitor';

interface AnalyticsData {
  totalRequests: number;
  successRate: number;
  avgProcessingTime: number;
  modelUsage: {
    claude: number;
    chatgpt: number;
    gemini: number;
    grok: number;
  };
  categoryBreakdown: {
    legal: number;
    marketing: number;
    coding: number;
    general: number;
  };
  processingTimes: {
    model: string;
    avgTime: number;
    requestCount: number;
  }[];
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

export default function AnalyticsView() {
  // Fetch analytics from client storage
  const { data: clientStats, isLoading } = useQuery({
    queryKey: ["client-analytics"],
    queryFn: async () => {
      const { clientStorage } = await import('@/lib/clientStorage');
      return clientStorage.getAnalytics();
    },
    refetchInterval: 2000,
  });

  // Fetch history from client storage
  const { data: history = [] } = useQuery<any[]>({
    queryKey: ["client-history"],
    queryFn: async () => {
      const { clientStorage } = await import('@/lib/clientStorage');
      return clientStorage.getMessages();
    },
    refetchInterval: 2000,
  });

  // Convert client analytics to expected format
  const analytics: AnalyticsData | undefined = clientStats ? {
    totalRequests: clientStats.totalRequests,
    successRate: clientStats.successRate / 100, // Convert percentage to decimal
    avgProcessingTime: clientStats.averageResponseTime / 1000, // Convert ms to seconds
    modelUsage: {
      claude: clientStats.modelUsage.claude || 0,
      chatgpt: clientStats.modelUsage.chatgpt || 0,
      gemini: clientStats.modelUsage.gemini || 0,
      grok: clientStats.modelUsage.grok || 0,
    },
    categoryBreakdown: {
      legal: clientStats.categoryBreakdown?.legal || 0,
      marketing: clientStats.categoryBreakdown?.marketing || 0,
      coding: clientStats.categoryBreakdown?.coding || 0,
      general: clientStats.categoryBreakdown?.general || 0,
    },
    processingTimes: Object.entries(clientStats.modelUsage).map(([model, count]) => ({
      model,
      avgTime: clientStats.averageResponseTime / 1000,
      requestCount: count,
    }))
  } : undefined;

  const downloadAnalytics = () => {
    if (!analytics) return;
    
    const report = `AI Processing Analytics Report
Generated: ${new Date().toLocaleString()}

=== OVERVIEW ===
Total Requests: ${analytics.totalRequests}
Success Rate: ${Math.round(analytics.successRate * 100)}%
Average Processing Time: ${analytics.avgProcessingTime.toFixed(2)}s

=== MODEL USAGE ===
Claude: ${analytics.modelUsage.claude} requests
ChatGPT: ${analytics.modelUsage.chatgpt} requests
Gemini: ${analytics.modelUsage.gemini} requests
Grok: ${analytics.modelUsage.grok} requests

=== CATEGORY BREAKDOWN ===
Legal: ${analytics.categoryBreakdown.legal} requests
Marketing: ${analytics.categoryBreakdown.marketing} requests
Coding: ${analytics.categoryBreakdown.coding} requests
General: ${analytics.categoryBreakdown.general} requests

=== PERFORMANCE METRICS ===
${analytics.processingTimes.map(p => 
  `${p.model}: ${p.avgTime.toFixed(2)}s avg (${p.requestCount} requests)`
).join('\n')}
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai_analytics_report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6 pt-6 bg-gray-50 dark:bg-[#2A2A2A]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex-1 p-6 pt-6 bg-gray-50 dark:bg-[#2A2A2A]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No analytics data available</p>
            <p className="text-sm text-gray-500 mt-2">Process some requests to see analytics</p>
          </div>
        </div>
      </div>
    );
  }

  const totalModelRequests = Object.values(analytics.modelUsage).reduce((a, b) => a + b, 0);

  return (
    <div className="flex-1 p-3 lg:p-6 bg-gray-50 dark:bg-[#2A2A2A] overflow-y-auto pt-6 lg:pt-6">
      <div className="max-w-6xl mx-auto">
        {/* Header - Mobile responsive */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 lg:mb-8 gap-4">
          <div>
            <h1 className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1 lg:mt-2">
              Performance insights and usage statistics
            </p>
          </div>
          <Button onClick={downloadAnalytics} className="bg-blue-600 hover:bg-blue-700 w-full lg:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Overview Cards - Mobile responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
          <Card className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
                <p className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalRequests}</p>
              </div>
              <Activity className="h-6 w-6 lg:h-8 lg:w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-3xl font-bold text-green-600">{Math.round(analytics.successRate * 100)}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response Time</p>
                <p className="text-3xl font-bold text-purple-600">{analytics.avgProcessingTime.toFixed(1)}s</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Models</p>
                <p className="text-3xl font-bold text-orange-600">4</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Storage & Sync Monitor */}
        <div className="mb-8">
          <StorageMonitor />
        </div>

        {/* Model Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Model Usage Distribution
            </h3>
            <div className="space-y-4">
              {Object.entries(analytics.modelUsage).map(([model, count]) => {
                const percentage = totalModelRequests > 0 ? (count / totalModelRequests) * 100 : 0;
                return (
                  <div key={model} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 ${getModelColor(model)} rounded-full`} />
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {model}
                        </span>
                      </div>
                      <Badge variant="secondary">{count} requests</Badge>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getModelColor(model).replace('bg-', 'bg-')}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">{percentage.toFixed(1)}% of total requests</p>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Category Breakdown
            </h3>
            <div className="space-y-4">
              {Object.entries(analytics.categoryBreakdown).map(([category, count]) => {
                const totalCategoryRequests = Object.values(analytics.categoryBreakdown).reduce((a, b) => a + b, 0);
                const percentage = totalCategoryRequests > 0 ? (count / totalCategoryRequests) * 100 : 0;
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {category}
                      </span>
                      <Badge variant="outline">{count} requests</Badge>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">{percentage.toFixed(1)}% of requests</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Metrics by Model
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analytics.processingTimes.map((metric) => (
              <div key={metric.model} className="p-4 bg-gray-50 dark:bg-[#1E1E1E] rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-3 h-3 ${getModelColor(metric.model)} rounded-full`} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {metric.model}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {metric.avgTime.toFixed(1)}s
                </p>
                <p className="text-xs text-gray-500">
                  Average time ({metric.requestCount} requests)
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}