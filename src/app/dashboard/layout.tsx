'use client';
import { useAuth } from '@/context/user/userContext';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { authUser, isAuthLoading } = useAuth();

  // useEffect(() => {
  //   checkTokenExpiration();

  //   const intervalId = setInterval(checkTokenExpiration, 60000);

  //   return () => clearInterval(intervalId);

  //   function checkTokenExpiration() {
  //     const currentExpiration =
  //       tokenExpiration ||
  //       (typeof window !== 'undefined' &&
  //       window.localStorage.getItem('tokenExpiration')
  //         ? new Date(window.localStorage.getItem('tokenExpiration')!)
  //         : null);

  //     if (currentExpiration && new Date(currentExpiration) < new Date()) {
  //       logout();
  //       router.push('/auth');
  //       return;
  //     }
  //   }
  // }, [router, logout, tokenExpiration]);

  useEffect(() => {
    if (!authUser && !isAuthLoading) {
      router.push('/auth');
    }
  }, [router, authUser, isAuthLoading]);

  return (
    <div className="dashboard-layout">
      <main>{children}</main>
    </div>
  );
}
