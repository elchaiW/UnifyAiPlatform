-- Multi-AI Platform Database Schema for Supabase
-- Run this script in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create ai_requests table (matches your Drizzle schema)
CREATE TABLE IF NOT EXISTS ai_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'prompt' or 'document'
    content TEXT NOT NULL,
    file_name TEXT,
    category TEXT NOT NULL, -- 'legal', 'marketing', 'coding', 'general'
    selected_model TEXT NOT NULL, -- 'claude', 'chatgpt', 'gemini', 'grok'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    response TEXT,
    processing_time DECIMAL(10,3),
    classification JSONB, -- Enhanced classification data from Claude analysis
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id INTEGER NOT NULL REFERENCES ai_requests(id) ON DELETE CASCADE,
    model_used TEXT NOT NULL,
    response_time DECIMAL(10,3) NOT NULL,
    success BOOLEAN NOT NULL,
    error_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_requests_user_id ON ai_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_created_at ON ai_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_requests_status ON ai_requests(status);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_model_used ON analytics(model_used);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at DESC);

-- Insert demo user for testing
INSERT INTO users (username, email, password) 
VALUES ('demo', 'demo@example.com', 'demo123') 
ON CONFLICT (username) DO NOTHING;

-- Create Row Level Security (RLS) policies (optional but recommended)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- For now, allow public access (you can restrict this later with proper auth)
CREATE POLICY "Allow public access to users" ON users
    FOR ALL USING (true);

CREATE POLICY "Allow public access to ai_requests" ON ai_requests
    FOR ALL USING (true);

CREATE POLICY "Allow public access to analytics" ON analytics
    FOR ALL USING (true);