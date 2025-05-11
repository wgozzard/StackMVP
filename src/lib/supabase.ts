import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import type { Profile, Project } from '@/types';
import { STORAGE_BUCKETS } from '@/types';

export const createClient = () => createClientComponentClient<Database>();

export async function getProfile(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(profile: Partial<Profile> & { user_id: string }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('user_id', profile.user_id)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function getProjects(options?: {
  userId?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = createClient();
  let query = supabase.from('projects').select(`
    *,
    profiles (
      username,
      avatar_url
    )
  `);

  if (options?.userId) {
    query = query.eq('user_id', options.userId);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data as (Project & { profiles: Pick<Profile, 'username' | 'avatar_url'> })[];
}

export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'upvotes' | 'views' | 'updated_at'>) {
  const supabase = createClient();
  
  // Create a new object without the updated_at field to avoid database errors
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();

  if (error) throw error;
  return data as Project;
}

export async function updateProject(
  projectId: string,
  updates: Partial<Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;
  return data as Project;
}

export async function deleteProject(projectId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) throw error;
}

// Storage utilities
export async function uploadImage(
  bucket: typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS],
  filePath: string,
  file: File
) {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw error;

  return supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;
}

export async function deleteImage(
  bucket: typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS],
  filePath: string
) {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) throw error;
} 