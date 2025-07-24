# Supabase Database Setup Guide

## Step 1: Run the SQL Schema

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Click on "SQL Editor" in the left sidebar

2. **Create the Database Tables**
   - Click "New Query" 
   - Copy and paste the entire content from `supabase_schema.sql`
   - Click "Run" to execute the script

3. **Verify Tables Created**
   - Go to "Table Editor" in the sidebar
   - You should see 3 tables: `users`, `requests`, `analytics`
   - The `users` table should have 1 demo user already inserted

## Step 2: Update Database Configuration

Your application is already configured to use Supabase with:
- ✅ `DATABASE_URL` (already set)
- ✅ `SUPABASE_ANON_KEY` (just added)

## Step 3: Test the Connection

The application will automatically connect to your Supabase database. You can test by:

1. **Submit a test message** in the chat interface
2. **Check the analytics** to see if data is being stored
3. **View the history** to confirm requests are being saved

## Database Tables Overview

### `users` Table
- Stores user information
- Demo user already created for testing

### `requests` Table  
- Stores all AI requests (prompts and documents)
- Tracks processing status and responses
- Links to the user who made the request

### `analytics` Table
- Stores performance metrics
- Tracks model usage and success rates
- Used for the analytics dashboard

## Security Features

- **Row Level Security (RLS)**: Enabled for data protection
- **Public Access**: Currently allowed for demo purposes
- **UUID Primary Keys**: More secure than sequential IDs
- **Indexes**: Optimized for fast queries

## What Happens Next

Once you run the SQL script:
1. Your multi-AI platform will store all data in Supabase
2. Analytics will track real usage statistics  
3. Chat history will persist between sessions
4. You'll be ready for Vercel deployment!

## Troubleshooting

If you get any errors:
- Make sure you're in the correct Supabase project
- Check that your DATABASE_URL is correct
- Verify the SUPABASE_ANON_KEY is properly set

Your platform will work exactly the same, but now with persistent data storage!