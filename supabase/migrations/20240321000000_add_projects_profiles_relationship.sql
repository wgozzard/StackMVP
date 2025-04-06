-- Add foreign key constraint to projects table
ALTER TABLE projects
ADD CONSTRAINT fk_projects_profiles
FOREIGN KEY (user_id)
REFERENCES profiles(user_id)
ON DELETE CASCADE;

-- Create index on user_id for better performance
CREATE INDEX idx_projects_user_id ON projects(user_id); 