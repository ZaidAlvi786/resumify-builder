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

