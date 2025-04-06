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

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Featured Projects</h1>
        {session && (
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            Create New Project
          </Link>
        )}
      </div>
      
      {projects.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed">
          <p className="mb-4 text-center text-gray-500">
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
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
    </main>
  );
}
