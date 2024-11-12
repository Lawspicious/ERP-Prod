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
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useToastHook } from './shared/useToastHook';

const collectionName = 'notifications';

export const useNotification = () => {
  const [allNotifications, setAllNotifications] = useState<INotifications[]>(
    [],
  );
  const { loading, setLoading } = useLoading();
  const [state, newToast] = useToastHook();
  const { authUser, role } = useAuth();

  useEffect(() => {
    // Define the query based on the user's role
    let notificationQuery;

    if (role === 'SUPERADMIN') {
      // If role is SUPERADMIN, fetch all notifications
      notificationQuery = query(collection(db, collectionName));
    } else {
      // Otherwise, query based on lawyerIds
      notificationQuery = query(
        collection(db, collectionName),
        where('lawyerIds', 'array-contains', authUser?.uid),
      );
    }

    // Subscribe to changes in notifications
    const unsubscribe = onSnapshot(
      notificationQuery,
      (snapshot) => {
        const updatedNotifications: INotifications[] = snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...(doc.data() as INotifications),
          }),
        );
        setAllNotifications(updatedNotifications);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching notifications:', error);
        setLoading(false);
        newToast({
          message: 'Could not fetch notification',
          status: 'error',
        });
      },
    );

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [role, authUser?.uid]);

  const updateNotificationStatus = async (
    id: string,
    status: 'seen' | 'unseen',
  ) => {
    try {
      const notificationDocRef = doc(db, collectionName, id);
      await updateDoc(notificationDocRef, {
        status,
      });
    } catch (error) {
      console.error('Error updating notification: ', error);
      newToast({
        message: 'Could not Update notification',
        status: 'error',
      });
    }
  };

  return {
    allNotifications,
    updateNotificationStatus,
  };
};
