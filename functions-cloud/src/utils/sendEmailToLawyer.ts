'use server';

import * as nodemailer from 'nodemailer';

export const sendEmailToLawyerNodeMailer = async (emailParams: any) => {
  const gmail = process.env.NEXT_PUBLIC_NODEMAILER_GMAIL;
  const pass = process.env.NEXT_PUBLIC_NODEMAILER_PASS;
  // console.log('Gmail:', process.env.NODEMAILER_GMAIL);
  // console.log('Password:', process.env.NODEMAILER_PASS);

  if (!gmail || !pass) {
    throw new Error('Gmail or password not set in environment variables.');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail', // Using Gmail as the service
    host: 'smtp.gmail.com',
    secure: false,
    auth: {
      user: gmail, // Your Gmail address
      pass: pass, // The app password you generated
    },
  });

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Case Notification</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f9; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); }
        .header { text-align: center; padding: 10px; background-color: #2d3748; color: #ffffff; border-radius: 10px 10px 0 0; }
        .header h1 { font-size: 24px; margin: 0; }
        .content { padding: 20px; }
        .content h2 { color: #2d3748; font-size: 20px; }
        .content p { color: #333333; font-size: 16px; line-height: 1.6; }
        .content .case-details { margin-top: 20px; padding: 15px; background-color: #f4f4f9; border-radius: 10px; border: 1px solid #dddddd; }
        .case-details p { margin: 5px 0; }
        .footer { text-align: center; padding: 20px; background-color: #2d3748; color: #ffffff; border-radius: 0 0 10px 10px; margin-top: 20px; }
        .footer p { margin: 0; }
        .footer img { width: 50px; margin-top: 10px; }
        .case-status { font-weight: bold; color: #e53e3e; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${emailParams.message.heading}</h1>
        </div>
        <div class="content">
          <h2>Hello, <strong>${emailParams.lawyerName}</strong></h2>
          <p>${emailParams.message.body}</p>
          <div class="case-details">
            <p><strong>Case ID:</strong> ${emailParams.caseId}</p>
            <p><strong>Case Type:</strong> ${emailParams.caseType}</p>
            <p><strong>Court Name:</strong> ${emailParams.courtName}</p>
            <p><strong>Registration Date:</strong> ${emailParams.regDate}</p>
            <p><strong>Judge:</strong> ${emailParams.judge}</p>
            <p><strong>Next Hearing Date:</strong> ${emailParams.nextHearing}</p>
          </div>
          <p>Please log into your Lawspicious dashboard for more details and to take further action.</p>
          <p class="case-status">This case is marked as <strong>${emailParams.caseStatus}</strong>.</p>
        </div>
        <div class="footer">
          <p>Best regards,</p>
          <p>Team Lawspicious</p>
          <img src="https://cdn.discordapp.com/attachments/1276816469765918794/1283460930654568479/favcon.png?ex=66e313a3&is=66e1c223&hm=8deab6b5765b59fa7ae9ffc03e68a1d0a567074f597af6a18be0d821287fadfa&" alt="Lawspicious Logo" />
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: 'admin@lawspicious.com',
    to: emailParams.to_email,
    subject: `${emailParams.message.heading} - Case ID: ${emailParams.caseId}`,
    html: emailHtml,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error: any) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
