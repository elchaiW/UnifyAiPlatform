import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useQuery } from "@tanstack/react-query";

interface AnalyticsData {
  totalRequests: number;
  thisMonth: number;
  averageResponseTime: number;
  successRate: number;
  modelUsageStats: { model: string; count: number; percentage: number }[];
}

const modelColors: Record<string, string> = {
  claude: "bg-blue-500",
  chatgpt: "bg-green-500", 
  gemini: "bg-purple-500",
  grok: "bg-orange-500"
};

export default function AnalyticsCards() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  if (isLoading) {
    return (
      <div className="grid lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Requests</span>
            <span className="text-2xl font-bold text-primary">{analytics.totalRequests.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">This Month</span>
            <span className="text-2xl font-bold text-accent">{analytics.thisMonth.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Average Response Time</span>
            <span className="text-lg font-semibold text-primary">{analytics.averageResponseTime}s</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Success Rate</span>
            <span className="text-lg font-semibold text-accent">{analytics.successRate}%</span>
          </div>
        </CardContent>
      </Card>

      {/* AI Model Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">AI Model Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analytics.modelUsageStats.length > 0 ? (
            analytics.modelUsageStats.map((stat) => (
              <div key={stat.model} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 ${modelColors[stat.model] || 'bg-gray-500'} rounded-full`}></div>
                  <span className="text-muted-foreground capitalize">{stat.model}</span>
                </div>
                <span className="font-semibold text-primary">{stat.percentage}%</span>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No usage data available</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analytics.totalRequests > 0 ? (
            <>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-primary">Processing requests actively</p>
                  <p className="text-xs text-muted-foreground">System operational</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-primary">Analytics data updated</p>
                  <p className="text-xs text-muted-foreground">Real-time sync active</p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
