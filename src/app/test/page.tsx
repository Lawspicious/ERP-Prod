'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  startAt,
} from 'firebase/firestore';
import { db } from '@/lib/config/firebase.config';

const LogsTable = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10); // Number of logs per page
  const [lastVisible, setLastVisible] = useState(null); // Last document of current page
  const [firstVisible, setFirstVisible] = useState(null); // First document of current page

  const logCollectionRef = collection(db, 'logs'); // Replace with your collection reference

  const getLogsByUserandDate = useCallback(
    async (userId?: string, date?: string) => {
      try {
        setLoading(true);
        const conditions = [];

        if (userId && userId !== '') {
          conditions.push(where('userId', '==', userId));
        }
        if (date && date !== '') {
          conditions.push(where('date', '==', date));
        }

        // Create query with pagination
        let logQuery;

        if (currentPage === 0) {
          logQuery = query(
            logCollectionRef,
            orderBy('date', 'desc'),
            ...conditions,
            limit(pageSize),
          );
        } else {
          logQuery = query(
            logCollectionRef,
            orderBy('date', 'desc'),
            ...conditions,
            startAfter(lastVisible), // Start after the last visible document
            limit(pageSize),
          );
        }

        const logSnap = await getDocs(logQuery);
        const logList = logSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (logList.length > 0) {
          setLogs(logList as any);
          setLastVisible(logSnap.docs[logSnap.docs.length - 1] as any); // Set last visible document
          setFirstVisible(logSnap.docs[0] as any); // Set first visible document
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize],
  );

  useEffect(() => {
    getLogsByUserandDate(); // Fetch logs on component mount or when currentPage changes
  }, [getLogsByUserandDate]);

  // Pagination handlers
  const nextPage = () => {
    if (logs.length === pageSize) {
      // Only go to next page if there are enough logs
      setCurrentPage(currentPage + 1);
      getLogsByUserandDate(); // Fetch next logs
    }
  };

  const prevPage = async () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      try {
        setLoading(true);

        const conditions = []; // Recreate conditions based on your filters

        if (userId && userId !== '') {
          // Assuming userId is in scope
          conditions.push(where('userId', '==', userId));
        }
        if (date && date !== '') {
          // Assuming date is in scope
          conditions.push(where('date', '==', date));
        }

        const logQuery = query(
          logCollectionRef,
          orderBy('date', 'desc'),
          // ...conditions,
          startAt(firstVisible), // Start at the first visible document of the previous page
          limit(pageSize),
        );

        const logSnap = await getDocs(logQuery);
        const logList = logSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (logList.length > 0) {
          setLogs(logList as any);
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

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User ID</th>
              <th>Date</th>
              {/* Add other relevant columns */}
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.userId}</td>
                <td>{log.date}</td>
                {/* Add other relevant data */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="pagination">
        <button onClick={prevPage} disabled={currentPage === 0}>
          Previous
        </button>
        <button onClick={nextPage} disabled={logs.length < pageSize}>
          Next
        </button>
      </div>
    </div>
  );
};

export default LogsTable;
