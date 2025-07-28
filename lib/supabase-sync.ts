// Real-time Supabase synchronization utilities for Luminadoc
'use client';

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { Message, Conversation, Profile, Analytics } from '@/shared/schema';

// Create Supabase client
export const createSupabaseClient = (): SupabaseClient => {
  if (typeof window === 'undefined') {
    throw new Error('Supabase client should only be used on the client side');
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    }
  );
};

export class SupabaseSync {
  private supabase: SupabaseClient;
  private channels: Map<string, RealtimeChannel> = new Map();
  private userId: string | null = null;

  constructor() {
    this.supabase = createSupabaseClient();
    this.initializeAuth();
  }

  private async initializeAuth() {
    const { data: { session } } = await this.supabase.auth.getSession();
    this.userId = session?.user?.id || null;

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.userId = session?.user?.id || null;
      
      if (event === 'SIGNED_OUT') {
        this.cleanup();
      }
    });
  }

  // Profile management
  async getProfile(): Promise<Profile | null> {
    if (!this.userId) return null;

    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', this.userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }

  async updateProfile(updates: Partial<Profile>): Promise<Profile | null> {
    if (!this.userId) return null;

    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', this.userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }

    return data;
  }

  // Conversation management
  async getConversations(): Promise<Conversation[]> {
    if (!this.userId) return [];

    const { data, error } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('user_id', this.userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    return data || [];
  }

  async createConversation(conversation: {
    title: string;
    model: string;
    metadata?: any;
  }): Promise<Conversation | null> {
    if (!this.userId) return null;

    const { data, error } = await this.supabase
      .from('conversations')
      .insert({
        user_id: this.userId,
        ...conversation
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return data;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | null> {
    if (!this.userId) return null;

    const { data, error } = await this.supabase
      .from('conversations')
      .update(updates)
      .eq('id', id)
      .eq('user_id', this.userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating conversation:', error);
      return null;
    }

    return data;
  }

  async deleteConversation(id: string): Promise<boolean> {
    if (!this.userId) return false;

    const { error } = await this.supabase
      .from('conversations')
      .delete()
      .eq('id', id)
      .eq('user_id', this.userId);

    if (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }

    return true;
  }

  // Message management
  async getMessages(conversationId: string): Promise<Message[]> {
    if (!this.userId) return [];

    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', this.userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data || [];
  }

  async createMessage(message: {
    conversation_id: string;
    content: string;
    model: string;
    response?: string;
    status?: string;
    processing_time?: number;
    token_usage?: any;
    metadata?: any;
  }): Promise<Message | null> {
    if (!this.userId) return null;

    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        user_id: this.userId,
        ...message
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return null;
    }

    return data;
  }

  async updateMessage(id: string, updates: Partial<Message>): Promise<Message | null> {
    if (!this.userId) return null;

    const { data, error } = await this.supabase
      .from('messages')
      .update(updates)
      .eq('id', id)
      .eq('user_id', this.userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating message:', error);
      return null;
    }

    return data;
  }

  async deleteMessage(id: string): Promise<boolean> {
    if (!this.userId) return false;

    const { error } = await this.supabase
      .from('messages')
      .delete()
      .eq('id', id)
      .eq('user_id', this.userId);

    if (error) {
      console.error('Error deleting message:', error);
      return false;
    }

    return true;
  }

  // Analytics
  async trackEvent(event: {
    event_type: string;
    model?: string;
    processing_time?: number;
    token_count?: number;
    metadata?: any;
  }): Promise<void> {
    if (!this.userId) return;

    const { error } = await this.supabase
      .from('analytics')
      .insert({
        user_id: this.userId,
        ...event
      });

    if (error) {
      console.error('Error tracking event:', error);
    }
  }

  async getAnalytics(days: number = 30): Promise<Analytics[]> {
    if (!this.userId) return [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await this.supabase
      .from('analytics')
      .select('*')
      .eq('user_id', this.userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching analytics:', error);
      return [];
    }

    return data || [];
  }

  // Real-time subscriptions
  subscribeToConversations(callback: (payload: any) => void): void {
    if (!this.userId) return;

    const channel = this.supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `user_id=eq.${this.userId}`
        },
        callback
      )
      .subscribe();

    this.channels.set('conversations', channel);
  }

  subscribeToMessages(conversationId: string, callback: (payload: any) => void): void {
    if (!this.userId) return;

    const channelName = `messages-${conversationId}`;
    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        callback
      )
      .subscribe();

    this.channels.set(channelName, channel);
  }

  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      this.supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  cleanup(): void {
    // Unsubscribe from all channels
    this.channels.forEach((channel, name) => {
      this.supabase.removeChannel(channel);
    });
    this.channels.clear();
  }

  // Bulk operations for migration/sync
  async syncLocalData(localMessages: any[]): Promise<void> {
    if (!this.userId || localMessages.length === 0) return;

    try {
      // First, create a default conversation if none exists
      let conversations = await this.getConversations();
      let defaultConversation: Conversation | null = conversations[0] || null;

      if (!defaultConversation) {
        defaultConversation = await this.createConversation({
          title: 'Chat History',
          model: 'openai',
          metadata: { migrated: true }
        });

        if (!defaultConversation) return;
      }

      // Convert local messages to Supabase format
      const messagesToInsert = localMessages.map(msg => ({
        conversation_id: defaultConversation!.id,
        user_id: this.userId!,
        content: msg.content || msg.prompt || '',
        response: msg.response || '',
        model: msg.model || 'openai',
        status: 'completed' as const,
        processing_time: msg.processing_time || null,
        metadata: { 
          migrated: true,
          original_timestamp: msg.timestamp || msg.created_at 
        }
      }));

      // Insert in batches to avoid hitting limits
      const batchSize = 100;
      for (let i = 0; i < messagesToInsert.length; i += batchSize) {
        const batch = messagesToInsert.slice(i, i + batchSize);
        
        const { error } = await this.supabase
          .from('messages')
          .insert(batch);

        if (error) {
          console.error('Error syncing batch:', error);
        }
      }

      console.log(`✅ Synced ${messagesToInsert.length} messages to Supabase`);
    } catch (error) {
      console.error('Error syncing local data:', error);
    }
  }
}

// Global instance
export const supabaseSync = new SupabaseSync();