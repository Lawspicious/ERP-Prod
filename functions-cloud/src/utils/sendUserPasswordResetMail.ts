'use server';

import * as nodemailer from 'nodemailer';

// Function to send user email with a password reset link
export const sendUserResetPasswordEmail = async (
  email: string,
  name: string,
  link: string,
  message: string,
) => {
  const gmail = process.env.NEXT_PUBLIC_NODEMAILER_GMAIL;
  const pass = process.env.NEXT_PUBLIC_NODEMAILER_PASS;

  if (!gmail || !pass) {
    throw new Error('Gmail or password not set in environment variables.');
  }

  // Generate a password reset link

  const transporter = nodemailer.createTransport({
    service: 'gmail', // Using Gmail as the service
    host: 'smtp.gmail.com',
    secure: false,
    auth: {
      user: gmail, // Your Gmail address
      pass: pass, // The app password you generated
    },
  });

  // HTML content for the welcome email with password reset link
  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Lawspicious</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f9; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); }
        .header { text-align: center; padding: 10px; background-color: #2d3748; color: #ffffff; border-radius: 10px 10px 0 0; }
        .header h1 { font-size: 24px; margin: 0; }
        .content { padding: 20px; }
        .content h2 { color: #2d3748; font-size: 20px; }
        .content p { color: #333333; font-size: 16px; line-height: 1.6; }
        .footer { text-align: center; padding: 20px; background-color: #2d3748; color: #ffffff; border-radius: 0 0 10px 10px; margin-top: 20px; }
        .footer p { margin: 0; }
        .footer img { width: 50px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Lawspicious</h1>
        </div>
        <div class="content">
          <h2>Hello, <strong>${name}</strong></h2>
          <p>${message}</p>
          <p>To set your password, please click on the following link:</p>
          <p><a href="${link}" target="_blank" style="color: #1a73e8;">Set Your Password</a></p>
          <p>If you didn't request this, please ignore this email.</p>
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
    to: email,
    subject: 'Welcome to Lawspicious - Set Your Password',
    html: emailHtml,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error: any) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
