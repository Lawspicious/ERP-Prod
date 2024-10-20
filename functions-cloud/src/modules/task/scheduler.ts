'use server';

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

// // Initialize Firebase Admin SDK
// if (!admin.apps.length) {
//   admin.initializeApp();
// }

// Setup NodeMailer
const gmail = process.env.NEXT_PUBLIC_NODEMAILER_GMAIL;
const pass = process.env.NEXT_PUBLIC_NODEMAILER_PASS;
// console.log('Gmail:', process.env.NODEMAILER_GMAIL);
// console.log('Password:', process.env.NODEMAILER_PASS);

// if (!gmail || !pass) {
//   throw new Error('Gmail or password not set in environment variables.');
// }

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

// Cloud Scheduler Trigger (runs daily)
// Cloud Scheduler Trigger (runs daily) with region set to 'asia-south1'
// export const scheduledDeadlineCheck = functions
//   .region('asia-south1') // Setting region
//   .pubsub.schedule('every 24 hours')
//   .onRun(async (context) => {
//     const db = admin.firestore();

//     // Get the current date and the date 24 hours later in 'YYYY-MM-DD' format
//     const currentDate = new Date();
//     const oneDayLater = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);

//     const currentDateString = currentDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'
//     const oneDayLaterString = oneDayLater.toISOString().split('T')[0]; // 'YYYY-MM-DD'

//     try {
//       // Query Firestore for tasks where endDate is within the next 24 hours
//       const tasksSnapshot = await db
//         .collection('tasks')
//         .where('endDate', '>=', currentDateString) // Compare as strings
//         .where('endDate', '<=', oneDayLaterString)
//         .get();

//       if (tasksSnapshot.empty) {
//         console.log('No tasks with upcoming deadlines found.');
//         return null;
//       }

//       // Process each task and send email reminders
//       const tasks = tasksSnapshot.docs.map((taskDoc) => taskDoc.data());

//       await Promise.all(
//         tasks.map(async (taskData) => {
//           const lawyerDetails = taskData?.lawyerDetails || [];

//           // Send reminder email to each assigned lawyer
//           await Promise.all(
//             lawyerDetails.map(
//               async (lawyer: { email: string; name: string }) => {
//                 try {
//                   await sendDeadlineReminderEmail(lawyer.email, {
//                     taskName: taskData.taskName,
//                     endDate: taskData.endDate,
//                     lawyerName: lawyer.name,
//                   });
//                   console.log(
//                     `Reminder email sent to ${lawyer.email} for task: ${taskData.taskName}`,
//                   );
//                 } catch (emailError) {
//                   console.error(
//                     `Failed to send email to ${lawyer.email}:`,
//                     emailError,
//                   );
//                 }
//               },
//             ),
//           );
//         }),
//       );

//       return null;
//     } catch (error) {
//       console.error('Error fetching tasks or sending emails:', error);
//       return null;
//     }
//   });
export const scheduledDeadlineCheck = functions
  .region('asia-south1') // Setting region
  .pubsub.schedule('every 24 hours')
  .onRun(async () => {
    const db = admin.firestore();

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

      // Process each task and send email reminders and create notifications
      const tasks = tasksSnapshot.docs.map((taskDoc) => ({
        ...taskDoc.data(),
      }));

      await Promise.all(
        tasks.map(async (taskData) => {
          const lawyerDetails = taskData?.lawyerDetails || [];

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

                  // Create a new document in the notifications collection
                  await db.collection('notifications').add({
                    taskId: taskData.id,
                    taskName: taskData.taskName,
                    lawyerId: lawyer.id,
                    lawyerName: lawyer.name,
                    lawyerEmail: lawyer.email,
                    notificationName: `Tomorrow is the deadline for task: ${taskData.taskName}`,
                    endDate: taskData.endDate,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                  });

                  console.log(
                    `Notification created for lawyer: ${lawyer.name} regarding task: ${taskData.taskName}`,
                  );
                } catch (error) {
                  console.error(
                    `Failed to process lawyer ${lawyer.email}:`,
                    error,
                  );
                }
              },
            ),
          );
        }),
      );

      console.log('Scheduled deadline check completed successfully.');
      return null;
    } catch (error) {
      console.error('Error fetching tasks or processing reminders:', error);
      return null;
    }
  });
