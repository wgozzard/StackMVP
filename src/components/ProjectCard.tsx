import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Database } from '@/lib/database.types';

type Project = Database['public']['Tables']['projects']['Row'] & {
  profile: {
    username: string;
    avatar_url: string | null;
  };
};

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        {project.cover_image_url && (
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={project.cover_image_url}
              alt={project.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <Link
          href={`/projects/${project.id}`}
          className="block hover:underline"
        >
          <h3 className="text-xl font-semibold">{project.title}</h3>
        </Link>
        <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
          {project.description}
        </p>
      </CardContent>
      <CardFooter className="flex items-center gap-2 border-t p-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={project.profile.avatar_url || undefined} />
          <AvatarFallback>
            {project.profile.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <Link
          href={`/profile/${project.profile.username}`}
          className="text-sm hover:underline"
        >
          {project.profile.username}
        </Link>
      </CardFooter>
    </Card>
  );
} 