'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/config/firebase.config';
import {
  collection,
  query,
  orderBy,
  getDocs,
  limit,
  where,
  Timestamp,
} from 'firebase/firestore';
import { AttendanceLog } from '@/types/attendance';

export const useLogs = (filterByUser?: string, filterByDate?: Date) => {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let attendanceQuery = query(
        collection(db, 'attendance'),
        orderBy('timestamp', 'desc'),
      );

      // Apply user filter if provided
      if (filterByUser) {
        attendanceQuery = query(
          attendanceQuery,
          where('userId', '==', filterByUser),
        );
      }

      // Apply date filter if provided
      if (filterByDate) {
        const startOfDay = new Date(filterByDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(filterByDate);
        endOfDay.setHours(23, 59, 59, 999);

        attendanceQuery = query(
          attendanceQuery,
          where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
          where('timestamp', '<=', Timestamp.fromDate(endOfDay)),
        );
      }

      const querySnapshot = await getDocs(attendanceQuery);

      const fetchedLogs: AttendanceLog[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          userEmail: data.userEmail,
          username: data.username || 'Unknown User',
          eventType: data.eventType,
          timestamp: data.timestamp?.toDate() || new Date(),
        };
      });

      setLogs(fetchedLogs);
    } catch (err) {
      console.error('Error fetching attendance logs:', err);
      setError('Failed to fetch attendance logs. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterByUser, filterByDate]);

  return {
    logs,
    isLoading,
    error,
    refreshLogs: fetchLogs,
  };
};
