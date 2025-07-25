import { users, aiRequests, analytics, type User, type InsertUser, type AIRequest, type InsertRequest, type Analytics, type InsertAnalytics } from "../shared/schema.js";
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

// Supabase Storage Implementation  
export class SupabaseStorage implements IStorage {
  private db: any;
  private connectionString: string;
  private initialized: boolean = false;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is required for Supabase storage');
    }
    
    // Handle URL encoding for special characters in password
    let processedUrl = connectionString;
    
    // If the URL contains unencoded special characters in password, fix them
    if (connectionString.includes('[') && connectionString.includes(']')) {
      // Extract password between brackets and URL encode it
      const match = connectionString.match(/postgresql:\/\/postgres:(\[.*?\])@(.*)/);
      if (match) {
        const password = match[1].slice(1, -1); // Remove brackets
        const encodedPassword = encodeURIComponent(password);
        processedUrl = `postgresql://postgres:${encodedPassword}@${match[2]}`;
      }
    }
    
    this.connectionString = processedUrl;
    // Don't initialize connection in constructor to avoid startup crashes
  }

  private async ensureConnection() {
    if (!this.initialized) {
      try {
        const sql = postgres(this.connectionString, { 
          ssl: { rejectUnauthorized: false },
          max: 10,
          connect_timeout: 5,
          idle_timeout: 20,
          max_lifetime: 60 * 30,
          onnotice: () => {}, // Suppress notices
          debug: false
        });
        this.db = drizzle(sql);
        this.initialized = true;
      } catch (error) {
        console.log('Supabase connection failed, operations will fail:', (error as Error).message);
        throw error;
      }
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    await this.ensureConnection();
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    await this.ensureConnection();
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    await this.ensureConnection();
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

async function initializeStorage() {
  try {
    // Check if we have a proper Supabase DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && (dbUrl.startsWith('postgres') || dbUrl.includes('supabase.co'))) {
      console.log('Attempting to connect to Supabase...');
      console.log('DATABASE_URL detected:', dbUrl.substring(0, 30) + '...');
      
      // Check if it's a proper PostgreSQL connection string
      if (dbUrl.startsWith('postgres')) {
        try {
          const supabaseStorage = new SupabaseStorage();
          // Test the connection with a simple query
          await supabaseStorage.getUser(1); // Test connection with a simple query
          storage = supabaseStorage;
          console.log('✅ Supabase storage connected successfully');
          return;
        } catch (connectionError) {
          console.log('⚠️  Supabase connection test failed:', (connectionError as Error).message);
        }
      } else {
        console.log('⚠️  Invalid DATABASE_URL format. Need PostgreSQL connection string like: postgresql://postgres.[REF]:[PASSWORD]@...');
      }
    } else {
      console.log('⚠️  No DATABASE_URL found');
    }
  } catch (error) {
    console.log('⚠️  Storage initialization error:', (error as Error).message);
  }
  
  // Fallback to memory storage
  console.log('🔄 Using in-memory storage as fallback');
  storage = new MemStorage();
}

// Create a wrapper that gracefully handles Supabase connection failures
class SafeSupabaseStorage implements IStorage {
  private supabaseStorage: SupabaseStorage | null = null;
  private memStorage: MemStorage;
  private connectionFailed = false;

  constructor() {
    this.memStorage = new MemStorage();
    
    // Try to create Supabase storage
    try {
      this.supabaseStorage = new SupabaseStorage();
    } catch (error) {
      console.log('⚠️  Supabase storage creation failed, using memory storage');
      this.connectionFailed = true;
    }
  }

  private async safeExecute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.connectionFailed || !this.supabaseStorage) {
      // Fallback to memory storage
      return operation.call(this.memStorage);
    }

    try {
      return await operation.call(this.supabaseStorage);
    } catch (error) {
      console.log('Supabase operation failed, falling back to memory storage:', (error as Error).message);
      this.connectionFailed = true;
      return operation.call(this.memStorage);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.safeExecute(() => this.supabaseStorage?.getUser(id) || this.memStorage.getUser(id));
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.safeExecute(() => this.supabaseStorage?.getUserByUsername(username) || this.memStorage.getUserByUsername(username));
  }

  async createUser(user: InsertUser): Promise<User> {
    return this.safeExecute(() => this.supabaseStorage?.createUser(user) || this.memStorage.createUser(user));
  }

  async createRequest(request: InsertRequest & { userId: number; category: string; selectedModel: string }): Promise<AIRequest> {
    return this.safeExecute(() => this.supabaseStorage?.createRequest(request) || this.memStorage.createRequest(request));
  }

  async getRequest(id: number): Promise<AIRequest | undefined> {
    return this.safeExecute(() => this.supabaseStorage?.getRequest(id) || this.memStorage.getRequest(id));
  }

  async getUserRequests(userId: number, limit?: number): Promise<AIRequest[]> {
    return this.safeExecute(() => this.supabaseStorage?.getUserRequests(userId, limit) || this.memStorage.getUserRequests(userId, limit));
  }

  async updateRequestStatus(id: number, status: string, response?: string, processingTime?: number): Promise<void> {
    return this.safeExecute(() => this.supabaseStorage?.updateRequestStatus(id, status, response, processingTime) || this.memStorage.updateRequestStatus(id, status, response, processingTime));
  }

  async deleteRequest(id: number): Promise<void> {
    return this.safeExecute(() => this.supabaseStorage?.deleteRequest(id) || this.memStorage.deleteRequest(id));
  }

  async deleteAllUserRequests(userId: number): Promise<void> {
    return this.safeExecute(() => this.supabaseStorage?.deleteAllUserRequests(userId) || this.memStorage.deleteAllUserRequests(userId));
  }

  async createAnalytics(analytics: InsertAnalytics): Promise<Analytics> {
    return this.safeExecute(() => this.supabaseStorage?.createAnalytics(analytics) || this.memStorage.createAnalytics(analytics));
  }

  async getUserAnalytics(userId: number): Promise<Analytics[]> {
    return this.safeExecute(() => this.supabaseStorage?.getUserAnalytics(userId) || this.memStorage.getUserAnalytics(userId));
  }

  async getModelUsageStats(userId: number): Promise<{ model: string; count: number; percentage: number }[]> {
    return this.safeExecute(() => this.supabaseStorage?.getModelUsageStats(userId) || this.memStorage.getModelUsageStats(userId));
  }

  async getTotalRequests(userId: number): Promise<number> {
    return this.safeExecute(() => this.supabaseStorage?.getTotalRequests(userId) || this.memStorage.getTotalRequests(userId));
  }

  async getSuccessRate(userId: number): Promise<number> {
    return this.safeExecute(() => this.supabaseStorage?.getSuccessRate(userId) || this.memStorage.getSuccessRate(userId));
  }

  async getAverageResponseTime(userId: number): Promise<number> {
    return this.safeExecute(() => this.supabaseStorage?.getAverageResponseTime(userId) || this.memStorage.getAverageResponseTime(userId));
  }

  async deleteAllUserAnalytics(userId: number): Promise<void> {
    return this.safeExecute(() => this.supabaseStorage?.deleteAllUserAnalytics(userId) || this.memStorage.deleteAllUserAnalytics(userId));
  }
}

// Initialize storage with immediate fallback to prevent startup crashes
const dbUrl = process.env.DATABASE_URL;
if (dbUrl && dbUrl.startsWith('postgres')) {
  console.log('DATABASE_URL detected for Supabase:', dbUrl.substring(0, 30) + '...');
  
  // Check if hostname is reachable (basic validation)
  const hostname = dbUrl.match(/@([^:\/]+)/)?.[1];
  if (hostname?.includes('supabase.co')) {
    console.log('⚠️  Supabase hostname detected but may not be accessible');
    console.log('🔄 Using in-memory storage to prevent connection issues');
    storage = new MemStorage();
  } else {
    console.log('🔄 Using in-memory storage (unknown hostname format)');
    storage = new MemStorage();
  }
} else {
  console.log('🔄 Using in-memory storage (no valid DATABASE_URL)');
  storage = new MemStorage();
}

export { storage };
