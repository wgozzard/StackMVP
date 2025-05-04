'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { LogOut, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import type { Profile } from '@/types';

export function Navigation() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const pathname = usePathname();
  const supabase = createClientComponentClient();

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          if (mounted) {
            setIsSignedIn(false);
            setIsLoading(false);
          }
          return;
        }

        setIsSignedIn(true);

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (mounted) {
          setProfile(profile);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        loadProfile();
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setIsSignedIn(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  // Don't show navigation on auth pages
  if (pathname.startsWith('/auth/') || pathname === '/create-profile') {
    return null;
  }

  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          StacknFlow
        </Link>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="flex items-center gap-4">
              <div className="h-8 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
            </div>
          ) : isSignedIn ? (
            <>
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                New Project
              </Link>
              
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-sm hover:text-blue-600 dark:hover:text-blue-400">
                  Dashboard
                </Link>
                
                {profile && (
                  <div className="flex items-center gap-2">
                    <Link href="/dashboard" className="group flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile.avatar_url || undefined} />
                        <AvatarFallback>
                          {profile.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {profile.username}
                      </span>
                    </Link>
                    
                    <button
                      onClick={handleSignOut}
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-sm hover:text-blue-600 dark:hover:text-blue-400"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 