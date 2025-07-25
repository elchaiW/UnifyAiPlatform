import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiRequests = pgTable("ai_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'prompt' or 'document'
  content: text("content").notNull(),
  fileName: text("file_name"),
  category: text("category").notNull(), // 'legal', 'marketing', 'coding', 'general'
  selectedModel: text("selected_model").notNull(), // 'claude', 'chatgpt', 'gemini', 'grok'
  status: text("status").notNull().default('pending'), // 'pending', 'processing', 'completed', 'failed'
  response: text("response"),
  processingTime: decimal("processing_time", { precision: 10, scale: 3 }),
  classification: jsonb("classification"), // Enhanced classification data from Claude analysis
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  requestId: integer("request_id").references(() => aiRequests.id).notNull(),
  modelUsed: text("model_used").notNull(),
  responseTime: decimal("response_time", { precision: 10, scale: 3 }).notNull(),
  success: boolean("success").notNull(),
  errorType: text("error_type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const insertRequestSchema = createInsertSchema(aiRequests).pick({
  type: true,
  content: true,
  fileName: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type AIRequest = typeof aiRequests.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;
