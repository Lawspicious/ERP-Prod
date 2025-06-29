'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { IInvoice } from '@/types/invoice';
import PDFfile from '@/components/ui/PDFfile-abhradip-jha';
import { Button } from '@chakra-ui/react';

// Importing PDFViewer dynamically to disable SSR (Server-Side Rendering)
const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => <p>Loading PDF Viewer...</p>,
  },
);

const PrintLawyerInvoiceButton = ({
  invoiceData,
}: {
  invoiceData: IInvoice;
}) => {
  const openPDFInNewTab = () => {
    // Open a new tab
    const newTab = window.open('', '_blank');
    if (!newTab) {
      console.error('Failed to open a new tab');
      return;
    }

    // Generate filename using invoiceData.id
    const filename = `${invoiceData.id}.pdf`;

    // Write the minimal HTML structure for the new tab
    newTab.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${filename}</title>
          <style>
            html, body, #pdf-viewer-root {
              margin: 0;
              padding: 0;
              height: 100%;
              width: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: #f0f0f0;
            }
          </style>
        </head>
        <body>
          <div id="pdf-viewer-root"></div>
        </body>
      </html>
    `);

    newTab.document.close();

    // Use React to render the PDFViewer component in the new tab
    const container = newTab.document.getElementById('pdf-viewer-root');
    if (container) {
      const ReactPDFViewer = (
        <PDFViewer style={{ width: '100%', height: '100%' }}>
          <PDFfile invoiceData={invoiceData} />
        </PDFViewer>
      );

      // Use React 18's createRoot to render into the new tab
      import('react-dom/client').then(({ createRoot }) => {
        createRoot(container).render(ReactPDFViewer);
      });
    } else {
      console.error('Failed to find the root container in the new tab');
    }
  };

  return (
    <Button colorScheme="purple" onClick={openPDFInNewTab}>
      Print Abhradip Jha Invoice
    </Button>
  );
};

export default PrintLawyerInvoiceButton;
