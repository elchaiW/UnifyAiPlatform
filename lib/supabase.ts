import { createClient } from '@supabase/supabase-js'

// Client-side Supabase client
export const createSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Database types matching the Supabase schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          settings: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          settings?: any;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          settings?: any;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          model: string;
          is_pinned: boolean;
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title?: string;
          model?: string;
          is_pinned?: boolean;
          metadata?: any;
        };
        Update: {
          title?: string;
          model?: string;
          is_pinned?: boolean;
          metadata?: any;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          user_id: string;
          content: string;
          response: string | null;
          model: string;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          processing_time: number | null;
          token_usage: any;
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          conversation_id: string;
          user_id: string;
          content: string;
          response?: string | null;
          model: string;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          processing_time?: number | null;
          token_usage?: any;
          metadata?: any;
        };
        Update: {
          content?: string;
          response?: string | null;
          model?: string;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          processing_time?: number | null;
          token_usage?: any;
          metadata?: any;
        };
      };
      analytics: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          model: string | null;
          processing_time: number | null;
          token_count: number | null;
          metadata: any;
          created_at: string;
        };
        Insert: {
          user_id: string;
          event_type: string;
          model?: string | null;
          processing_time?: number | null;
          token_count?: number | null;
          metadata?: any;
        };
        Update: {
          event_type?: string;
          model?: string | null;
          processing_time?: number | null;
          token_count?: number | null;
          metadata?: any;
        };
      };
    }
  }
}