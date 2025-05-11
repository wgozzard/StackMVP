import Link from 'next/link';
import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';

export default function SignUpPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Sign up to share your projects with the community
        </p>
      </div>

      <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
        <AuthForm type="signup" />
      </Suspense>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link
          href="/auth/login"
          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
} 