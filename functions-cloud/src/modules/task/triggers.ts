import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';
import { sendTaskEmailToLawyerNodeMailer } from '../../utils/sendTaskEmailToLawyer';
import { ILawyer } from '../../types/ICreateTask';

export const onTaskWritten = onDocumentWritten(
  {
    document: 'tasks/{taskId}',
    region: 'asia-south1',
  },
  async (event) => {
    // Get the before and after data
    const beforeData = event.data?.before.exists
      ? event.data.before.data()
      : null;
    const afterData = event.data?.after.exists ? event.data.after.data() : null;
    const taskId = event.params?.taskId;

    // Get the lawyer details
    const lawyerDetails = afterData?.lawyerDetails;
    const caseDetails = afterData?.caseDetails;

    // task 3: Task Detleted
    if (beforeData && !afterData) {
      logger.info(`Task status Deleted for taskId: ${taskId}`);

      // Send email  to all lawyers for caseStatus update
      lawyerDetails.forEach(async (lawyer: ILawyer) => {
        const emailParamsForStatus = {
          to_email: lawyer?.email,
          caseId: caseDetails?.caseId,
          taskId: taskId,
          taskType: beforeData.taskType,
          taskName: beforeData.taskName,
          taskStatus: beforeData.taskStatus,
          from_name: 'Lawspicious-Admin',
          lawyerName: lawyer?.name,
          message: {
            heading: 'Task Deleted',
            body: 'A Task assigned to you has been Deleted in the Lawspicious system. Please find the details',
          },
        };

        try {
          const emailResponse =
            await sendTaskEmailToLawyerNodeMailer(emailParamsForStatus);
          logger.info('Email sent for task deleted:', emailResponse);
        } catch (error) {
          logger.error('Failed to send email for task status update:', error);
        }
      });
    }

    // task 1: New Document Created (Send email)
    if (!beforeData && afterData) {
      logger.info(`New task document created: ${taskId}`);

      // Send email for new task creation
      lawyerDetails.forEach(async (lawyer: ILawyer) => {
        const emailParamsForNewTask = {
          to_email: lawyer?.email,
          caseId: caseDetails?.caseId,
          taskId: taskId,
          taskType: afterData.taskType,
          taskName: afterData.taskName,
          taskStatus: afterData.taskStatus,
          from_name: 'Lawspicious-Admin',
          lawyerName: lawyer?.name,
          message: {
            heading: 'New Task Assigned',
            body: 'A new task has been created in the Lawspicious system. Please find the details',
          },
        };

        try {
          const emailResponse = await sendTaskEmailToLawyerNodeMailer(
            emailParamsForNewTask,
          );
          logger.info('Email sent for new task creation:', emailResponse);
        } catch (error) {
          logger.error('Failed to send email for new task creation:', error);
        }
      });
    }

    // task 2: caseStatus field updated (Send email)
    if (beforeData?.taskStatus !== afterData?.taskStatus && afterData) {
      if (!beforeData) {
        return null;
      } // Ignore if the task is newly created

      logger.info(`Task status updated for taskId: ${taskId}`);

      // Send email for caseStatus update
      lawyerDetails.forEach(async (lawyer: ILawyer) => {
        const emailParamsForStatus = {
          to_email: lawyer?.email,
          caseId: caseDetails?.caseId,
          taskId: taskId,
          taskType: afterData.taskType,
          taskName: afterData.taskName,
          taskStatus: afterData.taskStatus,
          from_name: 'Lawspicious-Admin',
          lawyerName: lawyer?.name,
          message: {
            heading: 'Task Updated',
            body: 'Atask has been updated in the Lawspicious system. Please find the details',
          },
        };

        try {
          const emailResponse =
            await sendTaskEmailToLawyerNodeMailer(emailParamsForStatus);
          logger.info('Email sent for task status update:', emailResponse);
        } catch (error) {
          logger.error('Failed to send email for task status update:', error);
        }
      });
    }

    return null;
  },
);
