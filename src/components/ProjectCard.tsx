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
    <div className="group relative overflow-hidden rounded-lg bg-gray-900 transition-all duration-300 hover:scale-[1.02]">
      {/* Project Image */}
      {project.image_url && (
        <Link href={`/projects/${project.id}`}>
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              src={project.image_url}
              alt={project.title}
              width={1920}
              height={1080}
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
          </div>
        </Link>
      )}

      {/* Project Info */}
      <div className="p-4">
        <div className="mb-4">
          <Link 
            href={`/projects/${project.id}`}
            className="block hover:text-blue-400"
          >
            <h3 className="text-xl font-semibold text-white">{project.title}</h3>
          </Link>
          {project.description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-400">
              {project.description}
            </p>
          )}
        </div>

        {/* Project Stats & Author */}
        <div className="flex items-center justify-between">
          <Link 
            href={`/profile/${project.profile.username}`}
            className="group/avatar flex items-center gap-2"
          >
            <Avatar className="h-8 w-8 ring-2 ring-blue-500/0 transition-all group-hover/avatar:ring-blue-500">
              <AvatarImage src={project.profile.avatar_url || undefined} />
              <AvatarFallback className="bg-blue-600 text-white">
                {project.profile.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-300 transition-colors group-hover/avatar:text-blue-400">
              {project.profile.username}
            </span>
          </Link>

          <div className="flex items-center gap-3 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span>0</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 