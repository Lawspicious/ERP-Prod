'use client';
import LoaderComponent from '@/components/ui/loader';
import { useAuth } from '@/context/user/userContext';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

const page = () => {
  const { authUser, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if ((role === 'ADMIN' || role === 'SUPERADMIN') && authUser) {
      router.push('/dashboard/admin/workspace-admin#home');
    } else if (role === 'LAWYER' && authUser) {
      router.push('/dashboard/lawyer/workspace-lawyer#home');
    } else {
      router.push('/auth');
    }
  }, [router, authUser]);
  return <LoaderComponent />;
};

export default page;
