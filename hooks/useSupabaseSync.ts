// React hook for Supabase real-time synchronization
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabaseSync } from '@/lib/supabase-sync';
import { Message, Conversation, Profile } from '@/shared/schema';

export interface SyncState {
  isLoading: boolean;
  isConnected: boolean;
  lastSync: Date | null;
  error: string | null;
}

// Hook for managing conversations
export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await supabaseSync.getConversations();
      setConversations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createConversation = useCallback(async (
    title: string, 
    model: string, 
    metadata?: any
  ): Promise<Conversation | null> => {
    try {
      const newConversation = await supabaseSync.createConversation({
        title,
        model,
        metadata
      });
      
      if (newConversation) {
        setConversations(prev => [newConversation, ...prev]);
      }
      
      return newConversation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
      return null;
    }
  }, []);

  const updateConversation = useCallback(async (
    id: string, 
    updates: Partial<Conversation>
  ): Promise<boolean> => {
    try {
      const updated = await supabaseSync.updateConversation(id, updates);
      
      if (updated) {
        setConversations(prev => 
          prev.map(conv => conv.id === id ? updated : conv)
        );
      }
      
      return !!updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update conversation');
      return false;
    }
  }, []);

  const deleteConversation = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await supabaseSync.deleteConversation(id);
      
      if (success) {
        setConversations(prev => prev.filter(conv => conv.id !== id));
      }
      
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete conversation');
      return false;
    }
  }, []);

  useEffect(() => {
    loadConversations();

    // Subscribe to real-time updates
    if (user) {
      supabaseSync.subscribeToConversations((payload) => {
        const eventType = payload.eventType;
        const conversation = payload.new as Conversation;

        switch (eventType) {
          case 'INSERT':
            setConversations(prev => [conversation, ...prev]);
            break;
          case 'UPDATE':
            setConversations(prev => 
              prev.map(conv => conv.id === conversation.id ? conversation : conv)
            );
            break;
          case 'DELETE':
            setConversations(prev => 
              prev.filter(conv => conv.id !== payload.old.id)
            );
            break;
        }
      });
    }

    return () => {
      supabaseSync.unsubscribe('conversations');
    };
  }, [user, loadConversations]);

  return {
    conversations,
    loading,
    error,
    createConversation,
    updateConversation,
    deleteConversation,
    refresh: loadConversations
  };
}

// Hook for managing messages in a conversation
export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadMessages = useCallback(async () => {
    if (!user || !conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await supabaseSync.getMessages(conversationId);
      setMessages(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [user, conversationId]);

  const createMessage = useCallback(async (
    content: string,
    model: string,
    response?: string,
    processingTime?: number,
    metadata?: any
  ): Promise<Message | null> => {
    if (!conversationId) return null;

    try {
      const newMessage = await supabaseSync.createMessage({
        conversation_id: conversationId,
        content,
        model,
        response,
        status: response ? 'completed' : 'pending',
        processing_time: processingTime,
        metadata
      });
      
      if (newMessage) {
        setMessages(prev => [...prev, newMessage]);
      }
      
      return newMessage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create message');
      return null;
    }
  }, [conversationId]);

  const updateMessage = useCallback(async (
    id: string, 
    updates: Partial<Message>
  ): Promise<boolean> => {
    try {
      const updated = await supabaseSync.updateMessage(id, updates);
      
      if (updated) {
        setMessages(prev => 
          prev.map(msg => msg.id === id ? updated : msg)
        );
      }
      
      return !!updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update message');
      return false;
    }
  }, []);

  const deleteMessage = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await supabaseSync.deleteMessage(id);
      
      if (success) {
        setMessages(prev => prev.filter(msg => msg.id !== id));
      }
      
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
      return false;
    }
  }, []);

  useEffect(() => {
    loadMessages();

    // Subscribe to real-time updates for this conversation
    if (user && conversationId) {
      supabaseSync.subscribeToMessages(conversationId, (payload) => {
        const eventType = payload.eventType;
        const message = payload.new as Message;

        switch (eventType) {
          case 'INSERT':
            setMessages(prev => [...prev, message]);
            break;
          case 'UPDATE':
            setMessages(prev => 
              prev.map(msg => msg.id === message.id ? message : msg)
            );
            break;
          case 'DELETE':
            setMessages(prev => 
              prev.filter(msg => msg.id !== payload.old.id)
            );
            break;
        }
      });
    }

    return () => {
      if (conversationId) {
        supabaseSync.unsubscribe(`messages-${conversationId}`);
      }
    };
  }, [user, conversationId, loadMessages]);

  return {
    messages,
    loading,
    error,
    createMessage,
    updateMessage,
    deleteMessage,
    refresh: loadMessages
  };
}

// Hook for managing sync state and operations
export function useSupabaseSync() {
  const [syncState, setSyncState] = useState<SyncState>({
    isLoading: false,
    isConnected: false,
    lastSync: null,
    error: null
  });
  const { user } = useAuth();

  const syncLocalData = useCallback(async (localMessages: any[]): Promise<void> => {
    if (!user || localMessages.length === 0) return;

    setSyncState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await supabaseSync.syncLocalData(localMessages);
      setSyncState(prev => ({
        ...prev,
        isLoading: false,
        lastSync: new Date(),
        isConnected: true
      }));
    } catch (err) {
      setSyncState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Sync failed'
      }));
    }
  }, [user]);

  const clearLocalData = useCallback(() => {
    // Clear client-side storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('luminadoc_messages');
      localStorage.removeItem('luminadoc_conversations');
      localStorage.removeItem('luminadoc_analytics');
      localStorage.removeItem('luminadoc_settings');
    }
  }, []);

  const getProfile = useCallback(async (): Promise<Profile | null> => {
    try {
      return await supabaseSync.getProfile();
    } catch (err) {
      console.error('Error getting profile:', err);
      return null;
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Profile>): Promise<boolean> => {
    try {
      const updated = await supabaseSync.updateProfile(updates);
      return !!updated;
    } catch (err) {
      console.error('Error updating profile:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    // Check connection status
    setSyncState(prev => ({ ...prev, isConnected: !!user }));
  }, [user]);

  return {
    syncState,
    syncLocalData,
    clearLocalData,
    getProfile,
    updateProfile
  };
}