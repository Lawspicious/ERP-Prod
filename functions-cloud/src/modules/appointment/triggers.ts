import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';
import { sendAppointmentEmailToLawyerNodeMailer } from '../../utils/sendAppointmentEmailToLawyer';

export const onAppointmentWritten = onDocumentWritten(
  {
    document: 'appointments/{appointmentId}',
    region: 'asia-south1',
  },
  async (event) => {
    // Get the before and after data
    const beforeData = event.data?.before.exists
      ? event.data.before.data()
      : null;
    const afterData = event.data?.after.exists ? event.data.after.data() : null;
    const appointmentId = event.params?.appointmentId;

    // Get the lawyer details
    const lawyerDetails = afterData?.lawyerDetails;
    const clientDetails = afterData?.clientDetails;

    //appointment 3:appointment Detleted
    if (beforeData && !afterData) {
      logger.info(`Appointment Deleted for appointmentId: ${appointmentId}`);

      // Send email  to all lawyers for caseStatus update
      const lawyerDetailss = beforeData?.lawyerDetails;
      const clientDetailss = beforeData?.clientDetails;

      const emailParamsForStatus = {
        to_email: lawyerDetailss?.email,
        clientName: clientDetailss?.name,
        lawyerId: lawyerDetailss?.id,
        appointmentId: appointmentId,
        time: beforeData.time,
        date: beforeData.date,
        location: beforeData.location,
        from_name: 'Lawspicious-Admin',
        lawyerName: lawyerDetailss?.name,
        appointmentStatus: beforeData.status,
        message: {
          heading: 'Appointment Deleted',
          body: 'An appointment assigned to you has been Closed in the Lawspicious system. Please find the details',
        },
      };

      try {
        const emailResponse =
          await sendAppointmentEmailToLawyerNodeMailer(emailParamsForStatus);
        logger.info('Email sent for appointment deleted:', emailResponse);
      } catch (error) {
        logger.error(
          'Failed to send email for appointment status update:',
          error,
        );
      }
    }
    //appointment 1: New Document Created (Send email)
    if (!beforeData && afterData) {
      logger.info(`New Appointment document created: ${appointmentId}`);

      // Send email for newappointment creation

      const emailParamsForNewTask = {
        to_email: lawyerDetails?.email,
        clientName: clientDetails?.name,
        lawyerId: lawyerDetails?.id,
        appointmentId: appointmentId,
        time: afterData.time,
        date: afterData.date,
        location: afterData.location,
        from_name: 'Lawspicious-Admin',
        lawyerName: lawyerDetails?.name,
        appointmentStatus: afterData.status,
        message: {
          heading: 'New Appointment ',
          body: 'An appointment is assigned to you in the Lawspicious system. Please find the details',
        },
      };

      try {
        const emailResponse = await sendAppointmentEmailToLawyerNodeMailer(
          emailParamsForNewTask,
        );
        logger.info('Email sent for new Appointment creation:', emailResponse);
      } catch (error) {
        logger.error(
          'Failed to send email for newappointment creation:',
          error,
        );
      }
    }
    //appointment 2: caseStatus field updated (Send email)
    if (beforeData?.status !== afterData?.status && afterData) {
      if (!beforeData) {
        return null;
      } // Ignore if theappointment is newly created

      logger.info(
        `Appointment status updated forappointmentId: ${appointmentId}`,
      );

      // Send email for caseStatus update

      const emailParamsForStatus = {
        to_email: lawyerDetails?.email,
        clientName: clientDetails?.name,
        lawyerId: lawyerDetails?.id,
        appointmentId: appointmentId,
        time: afterData.time,
        date: afterData.date,
        location: afterData.location,
        from_name: 'Lawspicious-Admin',
        lawyerName: lawyerDetails?.name,
        appointmentStatus: afterData.status,
        message: {
          heading: 'Appointment Updated',
          body: 'An appointment has been updated in the Lawspicious system. Please find the details',
        },
      };

      try {
        const emailResponse =
          await sendAppointmentEmailToLawyerNodeMailer(emailParamsForStatus);
        logger.info('Email sent for appointment status update:', emailResponse);
      } catch (error) {
        logger.error(
          'Failed to send email forappointment status update:',
          error,
        );
      }
    }
    return null;
  },
);
