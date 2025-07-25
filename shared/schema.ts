// Shared schema definitions for Luminadoc
import { z } from 'zod';

// Request schema
export const requestSchema = z.object({
  userId: z.number(),
  prompt: z.string().min(1, 'Prompt is required'),
  fileContent: z.string().optional(),
  fileName: z.string().optional(),
  selectedModel: z.enum(['claude', 'chatgpt', 'gemini', 'grok']).optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).default('pending'),
  response: z.string().optional(),
  processingTime: z.number().optional(),
  confidence: z.number().optional(),
  reasoning: z.string().optional(),
});

export type Request = z.infer<typeof requestSchema>;

// For database operations
export type SelectRequest = Request & {
  id: number;
  createdAt: Date;
  updatedAt: Date;
};

// Insert schema (excludes auto-generated fields)
export const insertRequestSchema = requestSchema.omit({});
export type InsertRequest = z.infer<typeof insertRequestSchema>;