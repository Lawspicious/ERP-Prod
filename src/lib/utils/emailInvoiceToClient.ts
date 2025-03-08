'use server';

import { IInvoice } from '@/types/invoice';
import * as nodemailer from 'nodemailer';
import { toWords } from 'number-to-words'; // assuming you have this or similar library for number-to-words conversion

export const sendInvoiceEmailToLawyerNodeMailer = async (
  invoice: IInvoice,
  message: { heading: string; body: string },
) => {
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

  const today = new Date().toLocaleDateString();

  // Invoice part based on printInvoice format
  const invoiceDetailsHtml = `
    <div class="header">
        <h1>Abhradip Jha</h1>
        <p>Advocate</p>
        <p>High Court, Calcutta</p>
        <p>1/1A, Vansittart Row, Kolkata 700001</p>
        <p>8017173320 | jhaabhradip7@gmail.com</p>
        <hr>
    </div>
    
    <table class="details-table">
        <tr>
            <td><strong>Date:</strong> ${today}</td>
            <td><strong>Bill to:</strong> ${invoice?.clientDetails?.name}</td>
        </tr>
        <tr>
            <td><strong>Re:</strong> ${invoice.RE.map((redata) => `TS: ${redata.caseId}`).join(', ')}</td>
        </tr>
    </table>
    
    <table class="description-table">
        <thead>
            <tr>
                <th>Service Name</th>
                <th>Description</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            ${invoice.services
              .map(
                (service) => `
                <tr>
                    <td>${service.name}</td>
                    <td>${service.description}</td>
                    <td>Rs. ${service.amount}/-</td>
                </tr>
              `,
              )
              .join('')}
            <tr class="total">
                <td colspan="2">Total: ${toWords(invoice.totalAmount).toUpperCase()}</td>
                <td>Rs. ${invoice.totalAmount}/-</td>
            </tr>
        </tbody>
    </table>
    
    <div class="footer">
        <p>Pay to:</p>
        <p>Abhradip Jha</p>
        <p>State Bank of India (Siriti- Muchipara Branch)</p>
        <p>Acc no. 33140676929</p>
        <p>IFSC- SBIN0011533</p>
        <p>PAN- AYBPJ1201F</p>
    
        <p style="text-align:right;">
            <img src="/sign.jpg" style="height: 50px;">
            <br>
            Abhradip Jha
        </p>
    </div>
  `;

  // Combining invoice details with email layout
  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Invoice Notification</title>
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
        .total { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${message.heading}</h1>
        </div>
        <div class="content">
          <h2>Hello, <strong>${invoice?.clientDetails?.name}</strong></h2>
          <p>${message.body}</p>

          ${invoiceDetailsHtml}

          <p>Please log into your Lawspicious dashboard for more details and to take further action.</p>
          <p class="invoice-status">This invoice is marked as <strong>${invoice.paymentStatus}</strong>.</p>
          <p>Thank you for choosing Lawspicious.</p>
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
    to: invoice?.clientDetails?.email,
    subject: `${message.heading} - Invoice ID: ${invoice.id || 'N/A'}`,
    html: emailHtml,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error: any) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export const sendUpdateEmailToClientForNextHearings = async (caseData: any) => {
  const gmail = process.env.NEXT_PUBLIC_NODEMAILER_GMAIL;
  const pass = process.env.NEXT_PUBLIC_NODEMAILER_PASS;

  if (!gmail || !pass) {
    throw new Error('Gmail or password not set in environment variables.');
  }

  // Check if nextHearing exists and is valid
  let nextHearingDate = 'Not scheduled';
  let isValidDate = false;

  if (caseData.nextHearing) {
    const date = new Date(caseData.nextHearing);
    // Check if date is valid (not NaN)
    if (!isNaN(date.getTime())) {
      nextHearingDate = date.toLocaleDateString();
      isValidDate = true;
    } else {
      nextHearingDate = 'Invalid date format';
    }
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

  const today = new Date().toLocaleDateString();

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Next Hearing Date Notification</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f9; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); }
        .header { text-align: center; padding: 10px; background-color: #2d3748; color: #ffffff; border-radius: 10px 10px 0 0; }
        .header h1 { font-size: 24px; margin: 0; }
        .content { padding: 20px; }
        .content h2 { color: #2d3748; font-size: 20px; }
        .content p { color: #333333; font-size: 16px; line-height: 1.6; }
        .case-details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; background-color: #2d3748; color: #ffffff; border-radius: 0 0 10px 10px; margin-top: 20px; }
        .footer p { margin: 0; }
        .footer img { width: 50px; margin-top: 10px; }
        .warning { color: #e53e3e; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Next Hearing Date Notification</h1>
        </div>
        <div class="content">
          <h2>Hello, <strong>${caseData.clientDetails?.name}</strong></h2>
          <p>This is to inform you about the next hearing date for your case.</p>
          
          <div class="case-details">
            <p><strong>Case Number:</strong> ${caseData.caseNo}</p>
            <p><strong>Case Type:</strong> ${caseData.caseType}</p>
            <p><strong>Court Name:</strong> ${caseData.courtName || 'Not specified'}</p>
            <p><strong>Next Hearing Date:</strong> ${nextHearingDate}</p>
            ${!isValidDate ? '<p class="warning">Note: The next hearing date is not currently scheduled or is in an invalid format.</p>' : ''}
            <p><strong>Case Status:</strong> ${caseData.caseStatus}</p>
            <p><strong>Petitioner:</strong> ${caseData.petition?.petitioner || 'Not specified'}</p>
            <p><strong>Respondent:</strong> ${caseData.respondent?.respondentee || 'Not specified'}</p>
          </div>
          
          <p>Please ensure you are prepared for the upcoming hearing. If you have any questions or need further information, please contact your lawyer.</p>
          <p>Thank you for choosing Lawspicious.</p>
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
    to: caseData.clientDetails?.email,
    subject: `Next Hearing Date Notification - Case: ${caseData.caseNo}`,
    html: emailHtml,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error: any) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
