import { useCallback, useEffect, useState } from 'react';

import { IUser } from '@/types/user';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
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
      const q = query(usersRef, where('role', 'in', ['LAWYER', 'ADMIN']));
      const querySnapshot = await getDocs(q);

      const teamMembers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllTeam(teamMembers as IUser[]);
      return teamMembers;
    } catch (error) {
      console.error('Error fetching team members:', error);
      newToast({
        message: 'Could not fetch Team Members',
        status: 'error',
      });
    }
  }, [setAllTeam]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'users')),
      (snapshot) => {
        const lawyers: IUser[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as IUser),
        }));

        // Only update state if data has changed
        setAllUser((prevTeam) => {
          const isSameData =
            JSON.stringify(prevTeam) === JSON.stringify(lawyers);
          return isSameData ? prevTeam : lawyers;
        });
      },
      (error) => {
        console.error('Error fetching LAWYER users:', error);
        newToast({
          message: 'Could not fetch Team Members',
          status: 'error',
        });
      },
    );

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

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
