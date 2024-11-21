import { useLoading } from '@/context/loading/loadingContext';
import { db } from '@/lib/config/firebase.config';
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { useCallback, useState } from 'react';

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
        date: new Date(Date.now()).toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        action,
        eventDetails,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getAllLogs = async () => {
    try {
      const logSnap = await getDocs(logCollectionRef);

      const logList = logSnap.docs.map((doc) => ({
        ...doc.data(),
      }));
      setAllLogs(logList as ILogEventInterface[]);
    } catch (error) {
      console.log(error);
    }
  };

  const getLogsByUserandDate = useCallback(
    async (userId?: string, date?: string) => {
      try {
        setLoading(true);
        const conditions = [];

        if (userId && userId !== '') {
          conditions.push(where('userId', '==', userId));
        }
        if (date && date != '') {
          conditions.push(where('date', '==', date));
        }

        const logQuery = conditions.length
          ? query(
              logCollectionRef,
              ...conditions,
              orderBy('date', 'desc'),
              limit(100),
            )
          : logCollectionRef;

        const logSnap = await getDocs(logQuery);

        const logList = logSnap.docs.map((doc) => ({
          ...doc.data(),
        }));
        setAllLogs(logList as ILogEventInterface[]);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    allLogs,
    createLogEvent,
    getAllLogs,
    getLogsByUserandDate,
  };
};
