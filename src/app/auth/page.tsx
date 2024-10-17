'use client';
import { AuthUI } from '@/components/auth/main-auth';
import { useAuth } from '@/context/user/userContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignIn() {
  const { authUser } = useAuth();

  const router = useRouter();
  useEffect(() => {
    if (authUser) {
      router.push('/dashboard');
    }
  }, [authUser]);
  return (
    <main className="flex h-screen flex-col items-center justify-center bg-bgPrimary">
      <AuthUI />
    </main>
  );
}
