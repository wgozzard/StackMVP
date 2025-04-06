import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProjectCard } from '@/components/ProjectCard';

interface PageProps {
  params: {
    username: string;
  };
}

async function getProfileWithProjects(username: string) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // First get the profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (!profile) {
    notFound();
  }

  // Then get their projects
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      profiles (
        username,
        avatar_url
      )
    `)
    .eq('user_id', profile.user_id)
    .order('created_at', { ascending: false });

  return {
    profile,
    projects: projects || [],
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { profile, projects } = await getProfileWithProjects(params.username);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Profile Header */}
        <div className="mb-12 flex items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback>
              {profile.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{profile.username}</h1>
            {profile.bio && (
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {profile.bio}
              </p>
            )}
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Joined {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Projects</h2>
          {projects.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400">
              No projects yet
            </p>
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
                    } as any,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 