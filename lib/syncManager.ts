// Sync manager for client storage and Supabase database
import { createClient } from '@supabase/supabase-js';
import { clientStorage } from './clientStorage';

interface SyncConfig {
  maxLocalStorageSize: number; // in bytes (default: 8MB)
  batchSize: number; // number of messages to sync at once
  retentionDays: number; // how long to keep messages locally
  autoSyncInterval: number; // sync interval in minutes
}

interface SyncResult {
  success: boolean;
  syncedCount: number;
  deletedCount: number;
  error?: string;
}

class SyncManager {
  private supabase: ReturnType<typeof createClient> | null = null;
  private isInitialized = false;
  private syncInProgress = false;
  private config: SyncConfig = {
    maxLocalStorageSize: 8 * 1024 * 1024, // 8MB
    batchSize: 50,
    retentionDays: 7,
    autoSyncInterval: 30, // 30 minutes
  };

  constructor() {
    this.initializeSupabase();
    this.setupAutoSync();
  }

  private initializeSupabase() {
    try {
      // Use DATABASE_URL to connect to Supabase
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        console.warn('⚠️ DATABASE_URL not found, sync disabled');
        return;
      }

      // Extract Supabase URL and key from DATABASE_URL
      // DATABASE_URL format: postgres://[user]:[password]@[host]:[port]/[database]
      const url = new URL(databaseUrl);
      const supabaseUrl = `https://${url.hostname.replace('db.', '').replace('.supabase.co', '')}.supabase.co`;
      
      // For now, we'll need to add Supabase anon key as environment variable
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (supabaseKey) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.isInitialized = true;
        console.log('✅ Sync Manager initialized with Supabase');
      } else {
        console.warn('⚠️ Supabase anon key not found, using direct database connection');
        this.initializeDirectDB();
      }
    } catch (error) {
      console.error('❌ Failed to initialize Supabase sync:', error);
    }
  }

  private async initializeDirectDB() {
    // Initialize direct database connection using DATABASE_URL
    try {
      const { dbStorage } = await import('./database');
      this.isInitialized = true;
      console.log('✅ Sync Manager initialized with direct database');
    } catch (error) {
      console.error('❌ Failed to initialize database sync:', error);
    }
  }

  private setupAutoSync() {
    // Auto-sync every 30 minutes
    setInterval(() => {
      this.performAutoSync();
    }, this.config.autoSyncInterval * 60 * 1000);

    // Sync on page visibility change (when user returns)
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.performAutoSync();
        }
      });
    }
  }

  async performAutoSync(): Promise<SyncResult> {
    if (!this.isInitialized || this.syncInProgress) {
      return { success: false, syncedCount: 0, deletedCount: 0, error: 'Sync not available or in progress' };
    }

    const storageInfo = clientStorage.getStorageInfo();
    const shouldSync = storageInfo.percentage > 70; // Sync when 70% full

    if (shouldSync) {
      console.log(`📦 Storage ${Math.round(storageInfo.percentage)}% full, initiating sync...`);
      return await this.syncToDatabase();
    }

    return { success: true, syncedCount: 0, deletedCount: 0 };
  }

  async syncToDatabase(): Promise<SyncResult> {
    if (!this.isInitialized || this.syncInProgress) {
      return { success: false, syncedCount: 0, deletedCount: 0, error: 'Sync not available or in progress' };
    }

    this.syncInProgress = true;

    try {
      console.log('🔄 Starting sync to database...');
      
      const messages = clientStorage.getMessages();
      const oldMessages = this.getOldMessages(messages);
      
      if (oldMessages.length === 0) {
        this.syncInProgress = false;
        return { success: true, syncedCount: 0, deletedCount: 0 };
      }

      let syncedCount = 0;
      let deletedCount = 0;

      // Sync in batches
      for (let i = 0; i < oldMessages.length; i += this.config.batchSize) {
        const batch = oldMessages.slice(i, i + this.config.batchSize);
        const batchResult = await this.syncBatch(batch);
        
        if (batchResult.success) {
          syncedCount += batchResult.syncedCount;
          
          // Remove synced messages from local storage
          const deletedInBatch = this.removeMessagesFromLocal(batch.map(m => m.id));
          deletedCount += deletedInBatch;
        } else {
          console.error('❌ Batch sync failed:', batchResult.error);
          break;
        }
      }

      this.syncInProgress = false;
      console.log(`✅ Sync completed: ${syncedCount} synced, ${deletedCount} removed locally`);
      
      return { success: true, syncedCount, deletedCount };

    } catch (error) {
      this.syncInProgress = false;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Sync failed:', errorMsg);
      return { success: false, syncedCount: 0, deletedCount: 0, error: errorMsg };
    }
  }

  private getOldMessages(messages: any[]): any[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
    
    return messages.filter(message => {
      const messageDate = new Date(message.createdAt);
      return messageDate < cutoffDate && message.status === 'completed';
    }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  private async syncBatch(messages: any[]): Promise<{ success: boolean; syncedCount: number; error?: string }> {
    try {
      if (this.supabase) {
        return await this.syncWithSupabase(messages);
      } else {
        return await this.syncWithDirectDB(messages);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, syncedCount: 0, error: errorMsg };
    }
  }

  private async syncWithSupabase(messages: any[]): Promise<{ success: boolean; syncedCount: number; error?: string }> {
    if (!this.supabase) {
      return { success: false, syncedCount: 0, error: 'Supabase not initialized' };
    }

    try {
      // First, ensure user exists
      const { data: { user } } = await this.supabase.auth.getUser();
      let userId = 1; // Default demo user
      
      if (user) {
        // Check if user exists in our users table
        const { data: existingUser } = await this.supabase
          .from('users')
          .select('id')
          .eq('supabase_id', user.id)
          .single();

        if (!existingUser) {
          // Create user
          const { data: newUser } = await this.supabase
            .from('users')
            .insert({
              email: user.email || 'demo@luminadoc.com',
              supabase_id: user.id
            })
            .select('id')
            .single();
          
          userId = (newUser?.id as number) ?? 1;
        } else {
          userId = (existingUser.id as number) ?? 1;
        }
      }

      // Transform messages to database format
      const requestsToInsert = messages.map(message => ({
        user_id: userId,
        content: message.prompt || message.content,
        model: message.selectedModel,
        response: message.response,
        status: message.status,
        processing_time: message.processingTime,
        metadata: {
          category: message.category,
          confidence: message.confidence,
          reasoning: message.reasoning,
          fileName: message.fileName,
          type: message.type,
          originalId: message.id
        },
        created_at: message.createdAt,
        updated_at: message.updatedAt
      }));

      // Insert into requests table
      const { error } = await this.supabase
        .from('requests')
        .insert(requestsToInsert);

      if (error) throw error;

      return { success: true, syncedCount: messages.length };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, syncedCount: 0, error: errorMsg };
    }
  }

  private async syncWithDirectDB(messages: any[]): Promise<{ success: boolean; syncedCount: number; error?: string }> {
    try {
      const { dbStorage } = await import('./database');
      
      let syncedCount = 0;
      for (const message of messages) {
        const requestData = {
          id: Date.now() + Math.random(), // Temporary ID
          createdAt: new Date(message.createdAt),
          updatedAt: new Date(message.updatedAt),
          userId: 1, // Demo user
          content: message.prompt || message.content,
          model: message.selectedModel,
          response: message.response || null,
          status: message.status,
          processingTime: message.processingTime || null,
          metadata: {
            category: message.category,
            confidence: message.confidence,
            reasoning: message.reasoning,
            fileName: message.fileName,
            type: message.type,
            originalId: message.id
          }
        };

        await dbStorage.createRequest(requestData);
        syncedCount++;
      }

      return { success: true, syncedCount };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, syncedCount: 0, error: errorMsg };
    }
  }

  private removeMessagesFromLocal(messageIds: number[]): number {
    let removedCount = 0;
    for (const id of messageIds) {
      if (clientStorage.deleteMessage(id)) {
        removedCount++;
      }
    }
    return removedCount;
  }

  // Manual sync trigger
  async forcSync(): Promise<SyncResult> {
    console.log('🔄 Force sync triggered...');
    return await this.syncToDatabase();
  }

  // Get sync status
  getSyncStatus(): { 
    isInitialized: boolean; 
    syncInProgress: boolean; 
    storageInfo: ReturnType<typeof clientStorage.getStorageInfo>;
    config: SyncConfig;
  } {
    return {
      isInitialized: this.isInitialized,
      syncInProgress: this.syncInProgress,
      storageInfo: clientStorage.getStorageInfo(),
      config: this.config
    };
  }

  // Update sync configuration
  updateConfig(newConfig: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Sync config updated:', this.config);
  }

  // Emergency cleanup - removes oldest messages when storage is critically full
  async emergencyCleanup(): Promise<{ deletedCount: number }> {
    console.log('🚨 Emergency cleanup triggered!');
    
    const messages = clientStorage.getMessages();
    const sortedMessages = messages.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Remove oldest 30% of messages
    const toRemove = Math.floor(sortedMessages.length * 0.3);
    const messagesToDelete = sortedMessages.slice(0, toRemove);
    
    let deletedCount = 0;
    for (const message of messagesToDelete) {
      if (clientStorage.deleteMessage(message.id)) {
        deletedCount++;
      }
    }

    console.log(`🧹 Emergency cleanup completed: ${deletedCount} messages removed`);
    return { deletedCount };
  }
}

// Export singleton instance
export const syncManager = new SyncManager();