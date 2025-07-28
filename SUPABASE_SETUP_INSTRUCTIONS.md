# Complete Supabase Real-Time Sync Setup for Luminadoc

## Prerequisites
✅ You already have:
- DATABASE_URL (Supabase connection string)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

## Step 1: Create Database Tables in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Copy and paste the entire content from `supabase-setup.sql`
4. Click **Run** to execute the SQL script

This will create:
- `profiles` table (user profiles extending auth.users)
- `conversations` table (chat conversations)
- `messages` table (individual chat messages)
- `analytics` table (usage tracking)
- All necessary indexes, RLS policies, and triggers
- Real-time subscriptions enabled

## Step 2: Verify Database Setup

Run this test in your terminal to verify the connection:
```bash
node test-db-connection.js
```

You should see:
- ✅ Database connection successful
- ✅ All tables exist! Database is ready.

## Step 3: Update Your Application Components

### Option A: Use New Supabase Components (Recommended)

Replace your current components with the new Supabase-enabled versions:

1. **Chat Interface**: Use `ChatInterfaceSupabase.tsx` instead of current `ChatInterface.tsx`
2. **History Tab**: Use `HistoryTabSupabase.tsx` instead of current history component

### Option B: Update Existing Components

Alternatively, update your existing components to use the new hooks:

```typescript
// In your components
import { useConversations, useMessages, useSupabaseSync } from '@/hooks/useSupabaseSync';
import { enhancedStorage } from '@/lib/enhanced-storage';

// Replace localStorage calls with:
const { conversations, createConversation } = useConversations();
const { messages, createMessage, updateMessage } = useMessages(conversationId);
const { syncLocalData, clearLocalData } = useSupabaseSync();
```

## Step 4: How the Sync System Works

### Automatic Features:
- **Real-time sync**: Messages and conversations sync instantly across devices
- **Offline support**: Works offline, syncs when back online
- **Data migration**: Existing localStorage data automatically syncs to Supabase
- **Conflict resolution**: Smart merging of local and cloud data

### User Features:
- **Cross-device sync**: Chat history available on all devices
- **Data persistence**: Never lose chat history even if localStorage is cleared
- **Export functionality**: Download complete chat history as JSON
- **Search & filter**: Advanced history search with model and date filtering

## Step 5: Key Components Overview

### Database Schema:
- **profiles**: User profiles linked to Supabase auth
- **conversations**: Chat conversations grouped by topic/session
- **messages**: Individual messages with AI responses
- **analytics**: Usage tracking and performance metrics

### Real-time Features:
- Live message updates
- Conversation list updates
- Cross-device synchronization
- Online/offline status indicators

### Storage Strategy:
- **Primary**: Supabase PostgreSQL (persistent, real-time)
- **Fallback**: localStorage (offline support)
- **Migration**: Automatic sync of existing local data

## Step 6: Testing the Integration

1. **Sign in** to your application with Google OAuth
2. **Send a message** - it should appear instantly
3. **Open in another tab/device** - messages should sync in real-time
4. **Go offline** - messages still work (stored locally)
5. **Come back online** - automatic sync to cloud
6. **Check History tab** - all conversations with search/filter

## Step 7: Data Migration

The system automatically:
1. Detects existing localStorage data
2. Creates default conversation in Supabase
3. Migrates all local messages to cloud
4. Shows sync status in UI

## Troubleshooting

### If tables don't exist:
- Re-run the SQL script in Supabase SQL Editor
- Check for SQL errors in the Supabase logs
- Verify your database permissions

### If real-time doesn't work:
- Check that real-time is enabled in Supabase project settings
- Verify the publication includes your tables
- Check browser console for WebSocket errors

### If authentication fails:
- Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- Check RLS policies are properly configured
- Ensure user is signed in through Supabase auth

## Usage Examples

### Creating a new conversation:
```typescript
const { createConversation } = useConversations();
const newConv = await createConversation("Chat about AI", "openai");
```

### Sending a message:
```typescript
const { createMessage } = useMessages(conversationId);
const message = await createMessage("Hello AI", "openai", "AI response");
```

### Syncing local data:
```typescript
const { syncLocalData } = useSupabaseSync();
const localData = enhancedStorage.getLocalData();
await syncLocalData(localData.messages);
```

## Benefits of This System

✅ **Never lose data**: Persistent cloud storage
✅ **Real-time sync**: Instant updates across devices  
✅ **Offline support**: Works without internet
✅ **Automatic migration**: Seamless upgrade from localStorage
✅ **Advanced search**: Find any conversation or message
✅ **Export capability**: Download complete history
✅ **Secure**: Row-level security, users see only their data
✅ **Scalable**: Handles thousands of messages efficiently

Your chat application now has enterprise-grade data persistence and real-time synchronization!