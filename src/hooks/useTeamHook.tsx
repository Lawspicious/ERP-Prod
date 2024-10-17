import { useCallback, useEffect, useState } from 'react';

import { IUser } from '@/types/user';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/config/firebase.config';
import { useToastHook } from './shared/useToastHook';

export const useTeam = () => {
  const [allTeam, setAllTeam] = useState<IUser[]>([]);
  const [allUser, setAllUser] = useState<IUser[]>([]);
  const [user, setUser] = useState<IUser | null>(null);
  const [state, newToast] = useToastHook();

  const getAllTeam = useCallback(async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'LAWYER'));
      const querySnapshot = await getDocs(q);

      const lawyers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllTeam(lawyers as IUser[]);
      return lawyers;
    } catch (error) {
      console.error('Error fetching LAWYER users:', error);
      newToast({
        message: 'Could not fetch Team Members',
        status: 'error',
      });
    }
  }, [setAllTeam]);

  const getAllUser = useCallback(async () => {
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);

      const userList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllUser(userList as IUser[]);
    } catch (error) {
      console.error('Error fetching LAWYER users:', error);
      newToast({
        message: 'Could not fetch Team Members',
        status: 'error',
      });
    }
  }, [setAllTeam]);

  const getUserById = async (id: string) => {
    try {
      const userDocRef = doc(db, 'users', id);
      const userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data() as IUser;
        setUser(userData);
      } else {
        console.warn('No user found with the provided userId');
        newToast({
          message: 'Could not find user',
          status: 'error',
        });
      }
    } catch (error) {
      console.error('Error fetching user by userId: ', error);
      newToast({
        message: 'There was an error',
        status: 'error',
      });
    }
  };

  return {
    allTeam,
    allUser,
    user,
    getAllTeam,
    getAllUser,
    getUserById,
  };
};
