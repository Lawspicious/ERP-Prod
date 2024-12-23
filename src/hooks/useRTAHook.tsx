import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/config/firebase.config';
import { Announcement } from '@/types/announcement';

export const useRealTimeAnnouncements = (
  onNewAnnouncement: (announcement: Announcement) => void,
  onDeletedAnnouncement: (id: string) => void,
) => {
  const announcementsRef = collection(db, 'announcements');

  const listenToAnnouncements = () => {
    const q = query(announcementsRef, orderBy('publishedAt', 'desc'));

    // Record the current timestamp when the listener starts
    const initTime = new Date().toISOString();

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const newAnnouncement = {
            id: change.doc.id,
            ...change.doc.data(),
          } as Announcement;

          // Only trigger onNewAnnouncement for announcements created after initTime
          if (newAnnouncement.publishedAt > initTime) {
            onNewAnnouncement(newAnnouncement);
          }
        }
        if (change.type === 'removed') {
          onDeletedAnnouncement(change.doc.id);
        }
      });
    });

    // Return unsubscribe function to stop listening
    return unsubscribe;
  };

  return { listenToAnnouncements };
};
