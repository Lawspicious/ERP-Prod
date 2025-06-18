'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/user/userContext';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/config/firebase.config';
import { LoaderCircle } from 'lucide-react';

const SecurePage = ({ children }: { children: React.ReactNode }) => {
  const { authUser } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const [loader, setLoader] = React.useState<boolean>(true);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (path === '/login') {
        setLoader(false);
        return;
      }
      if (!user) {
        router.push('/login');
        setLoader(false);
        return;
      }
      if (user) {
        user.getIdTokenResult().then((token) => {
          const role = token.claims['role'];
          if (role !== 'ADMIN' && role !== 'HR' && path !== '/no-permission') {
            router.push('/no-permission');
          }
          setLoader(false);
        });
        return;
      }
      setLoader(false);
    });
  }, [authUser, path, router]);

  return (
    <div>
      {loader ? (
        <div className="flex h-screen w-screen items-center justify-center">
          <LoaderCircle />
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default SecurePage;
