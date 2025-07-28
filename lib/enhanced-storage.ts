// Enhanced storage system with Supabase real-time sync for Luminadoc
'use client';

import { supabaseSync } from './supabase-sync';
import { Message, Conversation, Profile } from '@/shared/schema';

export interface LocalStorageData {
  messages: any[];
  conversations: any[];
  analytics: any[];
  settings: any;
  lastSync: string | null;
}

export class EnhancedStorage {
  private static instance: EnhancedStorage;
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      // Monitor online status
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.syncWhenOnline();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  static getInstance(): EnhancedStorage {
    if (!EnhancedStorage.instance) {
      EnhancedStorage.instance = new EnhancedStorage();
    }
    return EnhancedStorage.instance;
  }

  // Get all local storage data
  getLocalData(): LocalStorageData {
    if (typeof window === 'undefined') {
      return {
        messages: [],
        conversations: [],
        analytics: [],
        settings: {},
        lastSync: null
      };
    }

    try {
      return {
        messages: JSON.parse(localStorage.getItem('luminadoc_messages') || '[]'),
        conversations: JSON.parse(localStorage.getItem('luminadoc_conversations') || '[]'),
        analytics: JSON.parse(localStorage.getItem('luminadoc_analytics') || '[]'),
        settings: JSON.parse(localStorage.getItem('luminadoc_settings') || '{}'),
        lastSync: localStorage.getItem('luminadoc_last_sync')
      };
    } catch (error) {
      console.error('Error reading local storage:', error);
      return {
        messages: [],
        conversations: [],
        analytics: [],
        settings: {},
        lastSync: null
      };
    }
  }

  // Save data to local storage
  saveToLocal(key: keyof LocalStorageData, data: any): void {
    if (typeof window === 'undefined') return;

    try {
      const storageKey = `luminadoc_${key}`;
      if (key === 'lastSync') {
        localStorage.setItem(storageKey, data);
      } else {
        localStorage.setItem(storageKey, JSON.stringify(data));
      }
    } catch (error) {
      console.error(`Error saving ${key} to local storage:`, error);
    }
  }

  // Get messages with fallback to Supabase
  async getMessages(conversationId?: string): Promise<any[]> {
    const localData = this.getLocalData();
    
    // If online and user is authenticated, try Supabase first
    if (this.isOnline) {
      try {
        if (conversationId) {
          const supabaseMessages = await supabaseSync.getMessages(conversationId);
          if (supabaseMessages.length > 0) {
            return supabaseMessages;
          }
        } else {
          // Get all conversations and their messages
          const conversations = await supabaseSync.getConversations();
          const allMessages = [];
          for (const conv of conversations) {
            const messages = await supabaseSync.getMessages(conv.id);
            allMessages.push(...messages);
          }
          if (allMessages.length > 0) {
            return allMessages;
          }
        }
      } catch (error) {
        console.log('Supabase unavailable, using local storage');
      }
    }

    // Fallback to local storage
    if (conversationId) {
      return localData.messages.filter(msg => msg.conversationId === conversationId);
    }
    return localData.messages;
  }

  // Save message with sync to Supabase
  async saveMessage(message: any): Promise<void> {
    // Save locally first for immediate UI update
    const localData = this.getLocalData();
    const updatedMessages = [...localData.messages, message];
    this.saveToLocal('messages', updatedMessages);

    // Sync to Supabase if online
    if (this.isOnline && !this.syncInProgress) {
      try {
        await supabaseSync.createMessage({
          conversation_id: message.conversationId || 'default',
          content: message.content || message.prompt || '',
          model: message.model || 'openai',
          response: message.response || '',
          status: 'completed',
          processing_time: message.processingTime,
          metadata: { synced: true, timestamp: message.timestamp }
        });
      } catch (error) {
        console.error('Error syncing message to Supabase:', error);
      }
    }
  }

