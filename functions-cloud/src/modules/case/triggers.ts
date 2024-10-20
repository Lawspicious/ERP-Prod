import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { sendEmailToLawyerNodeMailer } from '../../utils/sendEmailToLawyer'; // Adjust the path accordingly
import { today, today30 } from '../../utils/todayDate';

export const onCaseWritten = onDocumentWritten(
  {
    document: 'cases/{caseId}',
    region: 'asia-south1',
  },
  async (event) => {
    const db = getFirestore();

    // Get the before and after data

    const beforeData = event.data?.before.exists
      ? event.data.before.data()
      : null;
    const afterData = event.data?.after.exists ? event.data.after.data() : null;
    const caseId = event.params?.caseId;

    // Get the lawyer details
    const lawyer = afterData?.lawyer;

    if (!afterData) {
      logger.error('Case data is missing');
      return null;
    }

    // CASE 1: New Document Created (Send email)
    if (!beforeData && afterData) {
      logger.info(`New case document created: ${caseId}`);

      // Create a new task for the newly created case

      const newTaskRef = db.collection('tasks').doc();

      await newTaskRef.set({
        taskId: newTaskRef.id, // Auto-generated ID
        taskStatus: 'PENDING', // 'PENDING' based on ICreateTask interface
        taskType: 'NEW CASE CREATED', // Can be a string, adjust according to your logic
        priority: 'HIGH', // Example, adjust as per your logic
        createdAt: FieldValue.serverTimestamp(), // Timestamp from Firebase

        caseDetails: {
          caseId: caseId,
          caseType: afterData.caseType,
          petition: {
            petitioner: afterData.petitioner,
          },
          respondent: {
            respondentee: afterData.respondent.respondentee,
          },
          courtName: afterData.courtName,
        },

        lawyerDetails: [
          {
            id: lawyer?.id,
            name: lawyer?.name,
            email: lawyer?.email,
            phoneNumber: lawyer?.phoneNumber,
          },
        ],

        taskName: 'Case Assigned Update', // Add this field to match the ICreateTask interface
        startDate: today, // Ensure these fields are available in your data
        endDate: today30,
        taskDescription: 'New Case Assigned', // Description field as per the interface
      });

      logger.info('Task created for new case:', newTaskRef.id);

      // Send email for new case creation
      const emailParamsForNewCase = {
        to_email: lawyer.email,
        caseId: caseId,
        caseType: afterData.caseType,
        courtName: afterData.courtName,
        judge: afterData.judge,
        nextHearing: afterData.nextHearing,
        caseStatus: afterData.caseStatus,
        from_name: 'Lawspicious-Admin',
        lawyerName: lawyer?.name,
        message: {
          heading: 'New Case Assigned',
          body: 'A new case has been created in the Lawspicious system. Please find the details',
        },
      };

      try {
        const emailResponse = await sendEmailToLawyerNodeMailer(
          emailParamsForNewCase,
        );
        logger.info('Email sent for new case creation:', emailResponse);
      } catch (error) {
        logger.error('Failed to send email for new case creation:', error);
      }
    }

    // CASE 2: caseStatus field updated (Send email)
    if (beforeData?.caseStatus !== afterData?.caseStatus) {
      if (!beforeData) {
        return null;
      } // Ignore if the case is newly created

      logger.info(`Case status updated for caseId: ${caseId}`);

      // Create a task for the case status update
      const caseStatusTaskRef = db.collection('tasks').doc();

      await caseStatusTaskRef.set({
        taskId: caseStatusTaskRef.id, // Auto-generated ID
        taskStatus: 'PENDING', // As per ICreateTask interface
        taskType: 'CASE STATUS UPDATE', // Adjust task type based on the operation
        priority: 'HIGH', // Example, adjust as per your logic
        createdAt: FieldValue.serverTimestamp(), // Timestamp from Firebase

        caseDetails: {
          caseId: caseId,
          caseType: afterData.caseType,
          petition: {
            petitioner: afterData.petition.petitioner,
          },
          respondent: {
            respondentee: afterData.respondent.respondentee,
          },
          courtName: afterData.courtName,
        },

        lawyerDetails: [
          {
            id: lawyer?.id,
            name: lawyer?.name,
            email: lawyer?.email,
            phoneNumber: lawyer?.phoneNumber,
          },
        ],

        taskName: 'Case Status Update', // Set a name for the task
        startDate: today, // Ensure these fields are available in your data
        endDate: today30, // Adjust accordingly
        taskDescription: 'Updating the status of the case.', // Example description, adjust as per your needs
      });

      logger.info('Task created for caseStatus update:', caseStatusTaskRef.id);

      // Send email for caseStatus update
      const emailParamsForStatus = {
        to_email: lawyer?.email,
        caseId: caseId,
        caseType: afterData.caseType,
        courtName: afterData.courtName,
        judge: afterData.judge,
        nextHearing: afterData.nextHearing,
        caseStatus: afterData.caseStatus,
        from_name: 'Lawspicious-Admin',
        lawyerName: lawyer?.name,
        message: {
          heading: 'Case Status Update',
          body: 'The status of a case has changed in the Lawspicious system. Please find the details below:',
        },
      };

      try {
        const emailResponse =
          await sendEmailToLawyerNodeMailer(emailParamsForStatus);
        logger.info('Email sent for case status update:', emailResponse);
      } catch (error) {
        logger.error('Failed to send email for case status update:', error);
      }
    }

    // CASE 3: hearings[] array updated (Send email)
    if (beforeData?.nextHearing !== afterData?.nextHearing) {
      logger.info(`Hearings updated for caseId: ${caseId}`);

      if (!beforeData) {
        return null;
      } // Ignore if the case is newly created

      // Create a task for the hearings update

      const hearingsTaskRef = db.collection('tasks').doc();

      await hearingsTaskRef.set({
        taskId: hearingsTaskRef.id, // Auto-generated ID
        taskStatus: 'PENDING', // As per ICreateTask interface
        taskType: 'HEARINGS UPDATE', // Adjust task type based on the operation
        priority: 'HIGH', // Example, adjust as per your logic
        createdAt: FieldValue.serverTimestamp(), // Timestamp from Firebase

        caseDetails: {
          caseId: caseId,
          caseType: afterData.caseType,
          petition: {
            petitioner: afterData.petition.petitioner,
          },
          respondent: {
            respondentee: afterData.respondent.respondentee,
          },
          courtName: afterData.courtName,
        },

        lawyerDetails: [
          {
            id: lawyer?.id,
            name: lawyer?.name,
            email: lawyer?.email,
            phoneNumber: lawyer?.phoneNumber,
          },
        ],

        taskName: 'Hearings Update', // Set a name for the task
        startDate: today, // Ensure these fields are available in your data
        endDate: today30, // Adjust accordingly
        taskDescription: 'Update related to the hearings.', // Example description, adjust as per your needs
      });

      logger.info('Task created for hearing update:', hearingsTaskRef.id);

      // Send email for hearings update
      const emailParamsForHearings = {
        to_email: lawyer?.email,
        caseId: caseId,
        caseType: afterData.caseType,
        courtName: afterData.courtName,
        judge: afterData.judge,
        nextHearing: afterData.nextHearing,
        caseStatus: afterData.caseStatus,
        from_name: 'Lawspicious-Admin',
        lawyerName: lawyer?.name,
        message: {
          heading: 'Hearings Update',
          body: 'The hearings of a case have been updated in the Lawspicious system. Please find the details below:',
        },
      };

      try {
        const emailResponse = await sendEmailToLawyerNodeMailer(
          emailParamsForHearings,
        );
        logger.info('Email sent for hearings update:', emailResponse);
      } catch (error) {
        logger.error('Failed to send email for hearings update:', error);
      }
    }

    return null;
  },
);
