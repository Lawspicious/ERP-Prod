import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';

export const createSessionCookie = onCall(
  { region: 'asia-south1', cors: true },
  async (request) => {
    const idToken = request.data.idToken; // ID Token sent from the client
    const expiresIn = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

    try {
      // Validate the ID Token and create a session cookie
      const sessionCookie = await admin
        .auth()
        .createSessionCookie(idToken, { expiresIn });

      // Return the session cookie and additional metadata
      return {
        status: 'success',
        sessionCookie,
        expiresAt: Date.now() + expiresIn, // Expiration timestamp for the cookie
      };
    } catch (error) {
      console.error('Error creating session cookie:', error);
      // Handle potential errors
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Invalid ID Token or session creation failed',
        error,
      );
    }
  },
);

export const verifySessionCookie = onCall(
  { region: 'asia-south1', cors: true },
  async (request) => {
    const sessionCookie = request.data.sessionCookie; // Session cookie sent from the client

    try {
      // Verify the session cookie and decode its claims
      const decodedClaims = await admin
        .auth()
        .verifySessionCookie(sessionCookie, true);

      // Return user details and custom claims (if any)
      return {
        user: {
          uid: decodedClaims.uid,
          email: decodedClaims.email,
          role: decodedClaims.role || 'user', // Default role if not set
        },
      };
    } catch (error) {
      console.error('Error verifying session cookie:', error);
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Session cookie verification failed',
        error,
      );
    }
  },
);

export const revokeSessionCookie = onCall(
  { region: 'asia-south1', cors: true },
  async (request) => {
    const sessionCookie = request.data.sessionCookie; // Session cookie sent from the client

    try {
      // Decode the session cookie to get the user's UID
      const decodedClaims = await admin
        .auth()
        .verifySessionCookie(sessionCookie);

      // Revoke all refresh tokens for the user
      await admin.auth().revokeRefreshTokens(decodedClaims.sub);

      // Optionally log out the user by returning a success message
      return { success: true, message: 'Session revoked successfully' };
    } catch (error) {
      console.error('Error revoking session cookie:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to revoke session cookie',
        error,
      );
    }
  },
);
