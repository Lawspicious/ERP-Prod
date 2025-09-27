import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/config/firebase.config';
import { useToastHook } from './shared/useToastHook';
import { useAuth } from '@/context/user/userContext';
import { IEarlyLeave } from '@/types/attendance';

const collectionName = 'earlyLeaves';

export const useEarlyLeave = () => {
  const [earlyLeaves, setEarlyLeaves] = useState<IEarlyLeave[]>([]);
  const [myEarlyLeaves, setMyEarlyLeaves] = useState<IEarlyLeave[]>([]);
  const [pendingEarlyLeaves, setPendingEarlyLeaves] = useState<IEarlyLeave[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(true);

  const { authUser, role } = useAuth();
  const [state, newToast] = useToastHook();

  useEffect(() => {
    const q = query(
      collection(db, collectionName),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const all: IEarlyLeave[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as IEarlyLeave),
        }));
        setEarlyLeaves(all);
        setPendingEarlyLeaves(all.filter((l) => l.status === 'pending'));
        if (authUser) {
          setMyEarlyLeaves(all.filter((l) => l.userId === authUser.uid));
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching early leaves:', error);
        newToast({
          message: 'Failed to load early leave data',
          status: 'error',
        });
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [authUser]);

  const requestEarlyLeave = async (
    data: Omit<IEarlyLeave, 'status' | 'createdAt'>,
  ) => {
    try {
      await addDoc(collection(db, collectionName), {
        ...data,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      newToast({ message: 'Early leave request submitted', status: 'success' });
    } catch (error) {
      console.error('Error submitting early leave:', error);
      newToast({
        message: 'Error submitting early leave request',
        status: 'error',
      });
    }
  };

  const changeEarlyLeaveStatus = async (
    id: string,
    newStatus: 'approved' | 'rejected',
    earlyLeaveData?: IEarlyLeave,
  ) => {
    if (!authUser || (role !== 'SUPERADMIN' && role !== 'HR')) {
      newToast({ message: 'Permission denied', status: 'error' });
      return;
    }

    try {
      await updateDoc(doc(db, collectionName, id), { status: newStatus });

      if (newStatus === 'approved' && earlyLeaveData) {
        // Create attendance override for early leave
        await addDoc(collection(db, 'attendance_overrides'), {
          userId: earlyLeaveData.userId,
          date: earlyLeaveData.date,
          status: 'early_leave',
          overriddenBy: authUser?.displayName || 'Admin',
          timestamp: serverTimestamp(),
          notes: `Early leave: ${earlyLeaveData.reason}`,
        });
      }

      newToast({
        message: `Early leave ${newStatus}`,
        status: 'success',
      });
    } catch (error) {
      console.error('Error updating early leave status:', error);
      newToast({
        message: 'Failed to update early leave status',
        status: 'error',
      });
    }
  };

  const getApprovedEarlyLeavesForDate = (date: string): number => {
    return earlyLeaves.filter(
      (leave) => leave.date === date && leave.status === 'approved',
    ).length;
  };

  const getUserEarlyLeavesForDate = (
    userId: string,
    date: string,
  ): IEarlyLeave[] => {
    return earlyLeaves.filter(
      (leave) =>
        leave.userId === userId &&
        leave.date === date &&
        leave.status === 'approved',
    );
  };

  return {
    earlyLeaves,
    myEarlyLeaves,
    pendingEarlyLeaves,
    loading,
    requestEarlyLeave,
    changeEarlyLeaveStatus,
    getApprovedEarlyLeavesForDate,
    getUserEarlyLeavesForDate,
  };
};
