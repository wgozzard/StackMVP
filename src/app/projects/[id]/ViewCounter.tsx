'use client';

import { useEffect } from 'react';
import { Eye } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ViewCounterProps {
  projectId: string;
  initialViews: number;
}

export default function ViewCounter({ projectId, initialViews }: ViewCounterProps) {
  useEffect(() => {
    const supabase = createClientComponentClient();
    const incrementViews = async () => {
      const { error } = await supabase
        .from('projects')
        .update({ views: initialViews + 1 })
        .eq('id', projectId);

      if (error) {
        console.error('Failed to increment views:', error);
      }
    };

    incrementViews();
  }, [projectId, initialViews]);

  return (
    <div className="flex items-center gap-1">
      <Eye className="h-4 w-4" />
      <span>{initialViews}</span>
    </div>
  );
} 