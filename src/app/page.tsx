import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { ProjectCard } from '@/components/ProjectCard';
import { getProjects } from '@/lib/supabase';
import { Plus } from 'lucide-react';

export const revalidate = 60; // Revalidate this page every 60 seconds

export default async function HomePage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const { data: { session } } = await supabase.auth.getSession();
  const projects = await getProjects({ limit: 12 });

  // Get accurate like counts for each project
  for (const project of projects) {
    const { count } = await supabase
      .from('project_upvotes')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', project.id);
    
    // Update the project's upvote count with the actual count from project_upvotes
    project.upvotes = count || 0;
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Featured Projects
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Discover amazing projects from our community
            </p>
          </div>
          {session && (
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create New Project
            </Link>
          )}
        </div>
        
        {projects.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 p-8 dark:border-gray-800 dark:bg-gray-900/50">
            <p className="mb-4 text-center text-lg text-gray-600 dark:text-gray-400">
              No projects yet. Be the first to share your work!
            </p>
            {!session ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/auth/login"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Log in
                </Link>
                <span className="text-gray-400">or</span>
                <Link
                  href="/auth/signup"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Sign up to share your work
                </Link>
              </div>
            ) : (
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 text-blue-600 hover:underline dark:text-blue-400"
              >
                <Plus className="h-4 w-4" />
                Create your first project
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10 justify-center">
            {projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={{
                  ...project,
                  profile: {
                    username: project.profiles.username,
                    avatar_url: project.profiles.avatar_url,
                  } as any
                }} 
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
