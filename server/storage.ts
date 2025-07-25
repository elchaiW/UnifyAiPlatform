import { users, aiRequests, analytics, type User, type InsertUser, type AIRequest, type InsertRequest, type Analytics, type InsertAnalytics } from "../shared/schema";
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
      completedAt: null
    };
    this.requests.set(id, aiRequest);
    return aiRequest;
  }

  async getRequest(id: number): Promise<AIRequest | undefined> {
    return this.requests.get(id);
  }

  async getUserRequests(userId: number, limit?: number): Promise<AIRequest[]> {
    const userRequests = Array.from(this.requests.values())
      .filter((request) => request.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return limit ? userRequests.slice(0, limit) : userRequests;
  }

  async updateRequestStatus(id: number, status: string, response?: string, processingTime?: number): Promise<void> {
    const request = this.requests.get(id);
    if (request) {
      request.status = status;
      if (response) request.response = response;
      if (processingTime) request.processingTime = processingTime.toString();
      if (status === 'completed') request.completedAt = new Date();
      this.requests.set(id, request);
    }
  }

  async deleteRequest(id: number): Promise<void> {
    this.requests.delete(id);
  }

  async deleteAllUserRequests(userId: number): Promise<void> {
    for (const [id, request] of this.requests.entries()) {
      if (request.userId === userId) {
        this.requests.delete(id);
      }
    }
  }

  async createAnalytics(analytics: InsertAnalytics): Promise<Analytics> {
    const id = this.currentAnalyticsId++;
    const analyticsRecord: Analytics = {
      ...analytics,
      id,
      createdAt: new Date()
    };
    this.analytics.set(id, analyticsRecord);
    return analyticsRecord;
  }

  async getUserAnalytics(userId: number): Promise<Analytics[]> {
    return Array.from(this.analytics.values())
      .filter((record) => record.userId === userId);
  }

  async getModelUsageStats(userId: number): Promise<{ model: string; count: number; percentage: number }[]> {
    const userAnalytics = await this.getUserAnalytics(userId);
    const modelCounts: Record<string, number> = {};
    
    userAnalytics.forEach((record) => {
      modelCounts[record.modelUsed] = (modelCounts[record.modelUsed] || 0) + 1;
    });
    
    const total = userAnalytics.length;
    if (total === 0) return [];
    
    return Object.entries(modelCounts).map(([model, count]) => ({
      model,
      count,
      percentage: Math.round((count / total) * 100)
    }));
  }

  async getTotalRequests(userId: number): Promise<number> {
    return (await this.getUserRequests(userId)).length;
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
    for (const [id, record] of this.analytics.entries()) {
      if (record.userId === userId) {
        this.analytics.delete(id);
      }
    }
  }
}

