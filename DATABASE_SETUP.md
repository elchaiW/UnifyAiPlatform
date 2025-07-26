# LUMINADOC Database Setup Guide

## Overview
This guide shows you how to set up PostgreSQL database storage for LUMINADOC with Supabase integration for user-specific chat storage.

## Database Schema

### 1. Users Table
Stores user information integrated with Supabase authentication:

```sql
-- Users table structure (already exists, but needs modifications)
ALTER TABLE users ADD COLUMN IF NOT EXISTS supabase_id UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Make supabase_id unique for authentication
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_supabase_id_unique ON users(supabase_id);
```

### 2. AI Requests Table 
Stores chat messages and AI responses (uses existing ai_requests table):

```sql
-- Update ai_requests table to match application needs
ALTER TABLE ai_requests ADD COLUMN IF NOT EXISTS prompt TEXT;
ALTER TABLE ai_requests ADD COLUMN IF NOT EXISTS confidence INTEGER DEFAULT 0;
ALTER TABLE ai_requests ADD COLUMN IF NOT EXISTS reasoning TEXT;
ALTER TABLE ai_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();

-- Update existing records to have prompt from content if needed
UPDATE ai_requests SET prompt = content WHERE prompt IS NULL;
```

### 3. Create Demo User
```sql
-- Create a demo user for testing (fallback when no auth)
INSERT INTO users (id, supabase_id, username, email, name) 
VALUES (1, gen_random_uuid(), 'demo', 'demo@luminadoc.com', 'Demo User')
ON CONFLICT (id) DO NOTHING;
```

## Features Implemented

### ✅ User-Specific Storage
- Each user gets their own chat history stored separately
- Messages are linked to users via foreign key relationship
- Supabase authentication integration for real users

### ✅ Persistent Chat History
- Messages persist across browser sessions and app restarts
- No more data loss from in-memory storage resets
- Complete conversation history maintained per user

### ✅ Database Operations
- **Create**: New chat messages stored in PostgreSQL
- **Read**: User-specific chat history retrieval
- **Update**: AI response updates with processing times
- **Delete**: Individual message and bulk history deletion

### ✅ Authentication Integration
- Supabase user authentication support
- Automatic user creation on first login
- Fallback to demo user for backwards compatibility

## API Changes

### Request Creation (`POST /api/requests`)
- Now uses `dbStorage.createRequest()` with database persistence
- Supports both authenticated users and demo user fallback
- Stores classification results and processing metrics

### History Retrieval (`GET /api/requests/history`)
- Returns user-specific chat history from PostgreSQL
- Supports pagination with limit parameter
- Ordered chronologically for proper chat display

### History Management (`DELETE /api/requests/history`)
- Clears user-specific chat history only
- Maintains data isolation between users
- Supports both authenticated and demo users

## Database Connection
- Uses PostgreSQL with `pg` driver and Drizzle ORM
- Connection configured via `DATABASE_URL` environment variable
- Automatic connection pooling for performance

## Usage Example

### For Authenticated Users
When users log in with Google OAuth through Supabase:
1. User's Supabase ID is used to find/create database user
2. All chat messages are stored under their user ID  
3. Chat history is private and persistent across sessions

### For Demo/Unauthenticated Users
When no authentication is present:
1. Defaults to demo user (ID: 1)
2. Shared demo chat history for testing
3. Backwards compatibility maintained

## Data Structure

### User Record
```typescript
{
  id: number,
  supabaseId: string (UUID),
  username: string,
  email: string,
  name: string,
  avatarUrl: string,
  createdAt: Date
}
```

### Chat Message Record
```typescript
{
  id: number,
  userId: number,
  prompt: string,        // User's original message
  content: string,       // Message content
  selectedModel: string, // AI model used (claude/chatgpt/gemini/grok)
  status: string,        // completed/failed/processing
  confidence: number,    // Classification confidence (0-100)
  reasoning: string,     // Why this model was selected
  response: string,      // AI's response
  processingTime: number,// Response time in milliseconds
  createdAt: Date,
  completedAt: Date,
  updatedAt: Date
}
```

## Benefits

### 🚀 Performance
- Fast PostgreSQL queries with proper indexing
- Efficient user-based data retrieval
- Connection pooling for scalability

### 🔒 Security
- User data isolation through foreign keys
- No cross-user data access
- Secure Supabase authentication integration

### 💾 Reliability  
- Persistent storage eliminates data loss
- Database transactions ensure data consistency
- Backup and recovery capabilities through PostgreSQL

### 📊 Analytics
- Complete conversation history for insights
- Processing time tracking per model
- User engagement metrics available

## Migration Complete ✅

The application has been successfully migrated from in-memory storage to PostgreSQL database storage with:

- ✅ User-specific chat isolation
- ✅ Persistent message history  
- ✅ Supabase authentication integration
- ✅ Backwards compatibility maintained
- ✅ Database schema properly configured
- ✅ All API endpoints updated to use database

Your chat messages will now persist across sessions and each user will have their own private chat history!