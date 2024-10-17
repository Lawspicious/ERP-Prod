import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';

export const createSessionCookie = onCall(
  { region: 'asia-south1', cors: true },
  async (request) => {
    const idToken = request.data.idToken; // ID Token sent from the client
    const expiresIn = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

    try {
      // Create the session cookie with the specified expiration
      const sessionCookie = await admin
        .auth()
        .createSessionCookie(idToken, { expiresIn });

      // Return the session cookie and its expiration info
      return {
        sessionCookie,
        expiresAt: Date.now() + expiresIn, // Return expiration timestamp
      };
    } catch (error) {
      console.error('Error creating session cookie:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to create session cookie',
        error,
      );
    }
  },
);
