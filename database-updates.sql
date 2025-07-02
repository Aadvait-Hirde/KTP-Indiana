-- Update the users table to include the new 'newmember' role
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'exec', 'director', 'member', 'newmember'));

-- Create the announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  author_id uuid not null,
  author_name text not null,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);

-- Disable Row Level Security since we're using Clerk auth instead of Supabase auth
-- RLS policies with auth.uid() don't work with external auth providers
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies since we're disabling RLS
DROP POLICY IF EXISTS "Leadership can insert announcements" ON announcements;
DROP POLICY IF EXISTS "Authors and admins can update announcements" ON announcements;
DROP POLICY IF EXISTS "Authors and admins can delete announcements" ON announcements;
DROP POLICY IF EXISTS "Everyone can read announcements" ON announcements;
DROP POLICY IF EXISTS "Users can view announcements" ON announcements;
DROP POLICY IF EXISTS "Users can view non-hidden announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can view all announcements" ON announcements;
DROP POLICY IF EXISTS "View announcements policy" ON announcements;

-- Add hidden column to announcements table
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT FALSE;

-- Update existing announcements to not be hidden by default
UPDATE announcements SET hidden = FALSE WHERE hidden IS NULL; 