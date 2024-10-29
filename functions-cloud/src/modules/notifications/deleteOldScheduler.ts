'use server';

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Cloud Scheduler Trigger (runs weekly)
export const deleteOldNotifications = functions
  .region('asia-south1')
  .pubsub.schedule('every 168 hours') // 168 hours = 7 days
  .onRun(async (context) => {
    const db = admin.firestore();

    // Calculate the date 15 days ago from the current date
    const currentDate = new Date();
    const fifteenDaysAgo = new Date(
      currentDate.getTime() - 15 * 24 * 60 * 60 * 1000,
    );
    const fifteenDaysAgoTimestamp =
      admin.firestore.Timestamp.fromDate(fifteenDaysAgo);

    try {
      // Query Firestore for notifications created more than 15 days ago
      const oldNotificationsSnapshot = await db
        .collection('notifications')
        .where('createdAt', '<=', fifteenDaysAgoTimestamp)
        .get();

      if (oldNotificationsSnapshot.empty) {
        console.log('No notifications older than 15 days found.');
        return null;
      }

      // Delete each outdated notification
      const deletePromises = oldNotificationsSnapshot.docs.map((doc) => {
        return doc.ref.delete();
      });

      // Wait for all deletions to complete
      await Promise.all(deletePromises);

      console.log('Old notifications deleted successfully.');
      return null;
    } catch (error) {
      console.error('Error deleting old notifications:', error);
      return null;
    }
  });
