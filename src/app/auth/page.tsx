'use client';
import { AuthUI } from '@/components/auth/main-auth';
import { useAuth } from '@/context/user/userContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignIn() {
  const { authUser, tokenExpiration, isAuthLoading } = useAuth();
  const overallTokenExpiration = tokenExpiration
    ? new Date(tokenExpiration)
    : typeof window !== 'undefined' &&
        window.localStorage.getItem('tokenExpiration')
      ? new Date(window.localStorage.getItem('tokenExpiration')!)
      : null;

  const hasTokenExpired =
    overallTokenExpiration && new Date(overallTokenExpiration) < new Date();

  const router = useRouter();
  useEffect(() => {
    if (authUser && !hasTokenExpired && !isAuthLoading) {
      router.push('/dashboard');
    }
  }, [authUser, hasTokenExpired, router, isAuthLoading]);

  return (
    <main className="flex h-screen flex-col items-center justify-center bg-bgPrimary">
      <AuthUI />
    </main>
  );
}
