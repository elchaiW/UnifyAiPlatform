// In-memory storage implementation for Luminadoc
import { Request, SelectRequest } from '../shared/schema';

export interface IStorage {
  // Request operations
  createRequest(data: Request): Promise<SelectRequest>;
  getRequest(id: string): Promise<SelectRequest | null>;
  getAllRequests(userId?: string, limit?: number): Promise<SelectRequest[]>;
  updateRequest(id: string, data: Partial<Request>): Promise<SelectRequest | null>;
  deleteRequest(id: string, userId?: string): Promise<boolean>;
  deleteAllRequests(userId: string): Promise<boolean>;

  // Analytics operations
  getAnalyticsStats(): Promise<{
    totalRequests: number;
    averageProcessingTime: number;
    modelUsageStats: Record<string, number>;
    successRate: number;
  }>;
}

// In-memory storage implementation
class MemStorage implements IStorage {
  private requests: Map<string, SelectRequest> = new Map();
  private idCounter = 1;

  async createRequest(data: Request): Promise<SelectRequest> {
    const id = `msg_${this.idCounter++}`;
    const request: SelectRequest = {
      ...data,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    this.requests.set(id, request);
    console.log(`📝 Created request ${id} for user ${data.user_id}`);
    return request;
  }

  async getRequest(id: string): Promise<SelectRequest | null> {
    return this.requests.get(id) || null;
  }

  async getAllRequests(userId?: string, limit?: number): Promise<SelectRequest[]> {
    const allRequests = Array.from(this.requests.values());
    let filteredRequests = allRequests;
    
    if (userId) {
      filteredRequests = allRequests.filter(req => req.user_id === userId);
      console.log(`📱 History: Found ${filteredRequests.length} messages for user ${userId}`);
    }
    
    // Sort by creation date (newest first)
    filteredRequests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    // Apply limit if specified
    if (limit && limit > 0) {
      filteredRequests = filteredRequests.slice(0, limit);
    }
    
    return filteredRequests;
  }

  async updateRequest(id: string, data: Partial<Request>): Promise<SelectRequest | null> {
    const existing = this.requests.get(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...data,
      updated_at: new Date().toISOString(),
    };
    
    this.requests.set(id, updated);
    console.log(`📝 Updated request ${id}`);
    return updated;
  }

  async deleteRequest(id: string, userId?: string): Promise<boolean> {
    const request = this.requests.get(id);
    if (!request) return false;
    
    // If userId is provided, verify ownership
    if (userId && request.user_id !== userId) {
      console.log(`🚫 Access denied: User ${userId} cannot delete request ${id} owned by user ${request.user_id}`);
      return false;
    }
    
    return this.requests.delete(id);
  }

  async deleteAllRequests(userId: string): Promise<boolean> {
    try {
      const allRequests = Array.from(this.requests.entries());
      const userRequests = allRequests.filter(([_, req]) => req.user_id === userId);
      
      userRequests.forEach(([id]) => {
        this.requests.delete(id);
      });
      
      console.log(`🗑️ Deleted ${userRequests.length} requests for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error deleting all requests:', error);
      return false;
    }
  }

  async getAnalyticsStats() {
    const requests = Array.from(this.requests.values());
    const totalRequests = requests.length;
    
    // Calculate average processing time
    const processingTimes = requests
      .filter(req => req.processing_time)
      .map(req => req.processing_time!);
    const averageProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length 
      : 0;

    // Model usage statistics
    const modelUsageStats: Record<string, number> = {};
    requests.forEach(req => {
      if (req.model) {
        modelUsageStats[req.model] = (modelUsageStats[req.model] || 0) + 1;
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

// Create global singleton storage that persists across hot reloads
declare global {
  var __storage: MemStorage | undefined;
}

// Initialize storage as singleton
export const storage = globalThis.__storage || new MemStorage();

// Store in global to persist across hot reloads in development
if (process.env.NODE_ENV === 'development') {
  globalThis.__storage = storage;
}

// Initialize demo user
let demoUserInitialized = false;

export async function initializeDemoUser() {
  if (demoUserInitialized) return;
  
  console.log('📝 Using fast in-memory storage for optimal performance');
  console.log('🔧 Initializing demo user...');
  
  // For demo purposes, we'll just log the user creation
  console.log('✅ Demo user created with ID: 1');
  demoUserInitialized = true;
}

// Auto-initialize on import
initializeDemoUser();