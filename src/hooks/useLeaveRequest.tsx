import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  deleteDoc,
  orderBy,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from '@/lib/config/firebase.config';
import { useToastHook } from './shared/useToastHook';
import { useAuth } from '@/context/user/userContext';
import { useLoading } from '@/context/loading/loadingContext';
import { addDays, differenceInCalendarDays, format } from 'date-fns';
import { useLog } from './shared/useLog';
import useCalendarEvents from './useCalendarHook';

export interface ILeaveRequest {
  id?: string;
  userId: string;
  name: string;
  fromDate: string;
  toDate: string;
  reason: string;
  remark?: string;
  status: 'pending' | 'approved' | 'rejected';
  numberOfDays?: number;
  overrideIds?: string[];
  linkedEventIds?: string[];
}

const collectionName = 'leaveRequests';

export const useLeaveRequest = () => {
  const [leaveRequests, setLeaveRequests] = useState<ILeaveRequest[]>([]);
  const [myLeaveHistory, setMyLeaveHistory] = useState<ILeaveRequest[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<ILeaveRequest[]>([]);
  const [loading, setLocalLoading] = useState<boolean>(true);
  const { createNewEvent, deleteEvent } = useCalendarEvents();

  const { authUser, role } = useAuth();
  const { setLoading } = useLoading();

  // Function to get all leave requests (one-time fetch, not realtime)

  const [state, newToast] = useToastHook();

  // Realtime listener
  useEffect(() => {
    setLocalLoading(true);
    setLoading(true);
    const q = query(
      collection(db, collectionName),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const all: ILeaveRequest[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as ILeaveRequest),
        }));
        setLeaveRequests(all);
        setPendingLeaves(all.filter((l) => l.status === 'pending'));
        if (authUser) {
          setMyLeaveHistory(all.filter((l) => l.userId === authUser.uid));
        }
        setLocalLoading(false);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching leave requests:', error);
        newToast({ message: 'Failed to load leave data', status: 'error' });
        setLocalLoading(false);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [authUser]);

  // Create Leave Request
  const raiseLeaveRequest = async (
    data: Omit<ILeaveRequest, 'status' | 'createdAt'>,
  ) => {
    setLocalLoading(true);
    setLoading(true);
    try {
      const from = new Date(data.fromDate);
      const to = new Date(data.toDate);
      const timeDiff = to.getTime() - from.getTime();
      const dayCount = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
      const createdAt = new Date().toISOString();
      const newDoc = doc(collection(db, collectionName));
      await setDoc(newDoc, {
        ...data,
        status: 'pending',
        numberOfDays: dayCount,
        createdAt,
      });
      newToast({ message: 'Leave request submitted', status: 'success' });
    } catch (err) {
      console.error(err);
      newToast({ message: 'Error raising leave request', status: 'error' });
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  // Update Leave Request (for editing before approval)
  const updateLeaveRequest = async (
    id: string,
    data: Partial<ILeaveRequest>,
  ) => {
    setLocalLoading(true);
    setLoading(true);
    try {
      const leaveRef = doc(db, collectionName, id);
      const snapshot = await getDoc(leaveRef);
      const existing = snapshot.data() as ILeaveRequest;

      if (!existing) {
        throw new Error('Leave request not found');
      }

      const updatedFrom = data.fromDate ?? existing.fromDate;
      const updatedTo = data.toDate ?? existing.toDate;
      const from = new Date(updatedFrom);
      const to = new Date(updatedTo);
      const numberOfDays = differenceInCalendarDays(to, from) + 1;

      const updates: Partial<ILeaveRequest> = {
        ...data,
        fromDate: updatedFrom,
        toDate: updatedTo,
        numberOfDays,
      };

      if (existing.status === 'approved') {
        // If remark is updated
        if (data.remark) {
          updates.remark = data.remark;
        }

        const fromChanged =
          data.fromDate && data.fromDate !== existing.fromDate;
        const toChanged = data.toDate && data.toDate !== existing.toDate;

        if (fromChanged || toChanged) {
          // Remove old events & overrides
          await removeLinkedDocs(id);

          const overrideIds: string[] = [];
          const linkedEventIds: string[] = [];

          const overrideRef = collection(db, 'attendance_overrides');
          const userId = existing.userId;
          const userName = existing.name;

          for (let i = 0; i < numberOfDays; i++) {
            const date = format(addDays(from, i), 'yyyy-MM-dd');

            // Create override
            const overrideDoc = await addDoc(overrideRef, {
              userId,
              date,
              status: 'absent',
              overriddenBy: authUser?.displayName || 'Admin',
              timestamp: serverTimestamp(),
            });
            overrideIds.push(overrideDoc.id);

            // Create event
            const event = await createNewEvent({
              title: `${userName} is on leave.`,
              start: date,
            });
            linkedEventIds.push(event?.id as string);
          }

          updates.overrideIds = overrideIds;
          updates.linkedEventIds = linkedEventIds;
        }
      }

      await updateDoc(leaveRef, updates);
      newToast({ message: 'Leave request updated', status: 'success' });
    } catch (err) {
      console.error(err);
      newToast({ message: 'Error updating leave request', status: 'error' });
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  // Approve/Reject Leave Request (admin/HR only)
  const changeLeaveStatus = async (
    id: string,
    newStatus: 'approved' | 'rejected',
    leaveData?: {
      userId: string;
      userName: string;
      fromDate: string;
      toDate: string;
    },
  ) => {
    if (!authUser || (role !== 'SUPERADMIN' && role !== 'HR')) {
      newToast({ message: 'Permission denied', status: 'error' });
      return;
    }

    setLocalLoading(true);
    setLoading(true);

    try {
      const linkedEventIds: string[] = [];
      const overrideIds: string[] = [];
      await updateDoc(doc(db, collectionName, id), { status: newStatus });

      if (newStatus === 'approved' && leaveData) {
        console.log('Processing attendance overrides...');
        const { userId, fromDate, toDate } = leaveData;
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const days = differenceInCalendarDays(to, from) + 1;
        const overrideRef = collection(db, 'attendance_overrides');

        for (let i = 0; i < days; i++) {
          const dateToOverride = format(addDays(from, i), 'yyyy-MM-dd');

          const existingQuery = query(
            overrideRef,
            where('userId', '==', userId),
            where('date', '==', dateToOverride),
          );

          const existingSnapshot = await getDocs(existingQuery);

          if (!existingSnapshot.empty) {
            const docId = existingSnapshot.docs[0].id;
            await updateDoc(doc(db, 'attendance_overrides', docId), {
              status: 'absent',
              timestamp: serverTimestamp(),
            });
            overrideIds.push(docId);
          } else {
            const docRef = await addDoc(overrideRef, {
              userId,
              date: dateToOverride,
              status: 'absent',
              overriddenBy: authUser?.displayName || 'Admin',
              timestamp: serverTimestamp(),
            });

            overrideIds.push(docRef.id);
          }

          const eventDocRef = await createNewEvent({
            title: `${leaveData.userName} in on leave.`,
            start: format(addDays(from, i), 'yyyy-MM-dd'),
          });

          linkedEventIds.push(eventDocRef?.id as string);
        }
        await updateDoc(doc(db, collectionName, id), {
          overrideIds,
          linkedEventIds,
        });
      }
    } catch (err) {
      console.error('Leave approval failed:', err);
      newToast({ message: 'Failed to update leave status', status: 'error' });
    }
  };

  const removeLinkedDocs = async (leaveId: string) => {
    const leaveDoc = await getDoc(doc(db, collectionName, leaveId));
    const data = leaveDoc.data();
    const userId = data?.userId;

    if (data?.linkedEventIds) {
      for (const id of data.linkedEventIds) {
        await deleteDoc(doc(db, `users/${userId}/events`, id));
      }
    }

    if (data?.overrideIds) {
      for (const id of data.overrideIds) {
        await deleteDoc(doc(db, 'attendance_overrides', id));
      }
    }

    // Optionally clear the IDs in the leave document
    await updateDoc(doc(db, collectionName, leaveId), {
      linkedEventIds: [],
      overrideIds: [],
    });
  };

  const deleteLeaveRequest = async (
    id: string,
    status?: 'pending' | 'approved' | 'rejected',
    leaveData?: { userId: string; fromDate: string; toDate: string },
    reason: string = 'No reason provided',
  ) => {
    setLocalLoading(true);
    setLoading(true);
    try {
      if (status === 'pending') {
        // Direct delete
        await deleteDoc(doc(db, collectionName, id));
      } else if (status === 'rejected') {
        // Soft delete only
        // await updateDoc(doc(db, collectionName, id), {
        //   isDeleted: true,
        //   remark: reason,
        //   deletedAt: serverTimestamp(),
        // });

        await deleteDoc(doc(db, collectionName, id));
      } else if (status === 'approved' && leaveData) {
        await removeLinkedDocs(id);
        // await updateDoc(doc(db, collectionName, id), {
        //   isDeleted: true,
        //   deletedReason: reason,
        //   deletedAt: serverTimestamp(),
        // });
        await deleteDoc(doc(db, collectionName, id));
      }
      newToast({ message: 'Leave request deleted', status: 'success' });
    } catch (err) {
      newToast({ message: 'Error deleting leave request', status: 'error' });
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  return {
    leaveRequests,
    myLeaveHistory,
    pendingLeaves,
    loading,
    raiseLeaveRequest,
    updateLeaveRequest,
    changeLeaveStatus,
    deleteLeaveRequest,
  };
};
