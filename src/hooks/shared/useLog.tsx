import { useLoading } from '@/context/loading/loadingContext';
import { db } from '@/lib/config/firebase.config';
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  startAt,
  where,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

export interface ILogEventInterface {
  userId: string;
  eventDetails: string;
  date?: string;
  time?: string;
  action: 'CREATE' | 'DELETE' | 'UPDATE';
  user: {
    name: string;
    email: string;
    role: string;
  };
}

const collectionName = 'logs';
export const useLog = () => {
  const [allLogs, setAllLogs] = useState<ILogEventInterface[]>([]);
  const logCollectionRef = collection(db, collectionName);
  const { loading, setLoading } = useLoading();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10); // Number of logs per page
  const [lastVisible, setLastVisible] = useState<any>(null); // Last document of current page
  const [firstVisible, setFirstVisible] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const createLogEvent = async ({
    userId,
    eventDetails,
    action,
    user,
  }: ILogEventInterface) => {
    try {
      await addDoc(logCollectionRef, {
        userId,
        user,
        date: new Date()
          .toLocaleDateString('en-GB')
          .split('/')
          .reverse()
          .join('-'),
        time: new Date()
          .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          .replace(/AM|PM/, ''),
        action,
        eventDetails,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getLogsByUserandDate = useCallback(
    async (userId: string, date: string) => {
      try {
        setLoading(true);
        const conditions = [];

        if (userId !== '') {
          conditions.push(where('userId', '==', userId));
        }
        if (date !== '') {
          conditions.push(where('date', '==', date));
        }

        // Create query with pagination and sorting by date and time
        let logQuery;

        if (currentPage === 0) {
          logQuery = query(
            logCollectionRef,
            orderBy('date', 'desc'),
            orderBy('time', 'desc'), // Add time sorting
            ...conditions,
            limit(pageSize),
          );
        } else {
          logQuery = query(
            logCollectionRef,
            orderBy('date', 'desc'),
            orderBy('time', 'desc'), // Add time sorting
            ...conditions,
            startAfter(lastVisible), // Start after the last visible document
            limit(pageSize),
          );
        }

        const logSnap = await getDocs(logQuery);
        const logList: ILogEventInterface[] = logSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as unknown as ILogEventInterface[];

        setAllLogs(logList);
        setLastVisible(logSnap.docs[logSnap.docs.length - 1]);
        setFirstVisible(logSnap.docs[0]);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize],
  );

  const nextPage = () => {
    if (allLogs.length === pageSize) {
      // Only go to next page if there are enough logs
      setCurrentPage(currentPage + 1);
      getLogsByUserandDate(selectedUser, selectedDate); // Fetch next logs
    }
  };

  const prevPage = async (userId?: string, date?: string) => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      try {
        setLoading(true);

        const conditions = [];

        if (userId && userId !== '') {
          conditions.push(where('userId', '==', userId));
        }
        if (date && date !== '') {
          conditions.push(where('date', '==', date));
        }

        const logQuery = query(
          logCollectionRef,
          orderBy('date', 'desc'),
          orderBy('time', 'desc'), // Add time sorting
          ...conditions,
          startAt(firstVisible), // Start at the first visible document of the previous page
          limit(pageSize),
        );

        const logSnap = await getDocs(logQuery);
        const logList = logSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (logList.length > 0) {
          setAllLogs(logList as any);
          setLastVisible(logSnap.docs[logSnap.docs.length - 1] as any); // Update last visible document
          setFirstVisible(logSnap.docs[0] as any); // Update first visible document
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    allLogs,
    currentPage,
    pageSize,
    nextPage,
    prevPage,
    createLogEvent,
    setCurrentPage,
    getLogsByUserandDate,
    selectedUser,
    selectedDate,
    setSelectedDate,
    setSelectedUser,
  };
};
