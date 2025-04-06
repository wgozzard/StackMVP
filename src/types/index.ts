export interface Profile {
  id: string;
  user_id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  image_url?: string;
  tags: string[];
  upvotes: number;
  views: number;
  project_url?: string;
  social_links: any[]; // JSONB array in Postgres
  created_at: string;
}

export interface StorageBucketName {
  AVATARS: 'avatars';
  PROJECTS: 'projects';
}

// Utility type for storage paths
export const STORAGE_BUCKETS: StorageBucketName = {
  AVATARS: 'avatars',
  PROJECTS: 'projects',
} as const; 