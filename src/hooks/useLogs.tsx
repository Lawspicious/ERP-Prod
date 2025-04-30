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

  // Convert a date to IST YYYY-MM-DD string format
  const dateToISTString = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Kolkata', // IST timezone
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

    const formatter = new Intl.DateTimeFormat('en-CA', options); // en-CA uses YYYY-MM-DD format
    return formatter.format(date);
  };

  // Get start and end timestamps for a day in IST
  const getISTDayBounds = (date: Date) => {
    // Get the date in IST as YYYY-MM-DD
    const istDateStr = dateToISTString(date);
    console.log(`Filtering logs for IST date: ${istDateStr}`);

    // Parse the components
    const [year, month, day] = istDateStr.split('-').map(Number);

    // Create date objects at 00:00:00 and 23:59:59 IST
    // IST is UTC+5:30, so convert back to UTC for Firestore
    const startOfDayIST = new Date(Date.UTC(year, month - 1, day, -5, -30, 0));
    const endOfDayIST = new Date(
      Date.UTC(year, month - 1, day, 18, 29, 59, 999),
    );

    console.log(
      `Day bounds in UTC: ${startOfDayIST.toISOString()} to ${endOfDayIST.toISOString()}`,
    );

    return {
      start: startOfDayIST,
      end: endOfDayIST,
    };
  };

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
        console.log(`Fetching logs for date: ${filterByDate.toISOString()}`);

        // Get day boundaries in IST timezone
        const { start, end } = getISTDayBounds(filterByDate);

        attendanceQuery = query(
          attendanceQuery,
          where('timestamp', '>=', Timestamp.fromDate(start)),
          where('timestamp', '<=', Timestamp.fromDate(end)),
        );
      }

      const querySnapshot = await getDocs(attendanceQuery);
      console.log(`Retrieved ${querySnapshot.docs.length} logs`);

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

      // Debug log to show each log date in IST
      if (filterByDate) {
        const istDateStr = dateToISTString(filterByDate);
        console.log(`Logs for IST date ${istDateStr}:`);
        fetchedLogs.forEach((log) => {
          const logDateIST = dateToISTString(log.timestamp);
          console.log(
            `- ${log.username}, ${log.eventType}, UTC: ${log.timestamp.toISOString()}, IST: ${logDateIST}`,
          );
        });
      }

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
