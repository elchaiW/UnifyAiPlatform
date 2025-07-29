// Supabase-based storage implementation for Luminadoc
import { createSupabaseClient } from './supabase';
import type { Database } from './supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Conversation = Database['public']['Tables']['conversations']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];
type Analytics = Database['public']['Tables']['analytics']['Row'];

type InsertProfile = Database['public']['Tables']['profiles']['Insert'];
type InsertConversation = Database['public']['Tables']['conversations']['Insert'];
type InsertMessage = Database['public']['Tables']['messages']['Insert'];
type InsertAnalytics = Database['public']['Tables']['analytics']['Insert'];

export interface ISupabaseStorage {
  // Profile operations
  createProfile(data: InsertProfile): Promise<Profile>;
  getProfile(id: string): Promise<Profile | null>;
  updateProfile(id: string, data: Partial<Profile>): Promise<Profile | null>;

  // Conversation operations
  createConversation(data: InsertConversation): Promise<Conversation>;
  getConversation(id: string): Promise<Conversation | null>;
  getAllConversations(userId: string, limit?: number): Promise<Conversation[]>;
  updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation | null>;
  deleteConversation(id: string, userId: string): Promise<boolean>;

  // Message operations
  createMessage(data: InsertMessage): Promise<Message>;
  getMessage(id: string): Promise<Message | null>;
  getMessagesForConversation(conversationId: string, userId: string): Promise<Message[]>;
  getAllMessages(userId: string, limit?: number): Promise<Message[]>;
  updateMessage(id: string, data: Partial<Message>): Promise<Message | null>;
  deleteMessage(id: string, userId: string): Promise<boolean>;
  deleteAllMessages(userId: string): Promise<boolean>;

  // Analytics operations
  createAnalytics(data: InsertAnalytics): Promise<Analytics>;
  getAnalyticsStats(userId: string): Promise<{
    totalRequests: number;
    averageProcessingTime: number;
    modelUsageStats: Record<string, number>;
    successRate: number;
  }>;
}

// Supabase storage implementation
class SupabaseStorage implements ISupabaseStorage {
  private supabase = createSupabaseClient();

  async createProfile(data: InsertProfile): Promise<Profile> {
    const { data: profile, error } = await this.supabase
      .from('profiles')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return profile;
  }

  async getProfile(id: string): Promise<Profile | null> {
    const { data: profile, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return profile;
  }

  async updateProfile(id: string, data: Partial<Profile>): Promise<Profile | null> {
    const { data: profile, error } = await this.supabase
      .from('profiles')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) return null;
    return profile;
  }

  async createConversation(data: InsertConversation): Promise<Conversation> {
    const { data: conversation, error } = await this.supabase
      .from('conversations')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return conversation;
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const { data: conversation, error } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return conversation;
  }

  async getAllConversations(userId: string, limit?: number): Promise<Conversation[]> {
    let query = this.supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (limit) query = query.limit(limit);

    const { data: conversations, error } = await query;
    if (error) throw error;
    return conversations || [];
  }

  async updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation | null> {
    const { data: conversation, error } = await this.supabase
      .from('conversations')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) return null;
    return conversation;
  }

  async deleteConversation(id: string, userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('conversations')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    return !error;
  }

  async createMessage(data: InsertMessage): Promise<Message> {
    const { data: message, error } = await this.supabase
      .from('messages')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return message;
  }

  async getMessage(id: string): Promise<Message | null> {
    const { data: message, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return message;
  }

  async getMessagesForConversation(conversationId: string, userId: string): Promise<Message[]> {
    const { data: messages, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return messages || [];
  }

  async getAllMessages(userId: string, limit?: number): Promise<Message[]> {
    let query = this.supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (limit) query = query.limit(limit);

    const { data: messages, error } = await query;
    if (error) throw error;
    return messages || [];
  }

  async updateMessage(id: string, data: Partial<Message>): Promise<Message | null> {
    const { data: message, error } = await this.supabase
      .from('messages')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) return null;
    return message;
  }

  async deleteMessage(id: string, userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('messages')
      .delete()
      .eq('id', id)
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

  async createAnalytics(data: InsertAnalytics): Promise<Analytics> {
    const { data: analytics, error } = await this.supabase
      .from('analytics')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return analytics;
  }

  async getAnalyticsStats(userId: string): Promise<{
    totalRequests: number;
    averageProcessingTime: number;
    modelUsageStats: Record<string, number>;
    successRate: number;
  }> {
    // Get all messages for the user
    const { data: messages, error } = await this.supabase
      .from('messages')
      .select('model, status, processing_time')
      .eq('user_id', userId);

    if (error) throw error;

    const totalRequests = messages?.length || 0;
    
    // Calculate average processing time
    const processingTimes = messages?.filter(m => m.processing_time) || [];
    const averageProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((sum, m) => sum + (m.processing_time || 0), 0) / processingTimes.length
      : 0;

    // Model usage statistics
    const modelUsageStats: Record<string, number> = {};
    messages?.forEach(message => {
      if (message.model) {
        modelUsageStats[message.model] = (modelUsageStats[message.model] || 0) + 1;
      }
    });

    // Success rate calculation
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

// Create global singleton storage
export const supabaseStorage = new SupabaseStorage();