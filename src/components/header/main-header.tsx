'use client';
import { useAuth } from '@/context/user/userContext';
import { Avatar } from '@chakra-ui/react';
import React from 'react';

export const MainHeader = () => {
  const { authUser } = useAuth();
  return (
    <div className="bg-blue flex items-center justify-between gap-6 p-4 shadow-md">
      <h2 className="font-cabin text-xl font-bold">Lawspicious</h2>
      <Avatar
        name={authUser?.displayName || ''}
        size={'md'}
        onClick={() => (window.location.href = `/user/${authUser?.uid}`)}
      />
    </div>
  );
};
