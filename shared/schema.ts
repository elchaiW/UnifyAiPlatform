// Database schema definitions for Luminadoc using Supabase
import { z } from 'zod';

// Supabase database types matching the SQL schema
export interface Profile {
  id: string; // UUID
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  settings?: any;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string; // UUID
  user_id: string; // UUID
  title: string;
  model: string;
  is_pinned: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string; // UUID
  conversation_id: string; // UUID
  user_id: string; // UUID
  content: string;
  response?: string | null;
  model: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_time?: number | null;
  token_usage?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface Analytics {
  id: string; // UUID
  user_id: string; // UUID
  event_type: string;
  model?: string | null;
  processing_time?: number | null;
  token_count?: number | null;
  metadata?: any;
  created_at: string;
}

// Zod schemas for validation
export const profileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  settings: z.any().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const conversationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  model: z.enum(['gemini', 'openai', 'claude', 'grok']),
  is_pinned: z.boolean().default(false),
  metadata: z.any().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const messageSchema = z.object({
  id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  user_id: z.string().uuid(),
  content: z.string(),
  response: z.string().optional().nullable(),
  model: z.enum(['gemini', 'openai', 'claude', 'grok']),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).default('completed'),
  processing_time: z.number().optional().nullable(),
  token_usage: z.any().optional(),
  metadata: z.any().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Insert schemas (omit generated fields)
export const insertProfileSchema = profileSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertConversationSchema = conversationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertMessageSchema = messageSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Export types
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Legacy compatibility for existing code
export type User = Profile;
export type Request = Message;
export type SelectRequest = Message;

// Analytics types
export interface AnalyticsStats {
  totalRequests: number;
  averageProcessingTime: number;
  modelUsageStats: Record<string, number>;
  successRate: number;
}

// AI Model types
export type AIModel = 'gemini' | 'openai' | 'claude' | 'grok';

export interface AIModelConfig {
  name: string;
  displayName: string;
  description: string;
  maxTokens: number;
  pricing: {
    input: number;
    output: number;
  };
}