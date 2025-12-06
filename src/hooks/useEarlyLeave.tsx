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
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/config/firebase.config';
import { useToastHook } from './shared/useToastHook';
import { useAuth } from '@/context/user/userContext';
import { IEarlyLeave } from '@/types/attendance';
import { useLog } from './shared/useLog';

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
  const { createLogEvent } = useLog();

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

      await createLogEvent({
        userId: data.userId,
        action: 'CREATE',
        eventDetails: `Early leave request created: ${data.name} on ${data.date} - ${data.reason}`,
        user: {
          name: data.name,
          email: authUser?.email || '',
          role: role || '',
        },
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

      await createLogEvent({
        userId: earlyLeaveData?.userId || authUser?.uid || '',
        action: 'UPDATE',
        eventDetails: `Early leave ${newStatus}: ${earlyLeaveData?.name || 'User'} on ${earlyLeaveData?.date || ''} - ${earlyLeaveData?.reason || ''}`,
        user: {
          name: authUser?.displayName || 'Admin',
          email: authUser?.email || '',
          role: role || '',
        },
      });

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

  const deleteEarlyLeave = async (id: string) => {
    if (
      !authUser ||
      (role !== 'SUPERADMIN' && role !== 'HR' && role !== 'ADMIN')
    ) {
      newToast({ message: 'Permission denied', status: 'error' });
      return;
    }

    try {
      // Get the early leave data before deletion
      const earlyLeave = earlyLeaves.find((leave) => leave.id === id);

      // Delete the early leave record
      await deleteDoc(doc(db, collectionName, id));

      if (earlyLeave) {
        // Remove from attendance_overrides
        const overridesQuery = query(
          collection(db, 'attendance_overrides'),
          where('userId', '==', earlyLeave.userId),
          where('date', '==', earlyLeave.date),
          where('status', '==', 'early_leave'),
        );
        const overridesSnapshot = await getDocs(overridesQuery);
        overridesSnapshot.forEach(async (overrideDoc) => {
          await deleteDoc(overrideDoc.ref);
        });

        // Remove from attendance calendar
        const attendanceQuery = query(
          collection(db, 'attendance'),
          where('userId', '==', earlyLeave.userId),
          where('date', '==', earlyLeave.date),
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);
        attendanceSnapshot.forEach(async (attendanceDoc) => {
          await deleteDoc(attendanceDoc.ref);
        });

        await createLogEvent({
          userId: earlyLeave.userId,
          action: 'DELETE',
          eventDetails: `Early leave deleted: ${earlyLeave.name} on ${earlyLeave.date} - ${earlyLeave.reason}`,
          user: {
            name: authUser?.displayName || 'Admin',
            email: authUser?.email || '',
            role: role || '',
          },
        });
      }

      newToast({
        message: 'Early leave deleted successfully',
        status: 'success',
      });
    } catch (error) {
      console.error('Error deleting early leave:', error);
      newToast({
        message: 'Failed to delete early leave',
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
    deleteEarlyLeave,
    getApprovedEarlyLeavesForDate,
    getUserEarlyLeavesForDate,
  };
};
