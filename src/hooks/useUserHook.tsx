import { IUser } from '@/types/user';
import { useState } from 'react';
import { useToastHook } from './shared/useToastHook';
import { app } from '@/lib/config/firebase.config';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useLoading } from '@/context/loading/loadingContext';
import { ILogEventInterface, useLog } from './shared/useLog';
import { useAuth } from '@/context/user/userContext';
import { db } from '@/lib/config/firebase.config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const collectionName = 'users';

export const useUser = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const [state, newToast] = useToastHook();
  const { loading, setLoading } = useLoading();
  const { authUser, role } = useAuth();

  const functions = getFunctions(app, 'asia-south1');
  const createUserAndSetClaim = httpsCallable(functions, 'createUserCloud');
  const updateUserCred = httpsCallable(functions, 'updateUserCredCloud');
  const deleteUserCloud = httpsCallable(functions, 'deleteUserCloud');
  const { createLogEvent } = useLog();
  const resetUserPasswordCloud = httpsCallable(
    functions,
    'resetUserPasswordCloud',
  );

  const createUser = async (data: IUser) => {
    try {
      const result = await createUserAndSetClaim({
        ...data,
        password: 'password@123',
      });

      const emailRes = await resetUserPasswordCloud({
        email: data.email,
        name: data.name,
        message:
          'Welcome to Lawspicious, Your account has been created successfully',
      });
      newToast({
        status: 'success',
        message: 'User Created Successfully',
      });

      await updateDoc(doc(db, 'users', (result.data as { id: string }).id), {
        firstLogin: true,
      });

      if (authUser) {
        await createLogEvent({
          userId: authUser?.uid,
          action: 'CREATE',
          eventDetails: `New User ${data.name} Created`,
          user: {
            name: authUser?.displayName,
            email: authUser?.email,
            role: role,
          },
        } as ILogEventInterface);
      }
      return result;
    } catch (error) {
      console.error('Error creating user:', error);
      newToast({
        status: 'error',
        message: 'Error Creating User',
      });
    }
  };

  const updateUser = async (data: IUser) => {
    console.log('uid', data.id);
    try {
      // Update user credentials in Firebase Auth via cloud function
      const result = await updateUserCred({
        uid: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        phoneNumber: data.phoneNumber,
      });

      // Update user document in Firestore with latest address and related fields
      if (!data.id) {
        throw new Error('User ID is required to update user');
      }

      await updateDoc(doc(db, 'users', data.id), {
        phoneNumber: data.phoneNumber,
        address: data.address,
        zipcode: data.zipcode,
        country: data.country,
        state: data.state,
        city: data.city,
        typeOfLawyer: data.typeOfLawyer,
      });

      newToast({
        status: 'success',
        message: 'User Updated Successfully',
      });
      if (authUser) {
        await createLogEvent({
          userId: authUser?.uid,
          action: 'UPDATE',
          eventDetails: `${data.name} User Updated`,
          user: {
            name: authUser?.displayName,
            email: authUser?.email,
            role: role,
          },
        } as ILogEventInterface);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      newToast({
        status: 'error',
        message: 'Error Updating User',
      });
    }
  };

  const deleteUser = async (id: string, name: string) => {
    console.log('uid', id);
    try {
      const result = await deleteUserCloud({
        userId: id,
      });
      newToast({
        status: 'success',
        message: 'User Deleted Successfully',
      });
      if (authUser) {
        await createLogEvent({
          userId: authUser?.uid,
          action: 'DELETE',
          eventDetails: `User Deleted - ${name}`,
          user: {
            name: authUser?.displayName,
            email: authUser?.email,
            role: role,
          },
        } as ILogEventInterface);
      }
    } catch (error) {
      console.log('Error deleted user:', error);
      newToast({
        status: 'error',
        message: 'Error Deleting User',
      });
    }
  };

  const resetUserPassword = async (
    email: string,
    name: string,
    message: string,
  ) => {
    try {
      const result = await resetUserPasswordCloud({
        email: email,
        name: name,
        message: message,
      });
      newToast({
        status: 'success',
        message: 'Password Reset Link Send Successfully',
      });
      return result;
    } catch (error) {
      console.error('Error resetting link send:', error);
      newToast({
        status: 'error',
        message: 'Error Resetting Password',
      });
    }
  };

  const getUserById = async (id: string): Promise<IUser | undefined> => {
    try {
      const userDocRef = doc(db, collectionName, id);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        return userSnap.data() as IUser;
      } else {
        console.warn(`No user found with ID: ${id}`);
        return undefined;
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      newToast({
        status: 'error',
        message: 'Error fetching user',
      });
      return undefined;
    }
  };

  return {
    createUser,
    deleteUser,
    updateUser,
    resetUserPassword,
    getUserById,
  };
};
