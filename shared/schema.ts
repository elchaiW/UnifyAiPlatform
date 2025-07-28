// Database schema definitions for Luminadoc using Drizzle ORM
import { pgTable, serial, text, timestamp, integer, jsonb, real } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique().notNull(),
  supabaseId: text('supabase_id').unique().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// AI processing requests table
export const requests = pgTable('requests', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  model: text('model').notNull(), // 'gemini', 'openai', 'claude', etc.
  response: text('response'),
  status: text('status').notNull().default('pending'), // 'pending', 'processing', 'completed', 'failed'
  processingTime: real('processing_time'), // in seconds
  metadata: jsonb('metadata'), // Additional data like usage stats, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRequestSchema = createInsertSchema(requests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Request = typeof requests.$inferSelect;
export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type SelectRequest = typeof requests.$inferSelect;

// Extended request type for API responses
export interface RequestWithUser extends Request {
  user?: User;
}

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