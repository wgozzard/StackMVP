'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

interface UpvoteButtonProps {
  projectId: string;
  initialUpvotes: number;
  isAuthenticated: boolean;
}

export default function UpvoteButton({ projectId, initialUpvotes, isAuthenticated }: UpvoteButtonProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    const supabase = createClientComponentClient();
    let mounted = true;
    async function fetchUpvoteState() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Check if user has already upvoted
      const { data: existingUpvote } = await supabase
        .from('project_upvotes')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();
      if (mounted) setIsUpvoted(!!existingUpvote);
    }
    fetchUpvoteState();
    return () => { mounted = false; };
  }, [projectId, isAuthenticated]);

  async function refreshUpvotes() {
    const supabase = createClientComponentClient();
    const { data: project } = await supabase
      .from('projects')
      .select('upvotes')
      .eq('id', projectId)
      .single();
    if (project) setUpvotes(project.upvotes);
  }

  async function handleUpvote() {
    if (!isAuthenticated) {
      toast.error('Please sign in to upvote projects');
      return;
    }
    if (isLoading) return;
    setIsLoading(true);
    const supabase = createClientComponentClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      // Check if user has already upvoted
      const { data: existingUpvote } = await supabase
        .from('project_upvotes')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();
      if (existingUpvote) {
        // Remove upvote
        await supabase
          .from('project_upvotes')
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', user.id);
        await supabase
          .from('projects')
          .update({ upvotes: upvotes - 1 })
          .eq('id', projectId);
        setIsUpvoted(false);
        toast.success('Upvote removed');
      } else {
        // Add upvote
        await supabase
          .from('project_upvotes')
          .insert({ project_id: projectId, user_id: user.id });
        await supabase
          .from('projects')
          .update({ upvotes: upvotes + 1 })
          .eq('id', projectId);
        setIsUpvoted(true);
        toast.success('Project upvoted!');
      }
      await refreshUpvotes();
    } catch (error: any) {
      console.error('Failed to toggle upvote:', error);
      toast.error('Failed to update upvote');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleUpvote}
      disabled={isLoading}
      className={`flex items-center gap-1 transition-colors ${
        isUpvoted ? 'text-blue-600 dark:text-blue-400' : ''
      } ${isLoading ? 'opacity-50' : ''}`}
      aria-pressed={isUpvoted}
    >
      <ThumbsUp className={`h-4 w-4 ${isLoading ? 'animate-pulse' : ''}`} />
      <span>{upvotes}</span>
    </button>
  );
} 