import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SITE_URLS } from '@/lib/constants';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') || '/';
  
  // Log all parameters for debugging
  console.log('Auth callback received:', {
    url: request.url,
    code: code ? 'present' : 'missing',
    type,
    next
  });

  if (code) {
    try {
      const supabase = createRouteHandlerClient({ cookies });
      await supabase.auth.exchangeCodeForSession(code);
      
      // Check if this is a password recovery flow
      if (type === 'recovery') {
        console.log('Processing password recovery flow');
        // Redirect to update-password page for password reset
        return NextResponse.redirect(new URL('/auth/update-password', requestUrl.origin));
      }
      
      // Check if this is an email confirmation flow
      if (type === 'signup' || type === 'email_change') {
        console.log('Processing email verification flow');
      }
    
      // Check if the user already has a profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        // If user doesn't have a profile, redirect to create-profile
        if (!profile) {
          return NextResponse.redirect(new URL('/create-profile', requestUrl.origin));
        }
        
        // If user has a profile, redirect to dashboard or next URL
        return NextResponse.redirect(new URL(next, requestUrl.origin));
      }
    } catch (error) {
      console.error('Error in auth callback:', error);
      // Redirect to error page or login on error
      return NextResponse.redirect(new URL('/auth/login', requestUrl.origin));
    }
  }
  
  // Default redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
} 