// Database Storage Implementation using Supabase PostgreSQL
export class DatabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    let connectionString = process.env.DATABASE_URL;
    
    // Handle URL encoding for special characters in password
    if (connectionString.includes('[') && connectionString.includes(']')) {
      // Extract and encode the password portion
      const regex = /postgresql:\/\/([^:]+):\[([^\]]+)\]@(.+)/;
      const match = connectionString.match(regex);
      if (match) {
        const [, username, password, hostAndDb] = match;
        const encodedPassword = encodeURIComponent(password);
        connectionString = `postgresql://${username}:${encodedPassword}@${hostAndDb}`;
        console.log('🔗 Encoded Supabase connection string for special characters');
      }
    }
    
    try {
      console.log('🔗 Connecting to Supabase PostgreSQL...');
      const client = postgres(connectionString, {
        prepare: false,
        ssl: 'require',
        connection: {
          TimeZone: 'UTC',
        },
      });
      this.db = drizzle(client);
      console.log('✅ Supabase PostgreSQL connected successfully');
    } catch (error) {
      console.error('❌ Failed to connect to Supabase:', error);
      throw error;
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }

  async createRequest(request: InsertRequest & { userId: number; category: string; selectedModel: string }): Promise<AIRequest> {
    const result = await this.db.insert(aiRequests).values({
      ...request,
      fileName: request.fileName || null,
      status: 'pending'
    }).returning();
    return result[0];
  }

  async getRequest(id: number): Promise<AIRequest | undefined> {
    const result = await this.db.select().from(aiRequests).where(eq(aiRequests.id, id)).limit(1);
    return result[0];
  }

  async getUserRequests(userId: number, limit: number = 50): Promise<AIRequest[]> {
    return await this.db.select().from(aiRequests)
      .where(eq(aiRequests.userId, userId))
      .orderBy(desc(aiRequests.createdAt))
      .limit(limit);
  }

  async updateRequestStatus(id: number, status: string, response?: string, processingTime?: number): Promise<void> {
    const updateData: any = { 
      status,
      ...(response && { response }),
      ...(processingTime && { processingTime: processingTime.toString() }),
      ...(status === 'completed' && { completedAt: new Date() })
    };
    
    await this.db.update(aiRequests).set(updateData).where(eq(aiRequests.id, id));
  }

  async deleteRequest(id: number): Promise<void> {
    await this.db.delete(aiRequests).where(eq(aiRequests.id, id));
  }

  async deleteAllUserRequests(userId: number): Promise<void> {
    await this.db.delete(aiRequests).where(eq(aiRequests.userId, userId));
  }

  async createAnalytics(analyticsData: InsertAnalytics): Promise<Analytics> {
    const result = await this.db.insert(analytics).values({
      ...analyticsData,
      responseTime: analyticsData.responseTime.toString()
    }).returning();
    return result[0];
  }

  async getUserAnalytics(userId: number): Promise<Analytics[]> {
    return await this.db.select().from(analytics)
      .where(eq(analytics.userId, userId))
      .orderBy(desc(analytics.createdAt));
  }

  async getModelUsageStats(userId: number): Promise<{ model: string; count: number; percentage: number }[]> {
    const userAnalytics = await this.getUserAnalytics(userId);
    const modelCounts: Record<string, number> = {};
    
    userAnalytics.forEach((record) => {
      modelCounts[record.modelUsed] = (modelCounts[record.modelUsed] || 0) + 1;
    });
    
    const total = userAnalytics.length;
    if (total === 0) return [];
    
    return Object.entries(modelCounts).map(([model, count]) => ({
      model,
      count,
      percentage: Math.round((count / total) * 100)
    }));
  }

  async getTotalRequests(userId: number): Promise<number> {
    return (await this.getUserRequests(userId)).length;
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

// Initialize storage with error handling and async fallback
async function createStorageAsync(): Promise<IStorage> {
  if (!process.env.DATABASE_URL) {
    console.log('📝 Using in-memory storage (development mode)');
    return new MemStorage();
  }
  
  try {
    console.log('🚀 Attempting to connect to Supabase...');
    const dbStorage = new DatabaseStorage();
    // Test the connection with a simple query
    await dbStorage.getUserByUsername("test-connection");
    console.log('✅ Supabase connection verified');
    return dbStorage;
  } catch (error) {
    console.error('⚠️  Supabase connection failed, falling back to in-memory storage:', error);
    return new MemStorage();
  }
}

// Create storage synchronously first, then replace asynchronously
let storage: IStorage = new MemStorage();

// Initialize proper storage
createStorageAsync().then(newStorage => {
  storage = newStorage;
  console.log('🔄 Storage system initialized');
}).catch(error => {
  console.error('Failed to initialize storage:', error);
});

export { storage };

// Create a singleton function to ensure demo user is only created once
let demoUserInitialized = false;
export async function ensureDemoUser() {
  if (demoUserInitialized) return;
  
  try {
    let demoUser = await storage.getUserByUsername("demo");
    if (!demoUser) {
      console.log('🔧 Initializing demo user...');
      demoUser = await storage.createUser({
        username: "demo",
        email: "demo@example.com",
        password: "demo123"
      });
      console.log('✅ Demo user created with ID:', demoUser.id);
    }
    demoUserInitialized = true;
  } catch (error) {
    console.error('Failed to initialize demo user:', error);
  }
}