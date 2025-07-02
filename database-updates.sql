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

-- Enable Row Level Security (optional)
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Create a policy for reading announcements (everyone can read)
CREATE POLICY "Everyone can read announcements" ON announcements
    FOR SELECT USING (true);

-- Create a policy for inserting announcements (only admins, execs, directors)
CREATE POLICY "Leadership can insert announcements" ON announcements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = announcements.author_id::uuid 
            AND users.role IN ('admin', 'exec', 'director')
        )
    );

-- Create a policy for updating announcements (only the author or admins)
CREATE POLICY "Authors and admins can update announcements" ON announcements
    FOR UPDATE USING (
        announcements.author_id::uuid = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Create a policy for deleting announcements (only the author or admins)
CREATE POLICY "Authors and admins can delete announcements" ON announcements
    FOR DELETE USING (
        announcements.author_id::uuid = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    ); 