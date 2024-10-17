'use client';
import { useAuth } from '@/context/user/userContext';
import { useToast } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode, useState } from 'react';
import LoaderComponent from '../ui/loader';

interface WithAuthProps {
  allowedRoles: string[];
  loadingFallback?: ReactNode;
  unauthorizedFallback?: ReactNode;
}

const withAuth = (
  WrappedComponent: React.ComponentType<any>,
  allowedRoles: string[],
  {
    loadingFallback = <LoaderComponent />,
    unauthorizedFallback = (
      <div className="heading-primary mx-4 flex items-center justify-center text-center">
        You are not authorized to view this page.
      </div>
    ),
  }: Partial<WithAuthProps> = {},
) => {
  return (props: any) => {
    const router = useRouter();
    const { authUser, role, isAuthLoading } = useAuth();
    const toast = useToast();

    useEffect(() => {
      if (
        !isAuthLoading &&
        authUser &&
        !allowedRoles.includes(role as string)
      ) {
        toast({
          title: 'Unauthorized',
          description: 'You are not authorized to view this page.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }, [authUser]);

    if (isAuthLoading) {
      return <>{loadingFallback}</>; // Show loading fallback
    }
    if (!authUser) {
      router.push('/auth'); // Show unauthorized fallback
    }

    if (authUser && !allowedRoles.includes(role as string)) {
      return <>{unauthorizedFallback}</>; // Show unauthorized fallback
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
