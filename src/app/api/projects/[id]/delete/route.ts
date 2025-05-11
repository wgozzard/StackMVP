import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Extract the project ID from the URL
    const url = new URL(req.url);
    const match = url.pathname.match(/\/api\/projects\/(.+)\/delete/);
    const projectId = match ? match[1] : null;
    if (!projectId) {
      return new Response('Project ID not found in URL', { status: 400 });
    }

    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get the project to verify ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    // Check if project exists and user owns it
    if (projectError || !project) {
      return new Response('Project not found', { status: 404 });
    }
    if (project.user_id !== user.id) {
      return new Response('Forbidden', { status: 403 });
    }

    // Delete the project
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (deleteError) {
      console.error('Error deleting project:', deleteError);
      return new Response('Failed to delete project', { status: 500 });
    }

    // Redirect to home page after successful deletion
    return NextResponse.redirect(new URL('/', req.url));
  } catch (error) {
    console.error('Error in delete route:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 