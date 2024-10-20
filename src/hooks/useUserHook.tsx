import { IUser } from '@/types/user';
import { useState } from 'react';
import { useToastHook } from './shared/useToastHook';
import { app, auth } from '@/lib/config/firebase.config';
import { sendPasswordResetEmail } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useLoading } from '@/context/loading/loadingContext';

const collectionName = 'users';

export const useUser = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const [state, newToast] = useToastHook();
  const { loading, setLoading } = useLoading();

  const functions = getFunctions(app, 'asia-south1');
  const createUserAndSetClaim = httpsCallable(functions, 'createUserCloud');
  const updateUserCred = httpsCallable(functions, 'updateUserCredCloud');
  const deleteUserCloud = httpsCallable(functions, 'deleteUserCloud');
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
      return result;
    } catch (error) {
      console.error('Error creating  user:', error);
      newToast({
        status: 'error',
        message: 'Error Creating User',
      });
    }
  };

  const updateUser = async (data: IUser) => {
    try {
      const result = await updateUserCred({
        uid: data.id,
        name: data.name,
        email: data.name,
        role: data.role,
        phoneNumber: data.phoneNumber,
      });
      newToast({
        status: 'success',
        message: 'User Updated Successfully',
      });
    } catch (error) {
      console.error('Error updating user:', error);
      newToast({
        status: 'error',
        message: 'Error Updating User',
      });
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const result = await deleteUserCloud({
        userId: id,
      });
      newToast({
        status: 'success',
        message: 'User Deleted Successfully',
      });
    } catch (error) {
      console.error('Error deleted user:', error);
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

  return {
    createUser,
    deleteUser,
    updateUser,
    resetUserPassword,
  };
};
