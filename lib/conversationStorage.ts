// Conversation-based storage system for Luminadoc using Supabase
import { createSupabaseClient } from './supabase';
import type { Database } from './supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Conversation = Database['public']['Tables']['conversations']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];
type Analytics = Database['public']['Tables']['analytics']['Row'];

type InsertMessage = Database['public']['Tables']['messages']['Insert'];
type InsertConversation = Database['public']['Tables']['conversations']['Insert'];
type InsertAnalytics = Database['public']['Tables']['analytics']['Insert'];

export interface ConversationStorage {
  // Profile management
  ensureProfile(userId: string, userData?: any): Promise<Profile>;
  
  // Conversation management
  createOrGetConversation(userId: string, title?: string): Promise<Conversation>;
  getAllConversations(userId: string): Promise<Conversation[]>;
  updateConversation(conversationId: string, data: Partial<Conversation>): Promise<Conversation | null>;
  deleteConversation(conversationId: string, userId: string): Promise<boolean>;
  
  // Message management
  createMessage(data: InsertMessage): Promise<Message>;
  getMessagesForConversation(conversationId: string, userId: string): Promise<Message[]>;
  getAllMessages(userId: string, limit?: number): Promise<Message[]>;
  updateMessage(messageId: string, data: Partial<Message>): Promise<Message | null>;
  deleteMessage(messageId: string, userId: string): Promise<boolean>;
  deleteAllMessages(userId: string): Promise<boolean>;
  
  // Analytics
  trackEvent(data: InsertAnalytics): Promise<void>;
  getAnalyticsStats(userId: string): Promise<{
    totalRequests: number;
    averageProcessingTime: number;
    modelUsageStats: Record<string, number>;
    successRate: number;
  }>;
}

class SupabaseConversationStorage implements ConversationStorage {
  private supabase = createSupabaseClient();
  private defaultConversationCache = new Map<string, string>(); // userId -> conversationId

  async ensureProfile(userId: string, userData?: any): Promise<Profile> {
    // First try to get existing profile
    const { data: existingProfile } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      return existingProfile;
    }

    // Create new profile
    const profileData = {
      id: userId,
      email: userData?.email || 'unknown@example.com',
      full_name: userData?.full_name || userData?.user_metadata?.full_name || null,
      avatar_url: userData?.avatar_url || userData?.user_metadata?.avatar_url || null,
      settings: { theme: 'light', language: 'en', notifications: true },
    };

    const { data: newProfile, error } = await this.supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }

    return newProfile;
  }

  async createOrGetConversation(userId: string, title = 'New Chat'): Promise<Conversation> {
    // Check if we have a cached default conversation for this user
    const cachedConversationId = this.defaultConversationCache.get(userId);
    
    if (cachedConversationId) {
      const { data: existingConversation } = await this.supabase
        .from('conversations')
        .select('*')
        .eq('id', cachedConversationId)
        .eq('user_id', userId)
        .single();

      if (existingConversation) {
        return existingConversation;
      }
    }

    // Get the most recent conversation for this user
    const { data: recentConversations } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (recentConversations && recentConversations.length > 0) {
      const conversation = recentConversations[0];
      this.defaultConversationCache.set(userId, conversation.id);
      return conversation;
    }

    // Create new conversation
    const conversationData: InsertConversation = {
      user_id: userId,
      title,
      model: 'claude',
    };

    const { data: newConversation, error } = await this.supabase
      .from('conversations')
      .insert(conversationData)
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }

    this.defaultConversationCache.set(userId, newConversation.id);
    return newConversation;
  }

  async getAllConversations(userId: string): Promise<Conversation[]> {
    const { data: conversations, error } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    return conversations || [];
  }

  async updateConversation(conversationId: string, data: Partial<Conversation>): Promise<Conversation | null> {
    const { data: conversation, error } = await this.supabase
      .from('conversations')
      .update(data)
      .eq('id', conversationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating conversation:', error);
      return null;
    }

    return conversation;
  }

  async deleteConversation(conversationId: string, userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', userId);

    if (!error) {
      // Clear from cache if it was the default
      if (this.defaultConversationCache.get(userId) === conversationId) {
        this.defaultConversationCache.delete(userId);
      }
    }

    return !error;
  }

  async createMessage(data: InsertMessage): Promise<Message> {
    const { data: message, error } = await this.supabase
      .from('messages')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Error creating message:', error);
      throw error;
    }

    // Update conversation's updated_at timestamp
    await this.supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', data.conversation_id);

    return message;
  }

  async getMessagesForConversation(conversationId: string, userId: string): Promise<Message[]> {
    const { data: messages, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return messages || [];
  }

  async getAllMessages(userId: string, limit?: number): Promise<Message[]> {
    let query = this.supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error('Error fetching all messages:', error);
      return [];
    }

    return messages || [];
  }

  async updateMessage(messageId: string, data: Partial<Message>): Promise<Message | null> {
    const { data: message, error } = await this.supabase
      .from('messages')
      .update(data)
      .eq('id', messageId)
      .select()
      .single();

    if (error) {
      console.error('Error updating message:', error);
      return null;
    }

    return message;
  }

  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('user_id', userId);

    return !error;
  }

  async deleteAllMessages(userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('messages')
      .delete()
      .eq('user_id', userId);

    return !error;
  }

  async trackEvent(data: InsertAnalytics): Promise<void> {
    const { error } = await this.supabase
      .from('analytics')
      .insert(data);

    if (error) {
      console.error('Error tracking analytics:', error);
    }
  }

  async getAnalyticsStats(userId: string): Promise<{
    totalRequests: number;
    averageProcessingTime: number;
    modelUsageStats: Record<string, number>;
    successRate: number;
  }> {
    const { data: messages } = await this.supabase
      .from('messages')
      .select('model, status, processing_time')
      .eq('user_id', userId);

    const totalRequests = messages?.length || 0;
    
    const processingTimes = messages?.filter(m => m.processing_time) || [];
    const averageProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((sum, m) => sum + (m.processing_time || 0), 0) / processingTimes.length
      : 0;

    const modelUsageStats: Record<string, number> = {};
    messages?.forEach(message => {
      if (message.model) {
        modelUsageStats[message.model] = (modelUsageStats[message.model] || 0) + 1;
      }
    });

    const successfulRequests = messages?.filter(m => m.status === 'completed').length || 0;
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;

    return {
      totalRequests,
      averageProcessingTime,
      modelUsageStats,
      successRate,
    };
  }
}

// Export singleton instance
export const conversationStorage = new SupabaseConversationStorage();