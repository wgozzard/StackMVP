import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProjectCard } from '@/components/ProjectCard';

interface PageProps {
  params: { username: string };
}

// Use 'any' type to bypass the TypeScript error
export default async function ProfilePage(props: any) {
  const { username } = props.params;

  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Fetch the public profile by username
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (!profile) {
    return (
      <div>
        <h1>{username}</h1>
        <p>User not found.</p>
      </div>
    );
  }

  // Fetch the user's public projects
  const { data: projects } = await supabase
    .from('projects')
    .select(`*, profiles ( username, avatar_url )`)
    .eq('user_id', profile.user_id)
    .order('created_at', { ascending: false });

  // Optionally, get the current user if you need to show edit/delete buttons
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
  } catch {}

  // Get accurate like counts for each project
  for (const project of projects || []) {
    const { count } = await supabase
      .from('project_upvotes')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', project.id);
    project.upvotes = count || 0;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm font-medium text-gray-200 hover:bg-gray-800 hover:text-white transition-colors"
          >
            ← Back to StacknFlow
          </a>
        </div>

        {/* Profile Header */}
        <div className="mb-12 flex items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.avatar_url || '/default-avatar.png'} />
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
              Joined {new Date(profile.created_at).toISOString().slice(0, 10)}
            </p>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Projects</h2>
          {(!projects || projects.length === 0) ? (
            <p className="text-center text-gray-600 dark:text-gray-400">
              No projects yet
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10 justify-center">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={{
                    ...project,
                    profile: {
                      username: project.profiles?.username || profile.username,
                      avatar_url: project.profiles?.avatar_url || profile.avatar_url,
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