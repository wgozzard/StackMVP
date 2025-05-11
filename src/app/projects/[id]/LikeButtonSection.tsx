'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { ThumbsUp } from 'lucide-react';

export default function LikeButtonSection({ projectId, user, projectOwnerId }: { projectId: string; user: any; projectOwnerId: string }) {
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  const isOwner = user && user.id === projectOwnerId;
  const isAuthenticated = !!user;

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('upvotes')
          .eq('id', projectId)
          .single();

        if (error) throw error;

        setLikeCount(data.upvotes || 0);

        // Check local storage for like status
        const likedProjects = JSON.parse(localStorage.getItem('likedProjects') || '{}');
        setIsLiked(!!likedProjects[projectId]);
      } catch (err) {
        console.error("Error fetching project data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, supabase, isLiked]);

  async function handleLike() {
    if (!isAuthenticated) {
      toast('Please sign in to like this project.');
      return;
    }

    if (isOwner) {
      toast("You can't like your own project.");
      return;
    }

    if (loading) return; // Prevent rapid clicks

    setLoading(true);

    try {
      // Check if the user has already liked the project
      const { data: existingLike, error: fetchError } = await supabase
        .from('project_upvotes')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existingLike) {
        // User has liked the project, so remove the like
        const { error: deleteError } = await supabase
          .from('project_upvotes')
          .delete()
          .eq('id', existingLike.id);

        if (deleteError) throw deleteError;

        const { error: updateError } = await supabase
          .from('projects')
          .update({ upvotes: likeCount - 1 })
          .eq('id', projectId);

        if (updateError) throw updateError;

        setLikeCount(likeCount - 1);
        setIsLiked(false);
        toast.success('Like removed');
      } else {
        // User has not liked the project, so add the like
        const { error: insertError } = await supabase
          .from('project_upvotes')
          .insert({ project_id: projectId, user_id: user.id });

        if (insertError) throw insertError;

        const { error: updateError } = await supabase
          .from('projects')
          .update({ upvotes: likeCount + 1 })
          .eq('id', projectId);

        if (updateError) throw updateError;

        setLikeCount(likeCount + 1);
        setIsLiked(true);
        toast.success('Project liked!');
      }
    } catch (err) {
      console.error("Like error:", err);
      toast.error('Failed to update like');
    } finally {
      setLoading(false);
    }
  }

  let tooltip = '';
  if (!isAuthenticated) tooltip = 'Please sign in to like this project.';
  else if (isOwner) tooltip = "You can't like your own project.";
  else if (isLiked) tooltip = 'Unlike';
  else tooltip = 'Like';

  return null;
} 