  // Get conversations with fallback
  async getConversations(): Promise<any[]> {
    const localData = this.getLocalData();
    
    if (this.isOnline) {
      try {
        const supabaseConversations = await supabaseSync.getConversations();
        if (supabaseConversations.length > 0) {
          return supabaseConversations;
        }
      } catch (error) {
        console.log('Supabase unavailable, using local storage');
      }
    }

    return localData.conversations;
  }

  // Save conversation with sync
  async saveConversation(conversation: any): Promise<void> {
    const localData = this.getLocalData();
    const updatedConversations = [...localData.conversations, conversation];
    this.saveToLocal('conversations', updatedConversations);

    if (this.isOnline && !this.syncInProgress) {
      try {
        await supabaseSync.createConversation({
          title: conversation.title || 'New Chat',
          model: conversation.model || 'openai',
          metadata: { synced: true }
        });
      } catch (error) {
        console.error('Error syncing conversation to Supabase:', error);
      }
    }
  }

  // Delete message with sync
  async deleteMessage(messageId: string): Promise<void> {
    const localData = this.getLocalData();
    const updatedMessages = localData.messages.filter(msg => msg.id !== messageId);
    this.saveToLocal('messages', updatedMessages);

    if (this.isOnline) {
      try {
        await supabaseSync.deleteMessage(messageId);
      } catch (error) {
        console.error('Error deleting message from Supabase:', error);
      }
    }
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Clear local storage
    localStorage.removeItem('luminadoc_messages');
    localStorage.removeItem('luminadoc_conversations');
    localStorage.removeItem('luminadoc_analytics');
    localStorage.removeItem('luminadoc_settings');
    localStorage.removeItem('luminadoc_last_sync');

    // Note: We don't clear Supabase data here as it should be preserved
    // Users can delete individual conversations/messages through the UI
  }

  // Sync local data to Supabase
  async syncToSupabase(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) return;

    this.syncInProgress = true;
    
    try {
      const localData = this.getLocalData();
      
      if (localData.messages.length > 0) {
        await supabaseSync.syncLocalData(localData.messages);
        this.saveToLocal('lastSync', new Date().toISOString());
      }
      
      console.log('✅ Successfully synced to Supabase');
    } catch (error) {
      console.error('❌ Error syncing to Supabase:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Sync when coming back online
  private async syncWhenOnline(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await this.syncToSupabase();
  }

  // Get analytics data
  async getAnalytics(): Promise<any[]> {
    const localData = this.getLocalData();
    
    if (this.isOnline) {
      try {
        const supabaseAnalytics = await supabaseSync.getAnalytics();
        if (supabaseAnalytics.length > 0) {
          return supabaseAnalytics;
        }
      } catch (error) {
        console.log('Using local analytics data');
      }
    }

    return localData.analytics;
  }

  // Track analytics event
  async trackEvent(event: any): Promise<void> {
    const localData = this.getLocalData();
    const updatedAnalytics = [...localData.analytics, { ...event, timestamp: new Date().toISOString() }];
    this.saveToLocal('analytics', updatedAnalytics);

    if (this.isOnline) {
      try {
        await supabaseSync.trackEvent({
          event_type: event.type || 'message_sent',
          model: event.model,
          processing_time: event.processingTime,
          metadata: event
        });
      } catch (error) {
        console.error('Error tracking event in Supabase:', error);
      }
    }
  }

  // Get settings
  getSettings(): any {
    const localData = this.getLocalData();
    return localData.settings;
  }

  // Save settings
  saveSettings(settings: any): void {
    this.saveToLocal('settings', settings);
  }

  // Check if data needs sync
  needsSync(): boolean {
    const localData = this.getLocalData();
    const lastSync = localData.lastSync ? new Date(localData.lastSync) : null;
    const now = new Date();
    
    if (!lastSync) return true;
    
    // Sync if more than 1 hour has passed
    const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
    return hoursSinceSync > 1;
  }

  // Force sync check
  async checkAndSync(): Promise<void> {
    if (this.needsSync() && this.isOnline) {
      await this.syncToSupabase();
    }
  }
}

// Export singleton instance
export const enhancedStorage = EnhancedStorage.getInstance();