import { today } from '@/lib/utils/todayDate';
import { IInvoice } from '@/types/invoice';
import { Button } from '@chakra-ui/react';
import { Printer } from 'lucide-react';
import React from 'react';
import converter from 'number-to-words';

const PrintLawspiciousInvoiceButton = ({
  invoiceData,
}: {
  invoiceData: IInvoice;
}) => {
  const printInvoice = () => {
    if (invoiceData) {
      const printContent = `<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice-${invoiceData.id}</title>
    <link rel="stylesheet" href="styles.css">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }
        .logo-image{
            width: 200px;
        }

        .header-logo-side{
            margin-right: 20px;
        }

        .contact-info p {
            margin: 0;
        }

        .gst-info,
        .invoice-info,
        .bill-to {
            margin: 20px 0;
        }

        .charges {
            margin: 20px 0px;
        }

        .description-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
            
                    .description-table th, .description-table td {
                        border: 1px solid black;
                        padding: 8px;
                        text-align: left;
                    }

        .footer {
            margin-top: 20px;
            border-top: 1px solid #000;
            padding-top: 10px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <div class="header-logo-side">
                    <img src='/long_logo_final.png' class="logo-image"/>
                    <div class="gst-info">
                        <p>GSTIN: 19AALFL0025D1ZO</p>
                        <p>PAN: AALFL0025D</p>
                    </div>
            </div>
            <div class="contact-info">
                <p>1/1A, Vansittart row, Second Floor, Room No 6,</p>
                <p>Kolkata - 700001</p>
                <p>+91 80171 73320</p>
                <p>info@lawspicious.com</p>
            </div>
        </div>


        <!-- Horizontal Line -->

        <div class="invoice-info">
            <p>Invoice no: ${invoiceData.id}</p>
            <p>Invoice date:${invoiceData.createdAt}</p>
        </div>

        <div class="bill-to">
            <p>Bill to:</p>

            <p><strong>${invoiceData?.clientDetails?.name}</strong></p>
            <p>${invoiceData?.clientDetails?.location}</p>
           ${invoiceData.panNo ? `<p>PAN: ${invoiceData.panNo}</p>` : ''}
            
        </div>

        <div class="charges">
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
                    <tr class="total">
                        <td colspan="2">Total: ${converter.toWords(invoiceData.totalAmount).toUpperCase()}</td>
                        <td>Rs. ${invoiceData.totalAmount}/-</td>
                    </tr>
                    </tbody>
                </table>
        </div>

        <div class="footer">
            <p>
                <img src="/sign.jpg"  style="height: 50px;">
                <br>
                Abhradip Jha
            </p>
            <p>Our Bank details:</p>
            <p>Name: Lawspicious</p>
            <p>IFSC: HDFC0006504</p>
            <p>Account no: 5020008284412</p>
            <p>Bank: HDFC Bank, Kolkata High Court Branch</p>
            <p>${invoiceData.gstNote ? `${invoiceData.gstNote}` : ''}</p>
        </div>
    </div>
</body>

</html>`;

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
      Print Lawspicious Invoice
    </button>
  );
};

export default PrintLawspiciousInvoiceButton;
