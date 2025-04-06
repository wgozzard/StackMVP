import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the project to verify ownership
    const { data: project } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', params.id)
      .single();

    // Check if project exists and user owns it
    if (!project) {
      return new NextResponse('Project not found', { status: 404 });
    }
    if (project.user_id !== user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Delete the project
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      console.error('Error deleting project:', deleteError);
      return new NextResponse('Error deleting project', { status: 500 });
    }

    // Redirect to home page after successful deletion
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Error in delete route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 