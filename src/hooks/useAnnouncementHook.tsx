import { db } from '@/lib/config/firebase.config';
import { Announcement } from '@/types/announcement';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  updateDoc,
  arrayUnion,
  getDoc,
} from 'firebase/firestore';
import FirebaseAuth from 'firebase/auth';
import { useToastHook } from './shared/useToastHook';
import { useToast } from '@chakra-ui/react';

const collectionName = 'announcements';

export const useAnnouncementHook = () => {
  const [state, newToast] = useToastHook();
  const toast = useToast();

  const createDefaultAnnouncementForUserOnFirstLogin = async (id: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', id));
      const findUser = userDoc.data();
      if (!findUser) {
        throw new Error('User not found');
      }
      if (findUser.firstLogin) {
        const announcementRef = await addDoc(collection(db, collectionName), {
          title: 'Welcome to the platform!',
          message: `We are happy to have you, ${findUser.name}! Hope you have a great time here.`,
          seenBy: [],
          clearedBy: [],
          priority: 'low',
          meantFor: id,
          publishedAt: new Date().toISOString(),
        });
        console.log('Default Announcement Created', announcementRef.id);
        toast({
          title: `Welcome, ${findUser.name}!`,
          description: `Great to have you here!`,
          status: 'info',
          duration: 3000,
          position: 'bottom',
          isClosable: true,
        });
        await updateDoc(doc(db, 'users', id), {
          firstLogin: false,
        });
      } else {
        console.log('User already logged in once');
      }
    } catch (error) {
      console.error('Error creating default announcement:', error);
      newToast({
        message: 'Could not create default announcement',
        status: 'error',
      });
      throw error;
    }
  };

  const createAnnouncement = async (data: Announcement) => {
    try {
      const announcementRef = await addDoc(collection(db, collectionName), {
        ...data,
        seenBy: [],
        clearedBy: [],
        publishedAt: new Date().toISOString(),
      });
      console.log('Announcement Created', announcementRef.id);
      toast({
        description: 'Announcement created successfully',
        status: 'success',
        duration: 3000,
        position: 'bottom',
        isClosable: true,
      });
      return announcementRef.id;
    } catch (error) {
      console.error('Error creating Announcement:', error);
      newToast({
        message: 'Could not create Announcement',
        status: 'error',
      });
      throw error;
    }
  };

  const getAllAnnouncementsForUser = async (
    authUser: FirebaseAuth.User | null,
  ) => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, collectionName), orderBy('publishedAt', 'desc')),
      );
      return querySnapshot.docs
        .map((doc) => {
          const docData = doc.data();
          return {
            id: doc.id,
            priority: docData.priority,
            title: docData.title,
            message: docData.message,
            publishedAt: docData.publishedAt,
            clearedBy: docData.clearedBy || [],
            seenBy: docData.seenBy || [],
            meantFor: docData.meantFor || '',
          };
        })
        .filter((announcement) =>
          !announcement.clearedBy.includes(authUser?.uid) &&
          announcement.meantFor === ''
            ? true
            : announcement.meantFor === authUser?.uid,
        );
    } catch (error) {
      console.error('Error fetching announcements:', error);
      newToast({
        message: 'Could not fetch announcements',
        status: 'error',
      });
      throw error;
    }
  };

  const clearAnnouncementForUser = async (
    announcementId: string,
    user: FirebaseAuth.User | null,
  ) => {
    try {
      const announcementRef = doc(db, collectionName, announcementId);
      const announcementDoc = await getDoc(announcementRef);

      if (!announcementDoc.exists()) {
        throw new Error('Announcement does not exist');
      }

      const announcementData = announcementDoc.data();
      const publishedAt = new Date(announcementData.publishedAt);
      const currentDate = new Date();
      const daysDifference =
        (currentDate.getTime() - publishedAt.getTime()) / (1000 * 3600 * 24);

      if (daysDifference < 30) {
        return;
      }

      await updateDoc(announcementRef, {
        clearedBy: arrayUnion(user?.uid),
      });
      console.log('Announcement Cleared', announcementId);
      newToast({
        message: 'Announcement cleared',
        status: 'success',
      });
    } catch (error) {
      console.error('Error clearing announcement:', error);
      newToast({
        message: 'Could not clear announcement',
        status: 'error',
      });
      throw error;
    }
  };

  const clearAllAnnouncementsForUser = async (
    user: FirebaseAuth.User | null,
  ) => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, collectionName)),
      );
      querySnapshot.docs.forEach(async (document) => {
        const announcement = document.data();
        if (!announcement.clearedBy.includes(user?.uid)) {
          const announcementRef = doc(db, collectionName, document.id);
          await updateDoc(announcementRef, {
            clearedBy: arrayUnion(user?.uid),
          });
        }
      });
      console.log('All Announcements Cleared');
      newToast({
        message: 'All announcements cleared',
        status: 'success',
      });
    } catch (error) {
      console.error('Error clearing announcements:', error);
      newToast({
        message: 'Could not clear announcements',
        status: 'error',
      });
      throw error;
    }
  };

  const seeAllAnnouncementsForUser = async (user: FirebaseAuth.User | null) => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, collectionName)),
      );
      querySnapshot.docs.forEach(async (document) => {
        const announcement = document.data();
        if (!announcement.seenBy.includes(user?.uid)) {
          const announcementRef = doc(db, collectionName, document.id);
          await updateDoc(announcementRef, {
            seenBy: arrayUnion(user?.uid),
          });
        }
      });
      console.log('All Announcements Seen');
    } catch (error) {
      console.error('Error seeing announcements:', error);
      newToast({
        message: 'Could not see announcements',
        status: 'error',
      });
      throw error;
    }
  };

  const getAllAnnouncementsFunction = async (
    page: number,
    itemsPerPage: number,
  ) => {
    try {
      const announcementsRef = collection(db, collectionName);

      // Get total count of announcements
      const snapshot = await getCountFromServer(announcementsRef);
      const totalCount = snapshot.data().count;
      const totalPages = Math.ceil(totalCount / itemsPerPage);

      // Get all announcements to determine which pages have content
      const allAnnouncementsSnapshot = await getDocs(
        query(announcementsRef, orderBy('publishedAt', 'desc')),
      );
      const pagesWithContent = Array.from(
        new Set(
          allAnnouncementsSnapshot.docs.map(
            (_, index) => Math.floor(index / itemsPerPage) + 1,
          ),
        ),
      );

      // Create a query for the requested page
      let q = query(
        announcementsRef,
        orderBy('publishedAt', 'desc'),
        limit(itemsPerPage),
      );

      if (page > 1) {
        const lastVisibleDoc = await getDocs(
          query(
            announcementsRef,
            orderBy('publishedAt', 'desc'),
            limit((page - 1) * itemsPerPage),
          ),
        );
        const lastDoc = lastVisibleDoc.docs[lastVisibleDoc.docs.length - 1];
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
          id: doc.id,
          priority: docData.priority,
          title: docData.title,
          message: docData.message,
          publishedAt: docData.publishedAt,
        };
      });

      return { data, totalPages, pagesWithContent };
    } catch (error) {
      console.error('Error fetching announcements:', error);
      newToast({
        message: 'Could not fetch announcements',
        status: 'error',
      });
      throw error;
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      newToast({
        message: 'Announcement deleted',
        status: 'success',
      });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      newToast({
        message: 'Could not delete announcement',
        status: 'error',
      });
      throw error;
    }
  };

  return {
    createDefaultAnnouncementForUserOnFirstLogin,
    createAnnouncement,
    getAllAnnouncementsForUser,
    getAllAnnouncementsFunction,
    clearAnnouncementForUser,
    clearAllAnnouncementsForUser,
    deleteAnnouncement,
    seeAllAnnouncementsForUser,
  };
};
