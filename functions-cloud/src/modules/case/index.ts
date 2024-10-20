import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';
import { ICreateCase } from '../../types/ICreateCase';

export const createCaseCloud = onCall(
  { region: 'asia-south1', cors: true },
  async (request) => {
    const {
      CNRNo,
      caseFiles,
      caseStatus,
      caseType,
      courtName,
      decision,
      hearings,
      nextHearing,
      petition,
      priority,
      regDate,
      respondent,
      lawyer,
      clientDetails,
      caseNo,
      reference,
      lawyerActionStatus,
    }: Partial<ICreateCase> = request.data;

    try {
      const db = admin.firestore();

      // Generate a new document reference with an auto-generated ID
      const newCaseRef = db.collection('cases').doc();

      // Store case details in Firestore with the auto-generated ID
      await newCaseRef.set({
        CNRNo,
        caseFiles,
        caseId: newCaseRef.id, // Use the auto-generated ID
        caseStatus,
        caseType,
        courtName,
        decision,
        hearings,
        nextHearing,
        petition,
        priority,
        regDate,
        respondent,
        createdAt: admin.firestore.FieldValue.serverTimestamp(), // Use Firestore timestamp
        lawyer,
        clientDetails,
        caseNo,
        reference,
        lawyerActionStatus,
      });

      functions.logger.info('Case created in Firestore:', newCaseRef.id);

      return {
        statusCode: 201,
        id: newCaseRef.id, // Return the auto-generated ID
        createdAt: Date.now(),
      };
    } catch (error) {
      functions.logger.error('Error creating case:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Error creating case',
        error,
      );
    }
  },
);
