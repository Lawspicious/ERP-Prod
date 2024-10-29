'use server';

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import { IAppointment } from '../../types/ICreateAppointments';

// Setup NodeMailer
const gmail = process.env.NEXT_PUBLIC_NODEMAILER_GMAIL;
const pass = process.env.NEXT_PUBLIC_NODEMAILER_PASS;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  secure: false,
  auth: {
    user: gmail,
    pass: pass,
  },
});

// Helper function to send emails
const sendDeadlineReminderEmail = async (
  email: string,
  appointmentDetails: {
    appointmentName: string;
    endDate: string;
    lawyerName: string;
    location: string;
  },
) => {
  const mailOptions = {
    from: 'admin@lawspicious.com',
    to: email,
    subject: `Appointment Deadline Reminder: ${appointmentDetails.appointmentName}`,
    text: `Dear ${appointmentDetails.lawyerName},\n\nThis is a reminder that the appointment with "${appointmentDetails.appointmentName}" at ${appointmentDetails.location} is approaching its deadline (${appointmentDetails.endDate}). Please make sure to complete it on time.\n\nThank you, Lawspicious-Admin`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Cloud Scheduler Trigger (runs daily)
export const scheduledDeadlineCheckAppointments = functions
  .region('asia-south1')
  .pubsub.schedule('every 24 hours')
  .onRun(async (context) => {
    const db = admin.firestore();
    db.settings({ ignoreUndefinedProperties: true });

    // Get the current date and the date 24 hours later in 'YYYY-MM-DD' format
    const currentDate = new Date();
    const oneDayLater = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);

    const currentDateString = currentDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const oneDayLaterString = oneDayLater.toISOString().split('T')[0]; // 'YYYY-MM-DD'

    try {
      // Query Firestore for appointments where date is within the next 24 hours
      const appointmentsSnapshot = await db
        .collection('appointments')
        .where('date', '>=', currentDateString)
        .where('date', '<=', oneDayLaterString)
        .get();

      if (appointmentsSnapshot.empty) {
        console.log('No appointments with upcoming deadlines found.');
        return null;
      }

      // Process each appointment and send email reminders
      const appointments = appointmentsSnapshot.docs.map((appointmentDoc) => ({
        ...(appointmentDoc.data() as IAppointment),
        id: appointmentDoc.id,
      }));

      await Promise.all(
        appointments.map(async (appointmentData) => {
          const lawyerDetails = appointmentData.lawyerDetails; // Single object

          try {
            // Send reminder email to the assigned lawyer
            await sendDeadlineReminderEmail(lawyerDetails.email, {
              appointmentName: appointmentData.clientDetails.name,
              endDate: appointmentData.date,
              lawyerName: lawyerDetails.name,
              location: appointmentData.location,
            });
            console.log(
              `Reminder email sent to ${lawyerDetails.email} for appointment with: ${appointmentData.clientDetails.name}`,
            );

            // Create a notification document in Firestore
            await db.collection('notifications').add({
              appointmentId: appointmentData.id,
              appointmentName: appointmentData.clientDetails.name,
              lawyerIds: [lawyerDetails.id],
              lawyerName: lawyerDetails.name,
              notificationName: `Tomorrow is the deadline for appointment: ${appointmentData.clientDetails.name}`,
              endDate: appointmentData.date,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              status: 'unseen',
              type: 'Appointment',
            });

            console.log(
              `Notification created for appointment: ${appointmentData.clientDetails.name} for lawyer ID: ${lawyerDetails.id}`,
            );
          } catch (emailError) {
            console.error(
              `Failed to send email or create notification for ${lawyerDetails.email}:`,
              emailError,
            );
          }
        }),
      );

      console.log(
        'Scheduled deadline check for appointments completed successfully.',
      );
      return null;
    } catch (error) {
      console.error(
        'Error fetching appointments or processing reminders:',
        error,
      );
      return null;
    }
  });
