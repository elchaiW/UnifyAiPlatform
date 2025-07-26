import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

// Database Storage Implementation
export class DatabaseStorage {
  // User operations
  async createUser(data: schema.InsertUser): Promise<schema.SelectUser> {
    const [user] = await db.insert(schema.users).values(data).returning();
    console.log(`👤 Created user ${user.id} with email ${user.email}`);
    return user;
  }

  async getUserBySupabaseId(supabaseId: string): Promise<schema.SelectUser | null> {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.supabaseId, supabaseId))
      .limit(1);
    return user || null;
  }

  async getUserById(id: number): Promise<schema.SelectUser | null> {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    return user || null;
  }

  async updateUser(id: number, data: Partial<schema.InsertUser>): Promise<schema.SelectUser | null> {
    const [user] = await db
      .update(schema.users)
      .set(data)
      .where(eq(schema.users.id, id))
      .returning();
    return user || null;
  }

  // Request operations
  async createRequest(data: schema.InsertRequest): Promise<schema.SelectRequest> {
    const [request] = await db.insert(schema.requests).values(data).returning();
    console.log(`📝 Created request ${request.id} for user ${request.userId}`);
    return request;
  }

  async getRequest(id: number): Promise<schema.SelectRequest | null> {
    const [request] = await db
      .select()
      .from(schema.requests)
      .where(eq(schema.requests.id, id))
      .limit(1);
    return request || null;
  }

  async getAllRequests(userId: number, limit = 50): Promise<schema.SelectRequest[]> {
    const requests = await db
      .select()
      .from(schema.requests)
      .where(eq(schema.requests.userId, userId))
      .orderBy(asc(schema.requests.createdAt))
      .limit(limit)
      .execute();
    
    console.log(`📱 History: Found ${requests.length} messages for user ${userId}`);
    return requests;
  }

  async updateRequest(id: number, data: Partial<schema.InsertRequest>): Promise<schema.SelectRequest | null> {
    const [request] = await db
      .update(schema.requests)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.requests.id, id))
      .returning();
    
    if (request) {
      console.log(`📝 Updated request ${request.id}`);
    }
    return request || null;
  }

  async deleteRequest(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(schema.requests)
      .where(and(eq(schema.requests.id, id), eq(schema.requests.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async deleteAllRequests(userId: number): Promise<boolean> {
    const result = await db
      .delete(schema.requests)
      .where(eq(schema.requests.userId, userId));
    console.log(`🗑️ Deleted ${result.rowCount ?? 0} requests for user ${userId}`);
    return (result.rowCount ?? 0) > 0;
  }

  // Analytics operations
  async getAnalyticsStats(userId?: number) {
    const requests = userId 
      ? await db.select().from(schema.requests).where(eq(schema.requests.userId, userId))
      : await db.select().from(schema.requests);
    const totalRequests = requests.length;
    
    // Calculate average processing time
    const processingTimes = requests
      .filter(req => req.processingTime)
      .map(req => req.processingTime!);
    const averageProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length 
      : 0;

    // Model usage statistics
    const modelUsageStats: Record<string, number> = {};
    requests.forEach(req => {
      if (req.selectedModel) {
        modelUsageStats[req.selectedModel] = (modelUsageStats[req.selectedModel] || 0) + 1;
      }
    });

    // Success rate calculation
    const successfulRequests = requests.filter(req => req.status === 'completed').length;
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;

    return {
      totalRequests,
      averageProcessingTime,
      modelUsageStats,
      successRate,
    };
  }
}

// Import required functions
import { eq, and, asc } from 'drizzle-orm';

// Export singleton instance
export const dbStorage = new DatabaseStorage();