'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/user/userContext';

interface User {
  uid: string;
  role: string;
}

interface Props {
  children: JSX.Element[] | JSX.Element;
}

const RouteProtection = ({ children }: Props) => {
  const { authUser, role } = useAuth();
  const router = useRouter();

  const redirectTo = async (path: string) => {
    try {
      await router.push(path);
    } catch (error) {
      console.error('Error occurred during route navigation:', error);
    }
  };

  useEffect(() => {
    const checkRouteAccess = async () => {
      const restrictedPaths = [
        '/dashboard/admin',
        '/dashboard/lawyer',
        '/dashboard',
      ];

      const authPaths = [
        '/auth/signin',
        '/auth/signup',
        '/auth/signup/create-profile',
      ];
      const currentPath = window.location.pathname;

      // Wait until authUser, role, and userProfile are available
      if (!authUser || !role) {
        if (restrictedPaths.includes(currentPath)) {
          await redirectTo('/auth/signin');
        }
        return;
      }
      // Route protection for admin and lawyer dashboard pages
      if (restrictedPaths.includes(currentPath)) {
        if (role === 'ADMIN' || role === 'SUPERADMIN' || role === 'HR') {
          return; // Admin can access any route except lawyer-specific routes
        } else if (role === 'lawyer' && currentPath !== '/dashboard/admin') {
          return; // Lawyer can access any route except admin-specific routes {
        } else {
          await redirectTo('/auth/signin');
        }
      }

      // Redirect authenticated users on auth-related pages
      if (authPaths.includes(currentPath)) {
        if (role === 'ADMIN' || role === 'SUPERADMIN' || role === 'HR') {
          await redirectTo('/dashboard/admin');
        } else if (role === 'lawyer') {
          await redirectTo('/dashboard/lawyer');
        }
      }
    };

    checkRouteAccess();
  }, [authUser, role]);

  return <>{children}</>;
};

export default RouteProtection;
