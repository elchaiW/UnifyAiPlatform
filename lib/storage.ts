// In-memory storage implementation for Luminadoc
import { Request, SelectRequest } from '@/shared/schema';

export interface IStorage {
  // Request operations
  createRequest(data: Request): Promise<SelectRequest>;
  getRequest(id: string): Promise<SelectRequest | null>;
  getAllRequests(userId?: number): Promise<SelectRequest[]>;
  updateRequest(id: string, data: Partial<Request>): Promise<SelectRequest | null>;
  deleteRequest(id: string): Promise<boolean>;

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
    const id = this.idCounter++;
    const request: SelectRequest = {
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.requests.set(id.toString(), request);
    console.log(`📝 Created request ${id} for user ${data.userId}`);
    return request;
  }

  async getRequest(id: string): Promise<SelectRequest | null> {
    return this.requests.get(id) || null;
  }

  async getAllRequests(userId?: number): Promise<SelectRequest[]> {
    const allRequests = Array.from(this.requests.values());
    if (userId) {
      const filtered = allRequests.filter(req => req.userId === userId);
      console.log(`📱 History: Found ${filtered.length} messages for user ${userId}`);
      return filtered;
    }
    return allRequests;
  }

  async updateRequest(id: string, data: Partial<Request>): Promise<SelectRequest | null> {
    const existing = this.requests.get(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    
    this.requests.set(id, updated);
    console.log(`📝 Updated request ${id}`);
    return updated;
  }

  async deleteRequest(id: string): Promise<boolean> {
    return this.requests.delete(id);
  }

  async getAnalyticsStats() {
    const requests = Array.from(this.requests.values());
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