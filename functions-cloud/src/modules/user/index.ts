import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { onCall } from 'firebase-functions/v2/https';
import { ICreateUser } from '../../types/ICreateUser';
import { sendUserResetPasswordEmail } from '../../utils/sendUserPasswordResetMail';

export const createUserCloud = onCall(
  { region: 'asia-south1', cors: true },
  async (request) => {
    const {
      name,
      email,
      role,
      phoneNumber,
      password,
      address,
      zipcode,
      country,
      state,
      city,
      typeOfLawyer,
    }: Partial<ICreateUser> = request.data;

    const auth = getAuth();

    try {
      const db = admin.firestore();

      const userRecord = await auth.createUser({
        email,
        password,
        emailVerified: true,
        displayName: name,
        phoneNumber,
        multiFactor: {
          enrolledFactors: [
            { phoneNumber: phoneNumber as string, factorId: 'phone' },
          ],
        },
      });

      await auth.setCustomUserClaims(userRecord.uid, { role });

      functions.logger.info('User created in auth');

      await db
        .collection('users')
        .doc(userRecord.uid)
        .set({
          name,
          email,
          role,
          phoneNumber,
          address,
          zipcode,
          country,
          state,
          city,
          typeOfLawyer: typeOfLawyer || null,
          createdAt: Date.now(),
        });

      return {
        statusCode: 201,
        id: userRecord.uid,
        name,
        email,
        role,
        phoneNumber,
        createdAt: Date.now(),
      };
    } catch (error) {
      functions.logger.error('Error creating user in auth', error);
      throw new functions.https.HttpsError(
        'internal',
        'Error creating user',
        error,
      );
    }
  },
);

export const updateUserCredCloud = onCall(
  { region: 'asia-south1', cors: true },
  async (request) => {
    const { uid, name, email, role, phoneNumber }: Partial<ICreateUser> =
      request.data;
    const auth = getAuth();

    try {
      // Check if the status has changed to update disabled state
      const userRecord = await auth.getUser(uid as string);
      functions.logger.info('User fetched from auth', userRecord);
      // Update user details in Firebase Authentication
      await auth.updateUser(userRecord.uid, {
        email,
        displayName: name,
        phoneNumber,
        multiFactor: {
          enrolledFactors: [
            { phoneNumber: phoneNumber as string, factorId: 'phone' },
          ],
        },
      });

      // Set custom claims for the user
      await auth.setCustomUserClaims(userRecord.uid, { role });
      functions.logger.info(
        'User updated in auth with new details and custom claims',
      );

      // Update store data in Firestore
      const db = admin.firestore();
      const usersQuery = await db
        .collection('users')
        .where('email', '==', userRecord.email)
        .get();
      const userDBRecord = usersQuery.docs[0];

      if (userDBRecord?.exists) {
        const userData = userDBRecord.data();
        const needsUpdate =
          userData.email !== email ||
          userData.phoneNumber !== phoneNumber ||
          userData.name !== name ||
          userData.role !== role;

        if (needsUpdate) {
          await db.collection('users').doc(userDBRecord.id).update({
            email,
            phoneNumber,
            name,
            role,
            updatedAt: Date.now(),
          });
          functions.logger.info('User updated in Firestore');
        }
      }

      return {
        status: 'success',
        message: 'User and  data updated successfully',
      };
    } catch (error) {
      functions.logger.error('Error updating user or store', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to update user or store',
        error,
      );
    }
  },
);
export const deleteUserCloud = onCall(
  { region: 'asia-south1', cors: true },
  async (request) => {
    const { userId } = request.data; // Get the userId from the request data
    const auth = getAuth();

    try {
      // Delete the user from Firebase Authentication
      await auth.deleteUser(userId);
      functions.logger.info(`User ${userId} deleted from Firebase Auth`);

      // Optionally: delete related data in Firestore, for example in 'admin-users' collection
      const db = admin.firestore();
      await db.collection('users').doc(userId).delete();
      functions.logger.info(`User ${userId} deleted from Firestore`);

      return {
        status: 'success',
        message: `User ${userId} successfully deleted`,
      };
    } catch (error) {
      functions.logger.error('Error deleting user from Firebase Auth', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to delete user',
        error,
      );
    }
  },
);

export const resetUserPasswordCloud = onCall(
  { region: 'asia-south1', cors: true },
  async (request) => {
    const { email, name, message } = request.data;
    const auth = getAuth();

    try {
      const link = await auth.generatePasswordResetLink(email);
      await sendUserResetPasswordEmail(email, name, link, message);
      return {
        statusCode: 200,
        resetLink: link,
      };
    } catch (error) {
      functions.logger.error('Error sending password reset link', error);
      throw new functions.https.HttpsError(
        'internal',
        'Error sending password reset link',
        error,
      );
    }
  },
);
