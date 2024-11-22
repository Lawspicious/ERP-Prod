'use server';

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import { ICreateTask } from '../../types/ICreateTask';

// Setup NodeMailer
const gmail = process.env.NEXT_PUBLIC_NODEMAILER_GMAIL;
const pass = process.env.NEXT_PUBLIC_NODEMAILER_PASS;

const transporter = nodemailer.createTransport({
  service: 'gmail', // Using Gmail as the service
  host: 'smtp.gmail.com',
  secure: false,
  auth: {
    user: gmail, // Your Gmail address
    pass: pass, // The app password you generated
  },
});

// Helper function to send emails
const sendDeadlineReminderEmail = async (email: string, taskDetails: any) => {
  const mailOptions = {
    from: 'admin@lawspicious.com',
    to: email,
    subject: `Task Deadline Reminder: ${taskDetails.taskName}`,
    text: `Dear ${taskDetails.lawyerName},\n\nThis is a reminder that the task "${taskDetails.taskName}" is approaching its deadline (${taskDetails.endDate}). Please make sure to complete it on time.\n\nThank you, Lawspicious-Admin`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const scheduledDeadlineCheck = functions
  .region('asia-south1') // Setting region
  .pubsub.schedule('every 24 hours')
  .onRun(async () => {
    const db = admin.firestore();
    db.settings({ ignoreUndefinedProperties: true });

    // Get the current date and the date 24 hours later in 'YYYY-MM-DD' format
    const currentDate = new Date();
    const oneDayLater = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);

    const currentDateString = currentDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const oneDayLaterString = oneDayLater.toISOString().split('T')[0]; // 'YYYY-MM-DD'

    try {
      // Query Firestore for tasks where endDate is within the next 24 hours
      const tasksSnapshot = await db
        .collection('tasks')
        .where('endDate', '>=', currentDateString)
        .where('endDate', '<=', oneDayLaterString)
        .get();

      if (tasksSnapshot.empty) {
        console.log('No tasks with upcoming deadlines found.');
        return null;
      }

      // Process each task and send email reminders
      const tasks = tasksSnapshot.docs.map((taskDoc) => ({
        ...(taskDoc.data() as ICreateTask),
        id: taskDoc.id as string,
      }));

      await Promise.all(
        tasks.map(async (taskData) => {
          const lawyerDetails = taskData?.lawyerDetails || [];
          const lawyerIds: string[] = [];

          await Promise.all(
            lawyerDetails.map(
              async (lawyer: { email: string; name: string; id: string }) => {
                try {
                  // Send the reminder email
                  await sendDeadlineReminderEmail(lawyer.email, {
                    taskName: taskData.taskName,
                    endDate: taskData.endDate,
                    lawyerName: lawyer.name,
                  });
                  console.log(
                    `Reminder email sent to ${lawyer.email} for task: ${taskData.taskName}`,
                  );

                  // Add lawyer ID to the array
                  lawyerIds.push(lawyer.id);
                } catch (error) {
                  console.error(
                    `Failed to process lawyer ${lawyer.email}:`,
                    error,
                  );
                }
              },
            ),
          );

          // Create a new document in the notifications collection
          if (lawyerIds.length > 0) {
            await db.collection('notifications').add({
              taskId: taskData.id,
              taskName: taskData.taskName,
              lawyerIds: lawyerIds,
              notificationName: `Tomorrow is the deadline for task: ${taskData.taskName}`,
              endDate: taskData.endDate,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              type: 'Task',
              seenBy: [''],
              clearedBy: [''],
            });

            console.log(
              `Notification created for task: ${taskData.taskName} with lawyer IDs: ${lawyerIds.join(', ')}`,
            );
          }
        }),
      );

      console.log('Scheduled deadline check completed successfully.');
      return null;
    } catch (error) {
      console.error('Error fetching tasks or processing reminders:', error);
      return null;
    }
  });
