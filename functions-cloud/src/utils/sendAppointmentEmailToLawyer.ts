'use server';

import * as nodemailer from 'nodemailer';

export const sendAppointmentEmailToLawyerNodeMailer = async (
  emailParams: any,
) => {
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
      <title>New appointment Notification</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f9; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); }
        .header { text-align: center; padding: 10px; background-color: #2d3748; color: #ffffff; border-radius: 10px 10px 0 0; }
        .header h1 { font-size: 24px; margin: 0; }
        .content { padding: 20px; }
        .content h2 { color: #2d3748; font-size: 20px; }
        .content p { color: #333333; font-size: 16px; line-height: 1.6; }
        .content .appointment-details { margin-top: 20px; padding: 15px; background-color: #f4f4f9; border-radius: 10px; border: 1px solid #dddddd; }
        .appointment-details p { margin: 5px 0; }
        .footer { text-align: center; padding: 20px; background-color: #2d3748; color: #ffffff; border-radius: 0 0 10px 10px; margin-top: 20px; }
        .footer p { margin: 0; }
        .footer img { width: 50px; margin-top: 10px; }
        .appointment-status { font-weight: bold; color: #e53e3e; }
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
          <div class="appointment-details">
            <p><strong>Appointment Time:</strong> ${emailParams.appointmentId}</p>
            <p><strong>Appointment Date:</strong> ${emailParams.appointmentType}</p>
            <p><strong>Appointment Location:</strong> ${emailParams.appointmentName}</p>
            <p><strong>Client Name:</strong> ${emailParams.clientName}</p>
          </div>
          <p>Please log into your Lawspicious dashboard for more details and to take further action.</p>
          <p class="appointment-status">This appointment is marked as <strong>${emailParams.appointmentStatus}</strong>.</p>
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
    subject: `${emailParams.message.heading} - appointment ID: ${emailParams.appointmentId}`,
    html: emailHtml,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error: any) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
