'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { ImageCropper } from '@/components/ImageCropper';
import { STORAGE_BUCKETS } from '@/types';
import { updateProject, uploadImage } from '@/lib/supabase';
import { X } from 'lucide-react';
import type { Project } from '@/types';

interface SocialLink {
  title: string;
  url: string;
}

export default function EditProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadProject() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const { data: project } = await supabase
          .from('projects')
          .select('*')
          .eq('id', params.id)
          .single();

        if (!project) {
          toast.error('Project not found');
          router.push('/dashboard');
          return;
        }

        if (project.user_id !== session.user.id) {
          toast.error('You do not have permission to edit this project');
          router.push('/dashboard');
          return;
        }

        setProject(project);
        setTitle(project.title);
        setDescription(project.description || '');
        setProjectUrl(project.project_url || '');
        setTags(project.tags || []);
        setSocialLinks(project.social_links || []);
        if (project.image_url) {
          setImagePreview(project.image_url);
        }
      } catch (error) {
        toast.error('Failed to load project');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProject();
  }, [params.id, router, supabase]);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleAddTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
        setTagInput('');
      }
    }
  }

  function handleRemoveTag(tagToRemove: string) {
    setTags(tags.filter(tag => tag !== tagToRemove));
  }

  function handleAddSocialLink() {
    setSocialLinks([...socialLinks, { title: '', url: '' }]);
  }

  function handleRemoveSocialLink(index: number) {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  }

  function handleSocialLinkChange(index: number, field: keyof SocialLink, value: string) {
    const newLinks = [...socialLinks];
    newLinks[index][field] = value;
    setSocialLinks(newLinks);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!project) return;
    
    setIsSubmitting(true);

    try {
      let imageUrl = project.image_url;
      if (imageFile) {
        const fileName = `${project.user_id}-${Date.now()}`;
        imageUrl = await uploadImage(STORAGE_BUCKETS.PROJECTS, fileName, imageFile);
      }

      await updateProject(project.id, {
        title,
        description,
        image_url: imageUrl,
        project_url: projectUrl || undefined,
        tags,
        social_links: socialLinks,
      });

      toast.success('Project updated successfully');
      router.push(`/projects/${project.id}`);
      router.refresh();
    } catch (error) {
      toast.error('Failed to update project');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-96 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-2xl font-bold">Edit Project</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium">
              Project Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>

          <div>
            <label htmlFor="projectUrl" className="block text-sm font-medium">
              Project URL
            </label>
            <input
              id="projectUrl"
              type="url"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              placeholder="https://"
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium">
              Tags
            </label>
            <input
              id="tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              placeholder="Press Enter or comma to add tags"
            />
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 rounded-full p-1 hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Social Links</label>
            <div className="mt-2 space-y-3">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => handleSocialLinkChange(index, 'title', e.target.value)}
                    placeholder="Title"
                    className="w-1/3 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                    placeholder="https://"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSocialLink(index)}
                    className="rounded-md border border-gray-300 p-2 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddSocialLink}
                className="mt-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                + Add Social Link
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Project Image</label>
            <div className="mt-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
              />
            </div>
            {imagePreview && (
              <div className="mt-4">
                <ImageCropper
                  imageUrl={imagePreview}
                  aspect={16/9}
                  className="h-48"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Updating Project...' : 'Update Project'}
          </button>
          <button
            type="button"
            className="mt-4 w-full rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            onClick={() => router.push('/dashboard')}
          >
            Cancel
          </button>
        </form>
      </div>
    </main>
  );
} 