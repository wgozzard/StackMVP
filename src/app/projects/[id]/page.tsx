import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Globe, ExternalLink, Eye, ThumbsUp } from 'lucide-react';
import { DeleteProjectButton } from '@/components/DeleteProjectButton';
import LikeButtonSection from './LikeButtonSection';

export default async function ProjectPage(props: any) {
  const { id } = props.params;
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  // Handle authentication gracefully for both logged-in and non-logged-in users
  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error) {
      user = data.user;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    // Continue without user authentication
  }

  const project = await getProjectWithProfile(id);
  const isOwner = user?.id === project.user_id;
  const socialLinks = project.social_links as { title: string; url: string }[] || [];

  return (
    <main className="min-h-screen bg-black">
      {/* Back to StacknFlow button */}
      <div className="mx-auto max-w-5xl px-4 pt-6 pb-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm font-medium text-gray-200 hover:bg-gray-800 hover:text-white transition-colors"
        >
          ← Back to StacknFlow
        </Link>
      </div>
      {/* GitHub-style header with border */}
      <div className="border-b border-gray-800">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="flex items-center justify-between">
            <Link 
              href={`/profile/${project.profiles.username}`}
              className="group flex items-center gap-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={project.profiles.avatar_url || '/default-avatar.png'} />
                <AvatarFallback className="bg-blue-600 text-white">
                  {project.profiles.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="text-sm font-medium text-white group-hover:text-blue-400">
                  {project.profiles.username}
                </span>
                {project.profiles.bio && (
                  <p className="text-sm text-gray-400">
                    {project.profiles.bio}
                  </p>
                )}
              </div>
            </Link>

            <div className="flex items-center gap-4">
              {/*
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <div className="flex items-center gap-1.5">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{project.upvotes}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  <span>{project.views}</span>
                </div>
              </div>
              */}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Title Section */}
        <div className="mb-8 border-b border-gray-800 pb-6">
          <div className="flex items-start justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {project.title}
            </h1>
            {isOwner && (
              <div className="flex gap-3">
                <Link
                  href={`/projects/${project.id}/edit`}
                  className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
                >
                  Edit Project
                </Link>
                <DeleteProjectButton projectId={project.id} />
              </div>
            )}
          </div>
        </div>

        {/* Project Image */}
        <div className="mx-auto mb-8 max-w-4xl overflow-hidden rounded-xl border border-gray-800 bg-neutral-900 shadow-lg">
          <div className="flex items-center justify-center">
            <Image
              className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              src={project.image_url || '/default-project.png'}
              alt={project.title}
              width={1920}
              height={1080}
              priority
            />
          </div>
        </div>

        <hr className="my-8 border-t border-gray-800" />

        <div className="grid gap-8 lg:grid-cols-[1fr,300px]">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Description & Project URL Section */}
            <div className="rounded-lg border border-gray-800 bg-neutral-900 px-6 py-4 space-y-4">
              {project.description ? (
                <div className="text-lg leading-relaxed text-gray-300">
                  {project.description}
                </div>
              ) : (
                <p className="text-gray-500">No description provided</p>
              )}

              {project.project_url && (
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700 hover:scale-[1.02]"
                >
                  <Globe className="h-4 w-4" />
                  Visit Project
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>
              )}
            </div>

            <hr className="border-t border-gray-800" />

            {/* Tags Section */}
            <div className="rounded-lg border border-gray-800 bg-neutral-900 px-6 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <h2 className="text-lg font-medium text-white whitespace-nowrap">Built With</h2>
                <div className="flex flex-wrap gap-2">
                  {project.tags && project.tags.length > 0 ? (
                    project.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-gray-800 px-3 py-1 text-sm text-gray-300 transition-colors hover:bg-gray-700"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">No technologies specified</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Connect Section */}
          <div>
            <div className="rounded-lg border border-gray-800 bg-neutral-900 px-6 py-4">
              <h2 className="mb-4 text-lg font-medium text-white">Connect</h2>
              {socialLinks.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-300 transition-all hover:bg-gray-700 hover:text-white hover:scale-[1.02]"
                    >
                      <span>{link.title}</span>
                      <ExternalLink className="h-4 w-4 opacity-70" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 text-center">
                  <p className="text-sm text-gray-500">No social links added yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Like Button at Bottom */}
      <LikeButtonSection projectId={project.id} user={user} projectOwnerId={project.user_id} />
    </main>
  );
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