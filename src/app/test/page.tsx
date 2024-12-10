'use client';
import PDFfile from '@/components/ui/PDFfile';
import React from 'react';

import dynamic from 'next/dynamic';
import { IInvoice } from '@/types/invoice';
import { PDFDownloadLink } from '@react-pdf/renderer';

const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
  },
);

const invoiceData: IInvoice = {
  id: 'INV001',
  billTo: 'client',
  clientDetails: {
    id: 'C001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    mobile: '9876543210',
    location: 'New York, USA',
  },
  createdAt: '2024-12-01',
  dueDate: '2024-12-15',
  services: [
    {
      name: 'Legal Consultation',
      description: 'Initial consultation regarding case proceedings.',
      amount: 200,
    },
    {
      name: 'Document Review',
      description: 'Review of legal documents related to the case.',
      amount: 150,
    },
  ],
  paymentStatus: 'unpaid',
  totalAmount: 350,
  RE: [
    {
      caseId: 'CASE001',
    },
    {
      caseId: 'CASE002',
    },
  ],
  teamMember: [
    {
      id: 'TM001',
      name: 'Alice Smith',
      email: 'alice.smith@example.com',
      phoneNumber: '9876543211',
    },
    {
      id: 'TM002',
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      phoneNumber: '9876543212',
    },
  ],
  gstNote: 'GST applicable as per local laws.',
  panNo: 'ABCDE1234F',
  // paymentDate: null, // No payment made yet
};

const Page = () => {
  return (
    //   <PDFDownloadLink
    //   document={<PDFfile invoiceData={invoiceData} />}
    //   fileName={`${invoiceData.id}.pdf`}
    // >

    //   {({ loading, error }) => {
    //     if(error) {
    //       console.log(error)
    //     }
    //     if (loading) {
    //       return (
    //         <button className="btn-primary my-6" disabled>
    //           Loading document...
    //         </button>
    //       );
    //     } else {
    //       return (
    //         <button className="btn-primary my-6">
    //           Download Abhradip Invoice
    //         </button>
    //       );
    //     }
    //   }}
    // </PDFDownloadLink>
    <div>hello</div>
  );
};

export default Page;
