import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';
import { ICreateTask } from '../../types/ICreateTask';

export const createTaskCloud = onCall(
  { region: 'asia-south1', cors: true },
  async (request) => {
    const {
      caseDetails,
      lawyerDetails,
      priority,
      taskStatus,
      taskType,
      taskName,
      endDate,
      startDate,
      taskDescription,
      payable,
      amount,
      timeLimit,
      clientDetails,
      createdBy,
    }: Partial<ICreateTask> = request.data;

    try {
      const db = admin.firestore();

      // Generate a new document reference with an auto-generated ID
      const newTaskRef = db.collection('tasks').doc();

      // Store case details in Firestore with the auto-generated ID
      await newTaskRef.set({
        lawyerDetails,
        taskId: newTaskRef.id, // Use the auto-generated ID
        priority,
        taskStatus,
        caseDetails,
        taskType,
        taskName,
        endDate,
        startDate,
        taskDescription,
        payable,
        amount,
        timeLimit,
        clientDetails,
        createdBy,
        createdAt: admin.firestore.FieldValue.serverTimestamp(), // Use Firestore timestamp
      });

      functions.logger.info('Task created in Firestore:', newTaskRef.id);

      return {
        statusCode: 201,
        id: newTaskRef.id, // Return the auto-generated ID
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
