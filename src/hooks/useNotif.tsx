import { useLoading } from '@/context/loading/loadingContext';
import { useAuth } from '@/context/user/userContext';
import { db } from '@/lib/config/firebase.config';
import { INotifications } from '@/types/notification';
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  arrayUnion,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useToastHook } from '@/hooks/shared/useToastHook';
import { writeBatch } from 'firebase/firestore';

const collectionName = 'notifications';

export const useNotif = () => {
  const [newNotif, setNewNotif] = useState<INotifications[]>([]);
  const [seenNotif, setSeenNotif] = useState<INotifications[]>([]);
  const { setLoading } = useLoading();
  const [state, newToast] = useToastHook();
  const { authUser, role } = useAuth();

  useEffect(() => {
    if (!authUser?.uid) return;

    // Define the query based on the user's role
    const baseQuery =
      role === 'SUPERADMIN'
        ? query(collection(db, collectionName))
        : query(
            collection(db, collectionName),
            where('lawyerIds', 'array-contains', authUser.uid),
          );

    // Subscribe to changes in notifications
    const unsubscribe = onSnapshot(
      baseQuery,
      (snapshot) => {
        const notifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as INotifications),
        }));

        // Separate notifications into "new" and "seen" categories
        const userId = authUser.uid;
        const newNotifications = notifications.filter(
          (notif) =>
            !notif.clearedBy?.includes(userId) &&
            !notif.seenBy?.includes(userId),
        );
        const seenNotifications = notifications.filter(
          (notif) =>
            !notif.clearedBy?.includes(userId) &&
            notif.seenBy?.includes(userId),
        );

        setNewNotif(newNotifications);
        setSeenNotif(seenNotifications);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching notifications:', error);
        setLoading(false);
        newToast({
          message: 'Could not fetch notifications',
          status: 'error',
        });
      },
    );

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [role, authUser?.uid]);

  // Mark a notification as seen
  const markAsSeen = async (id: string) => {
    try {
      const notificationDocRef = doc(db, collectionName, id);
      await updateDoc(notificationDocRef, {
        seenBy: arrayUnion(authUser?.uid),
      });
    } catch (error) {
      console.error('Error marking notification as seen:', error);
      newToast({
        message: 'Could not mark notification as seen',
        status: 'error',
      });
    }
  };

  // Clear a notification
  const clearNotification = async (id: string) => {
    try {
      const notificationDocRef = doc(db, collectionName, id);
      await updateDoc(notificationDocRef, {
        clearedBy: arrayUnion(authUser?.uid),
      });
    } catch (error) {
      console.error('Error clearing notification:', error);
      newToast({
        message: 'Could not clear notification',
        status: 'error',
      });
    }
  };

  // Clear all notifications

  const clearAllNotifications = async () => {
    try {
      // Ensure the user and Firestore instance are valid
      if (!authUser?.uid) throw new Error('User ID is not available');
      if (!db) throw new Error('Firestore instance is not initialized');

      const batch = writeBatch(db); // Create a new batch instance

      // Iterate through all notifications
      [...newNotif, ...seenNotif].forEach((notif) => {
        if (!notif.id) {
          console.warn('Notification ID is missing:', notif);
          return; // Skip invalid notifications
        }

        const notificationDocRef = doc(
          collection(db, collectionName), // Reference the collection
          notif.id,
        );

        // Append the user's ID to the clearedBy field
        batch.update(notificationDocRef, {
          clearedBy: arrayUnion(authUser.uid),
        });
      });

      // Commit the batch
      await batch.commit();
      newToast({
        message: 'All notifications cleared successfully',
        status: 'success',
      });
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      newToast({
        message: 'Could not clear all notifications',
        status: 'error',
      });
    }
  };

  return {
    newNotif,
    seenNotif,
    markAsSeen,
    clearNotification,
    clearAllNotifications,
  };
};
