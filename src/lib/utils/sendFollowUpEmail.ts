'use server';

import * as nodemailer from 'nodemailer';

export const sendFollowUpEmail = async ({
  to_email,
  taskTitle,
  fromUserName,
}: {
  to_email: string;
  taskTitle: string;
  fromUserName: string;
}) => {
  const gmail = process.env.NEXT_PUBLIC_NODEMAILER_GMAIL;
  const pass = process.env.NEXT_PUBLIC_NODEMAILER_PASS;

  if (!gmail || !pass) {
    throw new Error('Gmail or password not set in environment variables.');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    secure: false,
    auth: {
      user: gmail,
      pass: pass,
    },
  });

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f9; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: #2d3748; color: #fff; padding: 15px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { padding: 20px; color: #333; }
        .footer { background: #2d3748; color: #fff; text-align: center; padding: 15px; border-radius: 0 0 10px 10px; }
        .task-info { margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px; border: 1px solid #ddd; }
        .task-info p { margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Follow-Up Notification</h2>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p><strong>${fromUserName}</strong> is following up with you for the following task:</p>
          <div class="task-info">
            <p><strong>Task Title:</strong> ${taskTitle}</p>
          </div>
          <p>Please log in to the system to review and take action if necessary.</p>
        </div>
        <div class="footer">
          <p>Powered by Lawspicious Internal Tools</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: 'admin@lawspicious.com',
    to: to_email,
    subject: `Follow-up for Task: ${taskTitle}`,
    html: emailHtml,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error: any) {
    throw new Error(`Failed to send follow-up email: ${error.message}`);
  }
};
