import { users, aiRequests, analytics, type User, type InsertUser, type AIRequest, type InsertRequest, type Analytics, type InsertAnalytics } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Request methods
  createRequest(request: InsertRequest & { userId: number; category: string; selectedModel: string }): Promise<AIRequest>;
  getRequest(id: number): Promise<AIRequest | undefined>;
  getUserRequests(userId: number, limit?: number): Promise<AIRequest[]>;
  updateRequestStatus(id: number, status: string, response?: string, processingTime?: number): Promise<void>;
  
  // Analytics methods
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getUserAnalytics(userId: number): Promise<Analytics[]>;
  getModelUsageStats(userId: number): Promise<{ model: string; count: number; percentage: number }[]>;
  getTotalRequests(userId: number): Promise<number>;
  getSuccessRate(userId: number): Promise<number>;
  getAverageResponseTime(userId: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private requests: Map<number, AIRequest>;
  private analytics: Map<number, Analytics>;
  private currentUserId: number;
  private currentRequestId: number;
  private currentAnalyticsId: number;

  constructor() {
    this.users = new Map();
    this.requests = new Map();
    this.analytics = new Map();
    this.currentUserId = 1;
    this.currentRequestId = 1;
    this.currentAnalyticsId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async createRequest(request: InsertRequest & { userId: number; category: string; selectedModel: string }): Promise<AIRequest> {
    const id = this.currentRequestId++;
    const aiRequest: AIRequest = {
      ...request,
      id,
      fileName: request.fileName || null,
      status: 'pending',
      response: null,
      processingTime: null,
      createdAt: new Date(),
      completedAt: null,
    };
    this.requests.set(id, aiRequest);
    return aiRequest;
  }

  async getRequest(id: number): Promise<AIRequest | undefined> {
    return this.requests.get(id);
  }

  async getUserRequests(userId: number, limit = 50): Promise<AIRequest[]> {
    return Array.from(this.requests.values())
      .filter(req => req.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async updateRequestStatus(id: number, status: string, response?: string, processingTime?: number): Promise<void> {
    const request = this.requests.get(id);
    if (request) {
      request.status = status;
      if (response) request.response = response;
      if (processingTime) request.processingTime = processingTime.toString();
      if (status === 'completed' || status === 'failed') {
        request.completedAt = new Date();
      }
      this.requests.set(id, request);
    }
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = this.currentAnalyticsId++;
    const analyticsEntry: Analytics = {
      ...insertAnalytics,
      id,
      errorType: insertAnalytics.errorType || null,
      createdAt: new Date(),
    };
    this.analytics.set(id, analyticsEntry);
    return analyticsEntry;
  }

  async getUserAnalytics(userId: number): Promise<Analytics[]> {
    return Array.from(this.analytics.values())
      .filter(analytics => analytics.userId === userId);
  }

  async getModelUsageStats(userId: number): Promise<{ model: string; count: number; percentage: number }[]> {
    const userAnalytics = await this.getUserAnalytics(userId);
    const modelCounts = new Map<string, number>();
    
    userAnalytics.forEach(analytics => {
      const count = modelCounts.get(analytics.modelUsed) || 0;
      modelCounts.set(analytics.modelUsed, count + 1);
    });

    const total = userAnalytics.length;
    return Array.from(modelCounts.entries()).map(([model, count]) => ({
      model,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  }

  async getTotalRequests(userId: number): Promise<number> {
    return Array.from(this.requests.values())
      .filter(req => req.userId === userId).length;
  }

  async getSuccessRate(userId: number): Promise<number> {
    const userAnalytics = await this.getUserAnalytics(userId);
    if (userAnalytics.length === 0) return 0;
    
    const successCount = userAnalytics.filter(analytics => analytics.success).length;
    return Math.round((successCount / userAnalytics.length) * 100);
  }

  async getAverageResponseTime(userId: number): Promise<number> {
    const userAnalytics = await this.getUserAnalytics(userId);
    if (userAnalytics.length === 0) return 0;
    
    const totalTime = userAnalytics.reduce((sum, analytics) => 
      sum + parseFloat(analytics.responseTime), 0);
    return parseFloat((totalTime / userAnalytics.length).toFixed(2));
  }
}

export const storage = new MemStorage();
