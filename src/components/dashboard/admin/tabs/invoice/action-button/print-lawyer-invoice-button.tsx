import { today } from '@/lib/utils/todayDate';
import { IInvoice } from '@/types/invoice';
import { Button } from '@chakra-ui/react';
import { Printer } from 'lucide-react';
import React from 'react';
import converter from 'number-to-words';

const PrintLawyerInvoiceButton = ({
  invoiceData,
}: {
  invoiceData: IInvoice;
}) => {
  const printInvoice = () => {
    if (invoiceData) {
      const printContent = `
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Invoice-${invoiceData.id}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        font-size: 12px;
                    }

                    .header {
                        text-align: left;
                        margin-bottom: 10px;
                    }

                    .header h1 {
                        font-size: 18px;
                        margin-bottom: 5px;
                    }

                    .header p {
                        margin: 2px 0;
                    }

                    hr {
                        border: 0;
                        height: 1px;
                        background: black;
                        margin: 10px 0;
                    }

                    .details-table {
                        width: 100%;
                        margin-bottom: 15px;
                    }

                    .details-table td {
                        padding: 4px 0;
                    }

                    .description-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 15px;
                    }

                    .description-table th, 
                    .description-table td {
                        border: 1px solid black;
                        padding: 6px;
                        text-align: left;
                    }

                    .description-table th {
                        background-color: #f3f4f6;
                    }

                    .footer {
                        margin-top: 15px;
                    }

                    .footer p {
                        margin: 2px 0;
                    }

                    .total-row td {
                        font-weight: bold;
                        text-transform: uppercase;
                    }

                    .signature {
                        text-align: right;
                        margin-top: 20px;
                    }

                    .signature img {
                        height: 40px;
                        margin-bottom: 5px;
                    }
                </style>
            </head>
            <body>
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
                        <td><strong>Bill to:</strong> ${invoiceData?.clientDetails?.name}</td>
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
                        ${invoiceData.services
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
                        <tr class="total-row">
                            <td colspan="2">Total: ${converter.toWords(invoiceData.totalAmount).toUpperCase()}</td>
                            <td>Rs. ${invoiceData.totalAmount}/-</td>
                        </tr>
                    </tbody>
                </table>

                <div class="footer">
                    <p>Pay to:</p>
                    <p>Abhradip Jha</p>
                    <p>State Bank of India (Siriti- Muchipara Branch)</p>
                    <p>Acc no. 33140676926</p>
                    <p>IFSC- SBIN0011533</p>
                    <p>PAN- AYBPJ1201F</p>

                    <div class="signature">
                        <img src="/sign.jpg" alt="Signature">
                        <p>Abhradip Jha</p>
                    </div>
                </div>
            </body>
            </html>

            `;

      // Open print window and write content
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus(); // Focus on the print window
        printWindow.onload = function () {
          printWindow.print(); // Print after the content has fully loaded
          // printWindow.close(); // Optionally close the print window after printing
        };
      }
    }
  };

  return (
    <button
      className="btn-primary w-full"
      disabled={!invoiceData}
      onClick={printInvoice}
    >
      Print Abhradip Jha's Invoice
    </button>
  );
};

export default PrintLawyerInvoiceButton;
