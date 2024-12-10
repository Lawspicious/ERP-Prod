import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';
import { sendEmailToLawyerNodeMailer } from '../../utils/sendEmailToLawyer'; // Adjust the path accordingly

export const onCaseWritten = onDocumentWritten(
  {
    document: 'cases/{caseId}',
    region: 'asia-south1',
  },
  async (event) => {
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
