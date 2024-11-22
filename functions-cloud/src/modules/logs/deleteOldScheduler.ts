'use server';

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Cloud Scheduler Trigger (runs weekly)
export const deleteOldLogs = functions
  .region('asia-south1')
  .pubsub.schedule('every 168 hours') // 168 hours = 7 days
  .onRun(async (context) => {
    const db = admin.firestore();

    // Calculate the date 15 days ago from the current date
    const currentDate = new Date();
    const thirtyDaysAgo = new Date(
      currentDate.getTime() - 30 * 24 * 60 * 60 * 1000,
    );
    const thirtyDaysAgoTimestamp =
      admin.firestore.Timestamp.fromDate(thirtyDaysAgo);

    try {
      // Query Firestore for Logs created more than 15 days ago
      const oldLogsSnapshot = await db
        .collection('logs')
        .where('createdAt', '<=', thirtyDaysAgoTimestamp)
        .get();

      if (oldLogsSnapshot.empty) {
        console.log('No Logs older than 30 days found.');
        return null;
      }

      // Delete each outdated notification
      const deletePromises = oldLogsSnapshot.docs.map((doc) => {
        return doc.ref.delete();
      });

      // Wait for all deletions to complete
      await Promise.all(deletePromises);

      console.log('Old Logs deleted successfully.');
      return null;
    } catch (error) {
      console.error('Error deleting old Logs:', error);
      return null;
    }
  });
