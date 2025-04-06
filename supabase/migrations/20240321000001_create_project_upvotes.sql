-- Create project_upvotes table
CREATE TABLE IF NOT EXISTS project_upvotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(project_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_project_upvotes_project_id ON project_upvotes(project_id);
CREATE INDEX idx_project_upvotes_user_id ON project_upvotes(user_id);

-- Add RLS policies
ALTER TABLE project_upvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
ON project_upvotes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON project_upvotes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for authenticated users"
ON project_upvotes FOR DELETE
TO authenticated
USING (auth.uid() = user_id); 