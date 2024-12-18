'use client';
import PDFfile from '@/components/ui/PDFfile-abhradip-jha';
import React from 'react';

import dynamic from 'next/dynamic';
import { IInvoice } from '@/types/invoice';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { useTask } from '@/hooks/useTaskHooks';

const Page = () => {
  return (
    // <PDFViewer style={{ width: '100%', height: '100%' }}>
    //   {/* <PDFfileTest invoiceData={invoiceData} /> */}
    // </PDFViewer>
    <div>hello</div>
  );
};

export default Page;
