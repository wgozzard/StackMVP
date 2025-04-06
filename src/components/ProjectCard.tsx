import Link from 'next/link';
import Image from 'next/image';
import { Eye, ThumbsUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Database } from '@/lib/database.types';

type Project = Database['public']['Tables']['projects']['Row'] & {
  profile: {
    username: string;
    avatar_url: string | null;
  };
};

interface ProjectCardProps {
  project: Project;
  className?: string;
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-[#0A0A0A] transition-all duration-300 hover:scale-[1.02]">
      {/* Project Image */}
      <Link href={`/projects/${project.id}`} className="block">
        <div className="relative aspect-video w-full overflow-hidden">
          {project.image_url ? (
            <Image
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              src={project.image_url}
              alt={project.title}
              width={1920}
              height={1080}
              priority={false}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-800">
              <span className="text-sm text-gray-400">No image</span>
            </div>
          )}
        </div>
      </Link>

      {/* Project Info Bar */}
      <div className="flex items-center justify-between bg-[#0F1117] px-4 py-3">
        <Link 
          href={`/profile/${project.profile.username}`}
          className="group/avatar flex items-center gap-2"
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={project.profile.avatar_url || undefined} />
            <AvatarFallback className="bg-blue-600 text-xs text-white">
              {project.profile.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-300 transition-colors group-hover/avatar:text-blue-400">
            {project.profile.username}
          </span>
        </Link>

        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1.5">
            <ThumbsUp className="h-4 w-4" />
            <span>{project.upvotes}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            <span>{project.views}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 