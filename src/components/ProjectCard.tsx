import Link from 'next/link';
import Image from 'next/image';
import { Eye, ThumbsUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Database } from '@/lib/database.types';

type Project = {
  id: string;
  user_id: string;
  title: string;
  image_url?: string | null;
  upvotes: number;
  views: number;
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
    <div
      className={`flex flex-col justify-between bg-[#101014] rounded-xl border border-gray-800 shadow-sm w-[320px] h-[320px] mx-auto transition-transform duration-200 hover:scale-[1.03] ${className || ''}`}
    >
      {/* Top: Avatar and Username */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={project.profile.avatar_url || '/default-avatar.png'} />
          <AvatarFallback className="bg-blue-600 text-xs text-white">
            {project.profile.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-base font-medium text-gray-200 truncate max-w-[180px]">
          {project.profile.username}
        </span>
      </div>

      {/* Project Image */}
      <Link href={`/projects/${project.id}`} className="block">
        <div className="relative w-full h-[140px] overflow-hidden rounded-md mx-auto">
          <Image
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            src={project.image_url || '/default-project.png'}
            alt={project.title}
            width={320}
            height={140}
            priority={false}
          />
        </div>
      </Link>

      {/* Project Title */}
      <div className="px-4 pt-3 pb-1 min-h-[32px] flex items-center">
        <Link
          href={`/projects/${project.id}`}
          className="block font-bold text-lg text-white truncate max-w-full"
          title={project.title}
        >
          {project.title}
        </Link>
      </div>

      {/* Bottom: Like and View Counts */}
      {/*
      <div className="flex items-center justify-between px-4 pb-4 pt-2 mt-auto">
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
      */}
    </div>
  );
} 