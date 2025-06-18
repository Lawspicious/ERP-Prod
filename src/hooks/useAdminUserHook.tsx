import { useAuth } from '@/context/user/userContext';
import { db } from '@/lib/config/firebase.config';
import { IUser } from '@/types/user';
import { useToast } from '@chakra-ui/react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { useUser } from './useUserHook';

export const useAdminUser = () => {
  const [adminUsers, setAdminUsers] = useState<IUser[]>([]);
  const { role } = useAuth();
  const toast = useToast();
  const { createUser, resetUserPassword } = useUser();

  const fetchAdminUsers = useCallback(async () => {
    const currentUserRole = role;
    if (
      currentUserRole === 'ADMIN' ||
      currentUserRole === 'SUPERADMIN' ||
      currentUserRole === 'HR'
    ) {
      try {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        onSnapshot(q, (querySnapshot) => {
          const adminUsersRes: IUser[] = [];
          querySnapshot.forEach((doc) => {
            const adminData: any = doc.data();
            adminUsersRes.push({ id: doc.id, ...adminData });
          });
          setAdminUsers(adminUsersRes);
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error in Fetching Admin Users',
        });
        console.error('Error fetching documents: ', error);
      }
    } else {
      toast({
        variant: 'destructive',
        title: "You don't have permission to fetch Admin Users",
      });
    }
  }, []);

  const createAdminUser = useCallback(async (data: IUser) => {
    const currentUserRole = role;
    if (
      currentUserRole === 'ADMIN' ||
      currentUserRole === 'SUPERADMIN' ||
      currentUserRole === 'HR'
    ) {
      try {
        const response = await createUser(data);

        if (response?.data === 'auth/email-already-exists') {
          toast({
            variant: 'destructive',
            title: 'The email address is already in use by another account.',
          });
          return false;
        } else if (response?.data === 'auth/phone-number-already-exists') {
          toast({
            variant: 'destructive',
            title: 'The user with the provided phone number already exists.',
          });
          return false;
        }
        return response;
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error in Create Admin User',
        });
        console.error(error);
      }
    } else {
      toast({
        variant: 'destructive',
        title: "You don't have permission to create Admin Users",
      });
    }
  }, []);

  const updateAdminUser = useCallback(
    async ({
      id,
      role,
      email,
      phoneNumber,
      name,
    }: {
      id: string;
      role: string;
      email: string;
      phoneNumber: string;
      name: string;
    }) => {
      const currentUserRole = role;
      if (
        currentUserRole === 'ADMIN' ||
        currentUserRole === 'SUPERADMIN' ||
        currentUserRole === 'HR'
      ) {
        try {
          const docRef = doc(db, 'users', id?.toString() as string);
          await updateDoc(docRef, {
            role: role,
            email: email,
            phoneNumber: phoneNumber,
            name: name,
          });
          toast({
            variant: 'success',
            title: 'User Updated Successfully',
          });
          return true;
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Error in Update Admin User',
          });
          console.error(error);
        }
      } else {
        toast({
          variant: 'destructive',
          title: "You don't have permission to update Admin Users",
        });
      }
    },
    [],
  );

  const deleteAdminUser = useCallback(async (userID: string) => {
    const currentUserRole = role;
    if (
      currentUserRole === 'ADMIN' ||
      currentUserRole === 'SUPERADMIN' ||
      currentUserRole === 'HR'
    ) {
      try {
        await deleteDoc(doc(db, 'users', userID));
        toast({
          variant: 'success',
          title: 'User deleted Successfully',
        });
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error in Admin User Deletion',
        });
      }
    } else {
      toast({
        variant: 'destructive',
        title: "You don't have permission to delete Admin Users",
      });
    }
  }, []);

  const resetPassword = useCallback(
    async (email: string, name: string, message: string) => {
      const currentUserRole = role;
      if (
        currentUserRole === 'ADMIN' ||
        currentUserRole === 'SUPERADMIN' ||
        currentUserRole === 'HR'
      ) {
        try {
          // setIsResetPasswordOpen(true);
          const response = await resetUserPassword(email, name, message);
          // Assuming the response is JSON, you can use response.json()

          const resetLink = response?.data;
          return resetLink;
          // Do something with the API response data
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Error occurred in Reset Password',
          });
          console.error(error);
        }
      } else {
        toast({
          variant: 'destructive',
          title: "You don't have permission to reset password",
        });
      }
    },
    [],
  );

  return {
    adminUsers,
    fetchAdminUsers,
    createAdminUser,
    updateAdminUser,
    deleteAdminUser,
    resetPassword,
  };
};
