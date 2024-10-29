'use server';

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import { ICreateCase } from '../../types/ICreateCase';

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
const sendCaseReminderEmail = async (email: string, caseDetails: any) => {
  const mailOptions = {
    from: 'admin@lawspicious.com',
    to: email,
    subject: `Case Reminder: ${caseDetails.caseNo}`,
    text: `Dear ${caseDetails.lawyerName},\n\nThis is a reminder for the case "${caseDetails.caseNo}" (${caseDetails.caseType}). The next hearing is scheduled for ${caseDetails.nextHearing} at ${caseDetails.courtName}. Please take appropriate actions.\n\nThank you,\nLawspicious-Admin`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Cloud Scheduler Trigger (runs daily)
export const scheduledDeadlineCheckCases = functions
  .region('asia-south1')
  .pubsub.schedule('every 24 hours')
  .onRun(async () => {
    const db = admin.firestore();
    db.settings({ ignoreUndefinedProperties: true });

    const currentDate = new Date();
    const oneDayLater = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);

    const currentDateString = currentDate.toISOString().split('T')[0];
    const oneDayLaterString = oneDayLater.toISOString().split('T')[0];

    try {
      // Query Firestore for cases where nextHearing is either missing or within the next 24 hours
      const casesSnapshot = await db
        .collection('cases')
        .where('caseStatus', '==', 'RUNNING')
        .get();

      if (casesSnapshot.empty) {
        console.log('No cases found.');
        return null;
      }

      // Process each case and send reminders if needed
      const cases = casesSnapshot.docs.map((caseDoc) => ({
        ...(caseDoc.data() as ICreateCase),
        id: caseDoc.id,
      }));

      await Promise.all(
        cases.map(async (caseData) => {
          const { nextHearing } = caseData;
          const lawyerDetails = caseData.lawyer;

          // Check if nextHearing is missing or within the next 24 hours
          if (
            !nextHearing ||
            (nextHearing >= currentDateString &&
              nextHearing <= oneDayLaterString)
          ) {
            try {
              // Send the reminder email
              await sendCaseReminderEmail(lawyerDetails.email, {
                caseNo: caseData.caseNo,
                caseType: caseData.caseType,
                nextHearing: nextHearing || 'Not Scheduled',
                lawyerName: lawyerDetails.name,
                courtName: caseData.courtName,
              });
              console.log(
                `Reminder email sent to ${lawyerDetails.email} for case: ${caseData.caseNo}`,
              );

              // Create a notification in Firestore
              await db.collection('notifications').add({
                caseId: caseData.id,
                caseNo: caseData.caseNo,
                lawyerIds: [lawyerDetails.id],
                notificationName: nextHearing
                  ? `Tomorrow is the hearing for case: ${caseData.caseNo}`
                  : `No upcoming hearing scheduled for case: ${caseData.caseNo}`,
                nextHearing: nextHearing || 'Not Scheduled',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'unseen',
                type: 'Case',
              });

              console.log(
                `Notification created for case: ${caseData.caseNo} with lawyer ID: ${lawyerDetails.id}`,
              );
            } catch (error) {
              console.error(
                `Failed to send email or create notification for case ${caseData.caseNo}:`,
                error,
              );
            }
          }
        }),
      );

      console.log('Scheduled case check completed successfully.');
      return null;
    } catch (error) {
      console.error('Error fetching cases or processing reminders:', error);
      return null;
    }
  });
