import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Globe } from 'lucide-react';
import { DeleteProjectButton } from '@/components/DeleteProjectButton';

interface PageProps {
  params: {
    id: string;
  };
}

async function getProjectWithProfile(projectId: string) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      profiles (
        username,
        avatar_url,
        bio
      )
    `)
    .eq('id', projectId)
    .single();

  if (!project) {
    notFound();
  }

  return project;
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = params;
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  // Get authenticated user data
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error('Error fetching user:', userError);
  }

  const project = await getProjectWithProfile(id);
  const isOwner = user?.id === project.user_id;

  return (
    <main className="min-h-screen bg-black">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Project Header */}
        <div className="mb-8 flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              {project.title}
            </h1>
            <div className="mt-6">
              <Link 
                href={`/profile/${project.profiles.username}`} 
                className="group inline-flex items-center gap-3"
              >
                <Avatar className="h-12 w-12 ring-2 ring-blue-500/0 transition-all group-hover:ring-blue-500">
                  <AvatarImage src={project.profiles.avatar_url || undefined} />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {project.profiles.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="block text-lg font-medium text-white group-hover:text-blue-400">
                    {project.profiles.username}
                  </span>
                  {project.profiles.bio && (
                    <p className="mt-1 text-sm text-gray-400 line-clamp-1">
                      {project.profiles.bio}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          </div>

          {isOwner && (
            <div className="flex gap-3">
              <Link
                href={`/projects/${project.id}/edit`}
                className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
              >
                Edit Project
              </Link>
              <DeleteProjectButton projectId={project.id} />
            </div>
          )}
        </div>

        {/* Project Image */}
        {project.image_url && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <a href={project.image_url} target="_blank" rel="noopener noreferrer">
              <Image
                src={project.image_url}
                alt={project.title}
                className="h-full w-full object-cover"
                width={1920}
                height={1080}
                priority
              />
            </a>
          </div>
        )}

        {/* Project Description */}
        {project.description && (
          <div className="prose prose-lg prose-invert mb-12 max-w-none">
            <p>{project.description}</p>
          </div>
        )}

        {/* Project Links */}
        {project.project_url && (
          <div className="flex items-center gap-4">
            <a
              href={project.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Globe className="h-4 w-4" />
              Visit Project
            </a>
          </div>
        )}
      </div>
    </main>
  );
} 