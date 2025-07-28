// Enhanced client-side storage for complete data persistence
interface Message {
  id: number;
  userId: number;
  type: string;
  prompt: string;
  content: string;
  fileName?: string;
  category: string;
  selectedModel: string;
  status: string;
  confidence: number;
  reasoning?: string;
  response?: string;
  processingTime?: number;
  createdAt: string;
  completedAt?: string;
  updatedAt: string;
}

interface AppSettings {
  theme: string;
  language: string;
  lastUsed: string;
  version: string;
}

interface Analytics {
  totalRequests: number;
  modelUsage: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  averageResponseTime: number;
  successRate: number;
  lastUpdated: string;
}

class ClientStorage {
  private storageKey = 'luminadoc_messages';
  private settingsKey = 'luminadoc_settings';
  private analyticsKey = 'luminadoc_analytics';
  private messageId = 1;

  constructor() {
    // Initialize message ID from existing data
    const messages = this.getMessages();
    if (messages.length > 0) {
      this.messageId = Math.max(...messages.map(m => m.id)) + 1;
    }
    
    // Debug: Log storage status on initialization
    console.log('📦 ClientStorage initialized');
    console.log('💾 Existing messages found:', messages.length);
    console.log('🔢 Next message ID:', this.messageId);
    
    // Show first few messages for debugging
    if (messages.length > 0) {
      console.log('📋 Recent messages:', messages.slice(-3).map(m => ({
        id: m.id,
        prompt: m.prompt.substring(0, 50) + '...',
        status: m.status,
        hasResponse: !!m.response
      })));
    }
  }

  getMessages(): Message[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  addMessage(message: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>): Message {
    const newMessage: Message = {
      ...message,
      id: this.messageId++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const messages = this.getMessages();
    messages.push(newMessage);
    localStorage.setItem(this.storageKey, JSON.stringify(messages));
    
    return newMessage;
  }

  updateMessage(id: number, updates: Partial<Message>): Message | null {
    const messages = this.getMessages();
    const index = messages.findIndex(m => m.id === id);
    
    if (index === -1) return null;
    
    messages[index] = {
      ...messages[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(this.storageKey, JSON.stringify(messages));
    return messages[index];
  }

  deleteMessage(id: number): boolean {
    const messages = this.getMessages();
    const filtered = messages.filter(m => m.id !== id);
    
    if (filtered.length === messages.length) return false;
    
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    return true;
  }

  clearAll(): void {
    localStorage.removeItem(this.storageKey);
    this.messageId = 1;
    console.log('✓ All chat history cleared from client storage');
  }

  // Enhanced analytics tracking
  updateAnalytics(modelUsed: string, responseTime: number, success: boolean = true, category: string = 'general'): void {
    try {
      const analytics = this.getAnalytics();
      analytics.totalRequests++;
      analytics.modelUsage[modelUsed] = (analytics.modelUsage[modelUsed] || 0) + 1;
      analytics.categoryBreakdown[category] = (analytics.categoryBreakdown[category] || 0) + 1;
      
      // Update average response time
      const currentAvg = analytics.averageResponseTime || 0;
      const totalReqs = analytics.totalRequests;
      analytics.averageResponseTime = ((currentAvg * (totalReqs - 1)) + responseTime) / totalReqs;
      
      // Update success rate
      const currentSuccessCount = Math.round((analytics.successRate || 0) * (totalReqs - 1) / 100);
      const newSuccessCount = currentSuccessCount + (success ? 1 : 0);
      analytics.successRate = (newSuccessCount / totalReqs) * 100;
      
      analytics.lastUpdated = new Date().toISOString();
      
      localStorage.setItem(this.analyticsKey, JSON.stringify(analytics));
      console.log('✓ Analytics updated:', analytics);
    } catch (error) {
      console.error('Failed to update analytics:', error);
    }
  }

  getAnalytics(): Analytics {
    try {
      const stored = localStorage.getItem(this.analyticsKey);
      return stored ? JSON.parse(stored) : {
        totalRequests: 0,
        modelUsage: {},
        categoryBreakdown: {},
        averageResponseTime: 0,
        successRate: 100,
        lastUpdated: new Date().toISOString()
      };
    } catch {
      return {
        totalRequests: 0,
        modelUsage: {},
        categoryBreakdown: {},
        averageResponseTime: 0,
        successRate: 100,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // App settings management
  getSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(this.settingsKey);
      return stored ? JSON.parse(stored) : {
        theme: 'dark',
        language: 'en',
        lastUsed: new Date().toISOString(),
        version: '1.0.0'
      };
    } catch {
      return {
        theme: 'dark',
        language: 'en',
        lastUsed: new Date().toISOString(),
        version: '1.0.0'
      };
    }
  }

  updateSettings(settings: Partial<AppSettings>): void {
    try {
      const currentSettings = this.getSettings();
      const updatedSettings = {
        ...currentSettings,
        ...settings,
        lastUsed: new Date().toISOString()
      };
      localStorage.setItem(this.settingsKey, JSON.stringify(updatedSettings));
      console.log('✓ Settings updated:', updatedSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  }

  // Export all data for backup
  exportAllData(): string {
    try {
      const data = {
        messages: this.getMessages(),
        analytics: this.getAnalytics(),
        settings: this.getSettings(),
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return '{}';
    }
  }

  // Import data from backup
  importAllData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.messages) {
        localStorage.setItem(this.storageKey, JSON.stringify(data.messages));
      }
      if (data.analytics) {
        localStorage.setItem(this.analyticsKey, JSON.stringify(data.analytics));
      }
      if (data.settings) {
        localStorage.setItem(this.settingsKey, JSON.stringify(data.settings));
      }
      
      console.log('✓ All data imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Get storage usage info
  getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage.getItem(key)?.length || 0;
        }
      }
      
      // localStorage typically has 5-10MB limit
      const available = 10 * 1024 * 1024; // 10MB estimate
      const percentage = (used / available) * 100;
      
      return { used, available, percentage };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  // Clear all data on initialization for fresh start
  clearAllHistory(): void {
    this.clearAll();
    console.log('✓ Fresh start - all previous data cleared');
  }

  // Complete data wipe
  clearAllData(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.settingsKey);
    localStorage.removeItem(this.analyticsKey);
    this.messageId = 1;
    console.log('✓ All application data cleared from client storage');
  }
}

export const clientStorage = new ClientStorage();