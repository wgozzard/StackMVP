import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  // Get authenticated user data
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error('Error fetching user:', userError);
  }

  const project = await getProjectWithProfile(params.id);
  const isOwner = user?.id === project.user_id;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Project Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <div className="mt-4 flex items-center gap-4">
              <Link 
                href={`/profile/${project.profiles.username}`} 
                className="group flex items-center gap-2"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={project.profiles.avatar_url || undefined} />
                  <AvatarFallback>
                    {project.profiles.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="block font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {project.profiles.username}
                  </span>
                  {project.profiles.bio && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                      {project.profiles.bio}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          </div>

          {isOwner && (
            <div className="flex gap-2">
              <Link
                href={`/projects/${project.id}/edit`}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                Edit
              </Link>
            </div>
          )}
        </div>

        {/* Project Image */}
        {project.cover_image_url && (
          <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
            <Image
              src={project.cover_image_url}
              alt={project.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Project Description */}
        {project.description && (
          <div className="prose mb-8 max-w-none dark:prose-invert">
            <p>{project.description}</p>
          </div>
        )}
      </div>
    </main>
  );
} 