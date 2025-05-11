'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSiteUrl } from '@/lib/constants';

interface AuthFormProps {
  type: 'login' | 'signup';
}

export function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect_to') || '/dashboard';
  const supabase = createClientComponentClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (type === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast.success('Logged in successfully');
        router.push(redirectTo);
        router.refresh();
      } else {
        // Get the appropriate site URL for the current environment
        const siteUrl = getSiteUrl();
        // Make sure we use the full URL with protocol
        const redirectUrl = `${siteUrl}/auth/callback`;
        
        console.log('Signup using redirect URL:', redirectUrl);
        
        // IMPORTANT: Make sure your domain is added to Supabase's authorized redirect URLs
        // Go to Supabase Dashboard > Authentication > URL Configuration > Redirect URLs
        
        // Log the signup attempt for debugging
        console.log('Attempting signup with email:', email);
        
        // Make sure email confirmation is enabled in Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              email: email,
            }
          },
        });
        
        // Log the response for debugging
        console.log('Signup response:', {
          user: data?.user ? 'User created' : 'No user',
          session: data?.session ? 'Session created' : 'No session',
          error: error ? error.message : 'No error'
        });

        if (error) throw error;
        
        // Check if the user was created but needs email confirmation
        if (data?.user && !data?.session) {
          toast.success(
            'Account created! Please check your email for a verification link. ' +
            'If you do not see it, check your spam folder.'
          );
        } else if (data?.user && data?.session) {
          // User was created and automatically signed in (email confirmation might be disabled)
          toast.success('Account created successfully!');
          router.push('/create-profile');
          router.refresh();
        } else {
          toast.info('Something went wrong with the signup process. Please try again.');
        }
      }
    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <div className="relative mt-1">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
              placeholder="••••••••"
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {type === 'login' && (
            <div className="mt-1 text-right">
              <a
                href="/auth/reset-password"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Forgot password?
              </a>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {type === 'login' ? 'Logging in...' : 'Creating account...'}
            </>
          ) : (
            type === 'login' ? 'Log in' : 'Create account'
          )}
        </button>
      </form>
    </div>
  );
} 