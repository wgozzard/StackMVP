import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession();

  // Protected routes that require authentication
  const protectedPaths = [
    '/dashboard',
    '/projects/new',
    '/projects/[id]/edit',
    '/profile',
    '/create-profile'
  ];
  
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path) ||
    request.nextUrl.pathname.match(/^\/projects\/.*\/edit$/)
  );

  // Allow public access to profile detail pages like /profile/[username]
  const isPublicProfilePage = request.nextUrl.pathname.match(/^\/profile\/[^\/]+$/);
  if (isPublicProfilePage) {
    return res;
}

  // Auth routes that should redirect if user is already authenticated
  const authRoutes = ['/auth/login', '/auth/signup'];
  const isAuthRoute = authRoutes.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAuthRoute && session) {
    // Redirect authenticated users away from auth routes
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isProtectedPath) {
    if (!session) {
      // Redirect unauthenticated users to login
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirect_to', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user has a profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    // Don't redirect if user is already on create-profile page
    const isCreateProfilePath = request.nextUrl.pathname === '/create-profile';
    
    if (!profile && !isCreateProfilePath) {
      // Redirect users without a profile to create one
      return NextResponse.redirect(new URL('/create-profile', request.url));
    }

    // If trying to edit a project, verify ownership
    if (request.nextUrl.pathname.match(/^\/projects\/.*\/edit$/)) {
      const projectId = request.nextUrl.pathname.split('/')[2];
      const { data: project } = await supabase
        .from('projects')
        .select('user_id')
        .eq('id', projectId)
        .single();

      if (!project || project.user_id !== session.user.id) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)',
  ],
}; 