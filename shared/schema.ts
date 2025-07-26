import { pgTable, text, integer, timestamp, uuid, serial, jsonb, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table for Supabase integration
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  supabaseId: uuid('supabase_id').unique(),
  username: text('username').notNull(),
  email: text('email').notNull(),
  password: text('password'),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// AI Requests table (mapped to existing ai_requests table)
export const requests = pgTable('ai_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  type: text('type').notNull().default('prompt'),
  prompt: text('prompt').notNull(),
  content: text('content').notNull(),
  fileName: text('file_name'),
  category: text('category').notNull().default('general'),
  selectedModel: text('selected_model').notNull(),
  status: text('status').notNull().default('pending'),
  confidence: integer('confidence').notNull().default(0),
  reasoning: text('reasoning'),
  response: text('response'),
  processingTime: integer('processing_time'),
  classification: jsonb('classification'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Request = typeof requests.$inferSelect;
export type InsertRequest = typeof requests.$inferInsert;

// Create insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertRequestSchema = createInsertSchema(requests);

// Select types
export type SelectUser = typeof users.$inferSelect;
export type SelectRequest = typeof requests.$inferSelect;