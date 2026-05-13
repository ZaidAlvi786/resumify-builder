-- Supabase Database Schema for AI Resume Builder
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add new columns for version history and industry templates (if they don't exist)
DO $$ 
BEGIN
    -- Add version_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='resumes' AND column_name='version_number') THEN
        ALTER TABLE resumes ADD COLUMN version_number INTEGER DEFAULT 1;
    END IF;
    
    -- Add parent_resume_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='resumes' AND column_name='parent_resume_id') THEN
        ALTER TABLE resumes ADD COLUMN parent_resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL;
    END IF;
    
    -- Add industry column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='resumes' AND column_name='industry') THEN
        ALTER TABLE resumes ADD COLUMN industry TEXT;
    END IF;
    
    -- Add template_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='resumes' AND column_name='template_name') THEN
        ALTER TABLE resumes ADD COLUMN template_name TEXT;
    END IF;
END $$;

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);

-- Create index on updated_at for sorting
CREATE INDEX IF NOT EXISTS idx_resumes_updated_at ON resumes(updated_at DESC);

-- Create index on parent_resume_id for version history
CREATE INDEX IF NOT EXISTS idx_resumes_parent_id ON resumes(parent_resume_id);

-- Enable Row Level Security (RLS)
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running the script)
DROP POLICY IF EXISTS "Users can view their own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can insert their own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can update their own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON resumes;

-- Create policy: Users can only see their own resumes
CREATE POLICY "Users can view their own resumes"
    ON resumes FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy: Users can insert their own resumes
CREATE POLICY "Users can insert their own resumes"
    ON resumes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own resumes
CREATE POLICY "Users can update their own resumes"
    ON resumes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own resumes
CREATE POLICY "Users can delete their own resumes"
    ON resumes FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists (to allow re-running the script)
DROP TRIGGER IF EXISTS update_resumes_updated_at ON resumes;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_resumes_updated_at
    BEFORE UPDATE ON resumes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE,
    plan TEXT DEFAULT 'free',
    credits INTEGER DEFAULT 5,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    status TEXT,
    price_id TEXT,
    quantity INTEGER,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for new tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Create policy for subscriptions
CREATE POLICY "Users can view their own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Create function to automatically update updated_at for profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically update updated_at for subscriptions
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, credits)
  VALUES (new.id, 5);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- AI MEMORY SYSTEM TABLES
-- ==========================================

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create conversations table for chat sessions
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create messages table with embedding support
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens INTEGER,
    embedding vector(768), -- Gemini embedding-001 use 768 dimensions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create conversation summaries table
CREATE TABLE IF NOT EXISTS chat_summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    last_message_id UUID REFERENCES chat_messages(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user long-term memory table
CREATE TABLE IF NOT EXISTS user_memories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fact_type TEXT NOT NULL, -- e.g., 'preference', 'tech_stack', 'project_config'
    content TEXT NOT NULL,
    confidence FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for vector search and performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_embedding ON chat_messages USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_user_memories_user_id ON user_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);

-- RLS for AI memory tables
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own chat_conversations" 
    ON chat_conversations FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own chat_messages" 
    ON chat_messages FOR ALL 
    USING (EXISTS (SELECT 1 FROM chat_conversations WHERE id = chat_messages.conversation_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage their own chat_summaries" 
    ON chat_summaries FOR ALL 
    USING (EXISTS (SELECT 1 FROM chat_conversations WHERE id = chat_summaries.conversation_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage their own user_memories" 
    ON user_memories FOR ALL USING (auth.uid() = user_id);

-- Update trigger for chat_conversations
CREATE TRIGGER update_chat_conversations_updated_at
    BEFORE UPDATE ON chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_chat_messages (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_conversation_id uuid
)
RETURNS TABLE (
  id uuid,
  content text,
  role text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.content,
    m.role,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM chat_messages m
  WHERE m.conversation_id = p_conversation_id
    AND 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ==========================================
-- TAILORING / SKELETON / EXTENSION / APPLICATIONS / INTEGRATIONS
-- Mirrors the per-migration files under supabase/migrations/. Keep in sync.
-- ==========================================

-- base_profiles: source-of-truth career history (one row per user).
CREATE TABLE IF NOT EXISTS base_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_base_profiles_user_id ON base_profiles(user_id);
ALTER TABLE base_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "base_profiles select own" ON base_profiles;
DROP POLICY IF EXISTS "base_profiles insert own" ON base_profiles;
DROP POLICY IF EXISTS "base_profiles update own" ON base_profiles;
DROP POLICY IF EXISTS "base_profiles delete own" ON base_profiles;
CREATE POLICY "base_profiles select own" ON base_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "base_profiles insert own" ON base_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "base_profiles update own" ON base_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "base_profiles delete own" ON base_profiles FOR DELETE USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_base_profiles_updated_at ON base_profiles;
CREATE TRIGGER update_base_profiles_updated_at
  BEFORE UPDATE ON base_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- jd_cache: deterministic JD-analysis cache keyed by sha256(jd_text). No RLS.
CREATE TABLE IF NOT EXISTS jd_cache (
  hash TEXT PRIMARY KEY,
  analysis JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_jd_cache_created_at ON jd_cache(created_at);

-- extension_handoffs: 10-min single-use tokens for the Chrome extension.
CREATE TABLE IF NOT EXISTS extension_handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('tailor','skeleton','save')),
  job_description TEXT NOT NULL,
  job_url TEXT,
  company TEXT,
  role TEXT,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_extension_handoffs_user_id ON extension_handoffs(user_id);
CREATE INDEX IF NOT EXISTS idx_extension_handoffs_expires_at ON extension_handoffs(expires_at);
ALTER TABLE extension_handoffs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "extension_handoffs select own" ON extension_handoffs;
CREATE POLICY "extension_handoffs select own" ON extension_handoffs FOR SELECT USING (auth.uid() = user_id);

-- applications: job-application tracker (soft-deleted rows hidden by RLS).
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  job_category TEXT,
  job_url TEXT,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'saved'
    CHECK (status IN ('saved','applied','interviewing','offer','rejected','withdrawn')),
  applied_at TIMESTAMPTZ,
  notes TEXT,
  jd_hash TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_applications_user_created ON applications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_user_status ON applications(user_id, status);
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "applications select own" ON applications;
DROP POLICY IF EXISTS "applications insert own" ON applications;
DROP POLICY IF EXISTS "applications update own" ON applications;
DROP POLICY IF EXISTS "applications delete own" ON applications;
CREATE POLICY "applications select own"
  ON applications FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "applications insert own"
  ON applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "applications update own"
  ON applications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "applications delete own"
  ON applications FOR DELETE USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- google_integrations: per-user Google Sheets connection state.
CREATE TABLE IF NOT EXISTS google_integrations (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  spreadsheet_id TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  scopes TEXT[] NOT NULL,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE google_integrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "google_integrations select own" ON google_integrations;
CREATE POLICY "google_integrations select own"
  ON google_integrations FOR SELECT USING (auth.uid() = user_id);

-- google_oauth_states: short-lived OAuth state + PKCE verifier holding pen.
CREATE TABLE IF NOT EXISTS google_oauth_states (
  state TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_verifier TEXT NOT NULL,
  return_url TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_google_oauth_states_user ON google_oauth_states(user_id);
CREATE INDEX IF NOT EXISTS idx_google_oauth_states_expires ON google_oauth_states(expires_at);
