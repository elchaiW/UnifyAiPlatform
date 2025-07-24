import { users, aiRequests, analytics, type User, type InsertUser, type AIRequest, type InsertRequest, type Analytics, type InsertAnalytics } from "@shared/schema";
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, desc } from 'drizzle-orm';

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
  deleteRequest(id: number): Promise<void>;
  deleteAllUserRequests(userId: number): Promise<void>;
  
  // Analytics methods
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getUserAnalytics(userId: number): Promise<Analytics[]>;
  getModelUsageStats(userId: number): Promise<{ model: string; count: number; percentage: number }[]>;
  getTotalRequests(userId: number): Promise<number>;
  getSuccessRate(userId: number): Promise<number>;
  getAverageResponseTime(userId: number): Promise<number>;
  deleteAllUserAnalytics(userId: number): Promise<void>;
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
      classification: null,
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

  async deleteRequest(id: number): Promise<void> {
    this.requests.delete(id);
    // Also delete related analytics
    const analyticsToDelete = Array.from(this.analytics.entries())
      .filter(([_, analytics]) => analytics.requestId === id)
      .map(([analyticsId, _]) => analyticsId);
    
    analyticsToDelete.forEach(analyticsId => this.analytics.delete(analyticsId));
  }

  async deleteAllUserRequests(userId: number): Promise<void> {
    // Get all request IDs for this user
    const userRequestIds = Array.from(this.requests.values())
      .filter(req => req.userId === userId)
      .map(req => req.id);
    
    // Delete all requests
    userRequestIds.forEach(requestId => this.requests.delete(requestId));
    
    // Delete all related analytics
    const analyticsToDelete = Array.from(this.analytics.entries())
      .filter(([_, analytics]) => userRequestIds.includes(analytics.requestId))
      .map(([analyticsId, _]) => analyticsId);
    
    analyticsToDelete.forEach(analyticsId => this.analytics.delete(analyticsId));
  }

  async deleteAllUserAnalytics(userId: number): Promise<void> {
    const analyticsToDelete = Array.from(this.analytics.entries())
      .filter(([_, analytics]) => analytics.userId === userId)
      .map(([analyticsId, _]) => analyticsId);
    
    analyticsToDelete.forEach(analyticsId => this.analytics.delete(analyticsId));
  }
}

// PostgreSQL Storage Implementation  
export class PostgreSQLStorage implements IStorage {
  private db: any;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is required for PostgreSQL storage');
    }
    
    const sql = postgres(connectionString, { 
      ssl: { rejectUnauthorized: false },
      max: 10
    });
    this.db = drizzle(sql);
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.db.insert(users).values(insertUser).returning();
    return user;
  }

  async createRequest(request: InsertRequest & { userId: number; category: string; selectedModel: string }): Promise<AIRequest> {
    const [aiRequest] = await this.db.insert(aiRequests).values({
      userId: request.userId,
      type: request.type,
      content: request.content,
      fileName: request.fileName || null,
      category: request.category,
      selectedModel: request.selectedModel,
      status: 'pending',
      classification: null
    }).returning();
    return aiRequest;
  }

  async getRequest(id: number): Promise<AIRequest | undefined> {
    const result = await this.db.select().from(aiRequests).where(eq(aiRequests.id, id)).limit(1);
    return result[0];
  }

  async getUserRequests(userId: number, limit = 10): Promise<AIRequest[]> {
    return await this.db.select().from(aiRequests)
      .where(eq(aiRequests.userId, userId))
      .orderBy(desc(aiRequests.createdAt))
      .limit(limit);
  }

  async updateRequestStatus(id: number, status: string, response?: string, processingTime?: number): Promise<void> {
    const updateData: any = { status };
    if (response !== undefined) updateData.response = response;
    if (processingTime !== undefined) updateData.processingTime = processingTime.toString();
    if (status === 'completed') updateData.completedAt = new Date();
    
    await this.db.update(aiRequests).set(updateData).where(eq(aiRequests.id, id));
  }

  async deleteRequest(id: number): Promise<void> {
    // Delete analytics first (foreign key constraint)
    await this.db.delete(analytics).where(eq(analytics.requestId, id));
    // Then delete the request
    await this.db.delete(aiRequests).where(eq(aiRequests.id, id));
  }

  async deleteAllUserRequests(userId: number): Promise<void> {
    // Delete analytics first
    await this.db.delete(analytics).where(eq(analytics.userId, userId));
    // Then delete requests
    await this.db.delete(aiRequests).where(eq(aiRequests.userId, userId));
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const [analyticsRecord] = await this.db.insert(analytics).values({
      userId: insertAnalytics.userId,
      requestId: insertAnalytics.requestId,
      modelUsed: insertAnalytics.modelUsed,
      responseTime: insertAnalytics.responseTime,
      success: insertAnalytics.success,
      errorType: insertAnalytics.errorType || null
    }).returning();
    return analyticsRecord;
  }

  async getUserAnalytics(userId: number): Promise<Analytics[]> {
    return await this.db.select().from(analytics)
      .where(eq(analytics.userId, userId))
      .orderBy(desc(analytics.createdAt));
  }

  async getModelUsageStats(userId: number): Promise<{ model: string; count: number; percentage: number }[]> {
    const userAnalytics = await this.getUserAnalytics(userId);
    const modelCounts = new Map<string, number>();
    
    userAnalytics.forEach(record => {
      const count = modelCounts.get(record.modelUsed) || 0;
      modelCounts.set(record.modelUsed, count + 1);
    });

    const total = userAnalytics.length;
    return Array.from(modelCounts.entries()).map(([model, count]) => ({
      model,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  }

  async getTotalRequests(userId: number): Promise<number> {
    const result = await this.db.select().from(aiRequests).where(eq(aiRequests.userId, userId));
    return result.length;
  }

  async getSuccessRate(userId: number): Promise<number> {
    const userAnalytics = await this.getUserAnalytics(userId);
    if (userAnalytics.length === 0) return 0;
    
    const successCount = userAnalytics.filter(record => record.success).length;
    return Math.round((successCount / userAnalytics.length) * 100);
  }

  async getAverageResponseTime(userId: number): Promise<number> {
    const userAnalytics = await this.getUserAnalytics(userId);
    if (userAnalytics.length === 0) return 0;
    
    const totalTime = userAnalytics.reduce((sum, record) => 
      sum + parseFloat(record.responseTime.toString()), 0);
    return parseFloat((totalTime / userAnalytics.length).toFixed(2));
  }

  async deleteAllUserAnalytics(userId: number): Promise<void> {
    await this.db.delete(analytics).where(eq(analytics.userId, userId));
  }
}

// Create storage with error handling
let storage: IStorage;
try {
  // Check if we have a proper PostgreSQL DATABASE_URL (not Supabase)
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && dbUrl.startsWith('postgres')) {
    console.log('Attempting to connect to PostgreSQL...');
    storage = new PostgreSQLStorage();
    console.log('✅ PostgreSQL storage initialized');
  } else {
    console.log('⚠️  Using in-memory storage (PostgreSQL DATABASE_URL not found)');
    storage = new MemStorage();
  }
} catch (error) {
  console.log('⚠️  PostgreSQL connection failed, falling back to memory storage');
  console.log('Error:', (error as Error).message);
  storage = new MemStorage();
}

export { storage };
