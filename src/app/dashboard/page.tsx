import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ProjectCard } from '@/components/ProjectCard';
import { getProjects } from '@/lib/supabase';

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  const projects = await getProjects({ userId: session.user.id });

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Projects</h1>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Create New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed">
          <p className="mb-4 text-center text-gray-500">
            You haven't created any projects yet
          </p>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 text-blue-600 hover:underline"
          >
            <Plus className="h-4 w-4" />
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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