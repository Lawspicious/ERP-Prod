import React from 'react';
import { Page, Text, Document, View, Image } from '@react-pdf/renderer';
import styles from './pdfStyles';
import { IInvoice, IService } from '@/types/invoice';

const PDFfile = ({ invoiceData }: { invoiceData: IInvoice }) => {
  if (!invoiceData || !invoiceData.id) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Invalid invoice data</Text>
        </Page>
      </Document>
    );
  }

  // Dynamic chunking function
  const chunkServicesByHeight = (
    services: IService[],
    maxHeightPerPage: number,
  ) => {
    const chunks = [];
    let currentChunk = [];
    let currentHeight = 0;

    for (const s of services) {
      const descLength = s.description?.length || 0;
      const estimatedRowHeight =
        descLength < 100 ? 50 : descLength < 300 ? 100 : 200;

      if (currentHeight + estimatedRowHeight > maxHeightPerPage) {
        chunks.push(currentChunk);
        currentChunk = [];
        currentHeight = 0;
      }

      currentChunk.push(s);
      currentHeight += estimatedRowHeight;
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  };

  const HEADER_FOOTER_HEIGHT = 350;
  const PAGE_HEIGHT = 841.89;
  const MAX_TABLE_HEIGHT = PAGE_HEIGHT - HEADER_FOOTER_HEIGHT - 200;

  const serviceChunks = chunkServicesByHeight(invoiceData?.services || [], 199);

  const renderHeader = () => (
    <>
      <Image
        src={`${window.location.origin}/graphic.png`}
        style={styles.graphicTop}
      />
      <Image
        src={`${window.location.origin}/graphic-bottom.png`}
        style={styles.graphicBottom}
      />
      <View style={styles.container}>
        <Image
          src={`${window.location.origin}/long_logo_final.png`}
          style={styles.logo}
        />
      </View>

      <View style={styles.header}>
        <View style={styles.billTo}>
          <Text>
            Bill To:{' '}
            <Text style={styles.bold}>
              {invoiceData?.clientDetails?.name || invoiceData.billTo || 'N/A'}
            </Text>
          </Text>
          <Text>Date: {invoiceData.createdAt || 'N/A'}</Text>
          <Text>Invoice No: {invoiceData.id}</Text>
        </View>
        <View style={styles.billFrom}>
          <Text>
            1/1A, Vansittart row, Second Floor, Room No 6, Kolkata - 700001
          </Text>
          <Text>8017173320</Text>
          <Text>info@lawspicious.com</Text>
        </View>
      </View>
    </>
  );

  const renderServicesTable = (services: any[]) => (
    <View wrap>
      <View style={styles.thead}>
        <Text style={styles.smallCell}>Service Name</Text>
        <Text style={styles.largeCell}>Description</Text>
        <Text style={styles.smallCellLast}>Amount</Text>
      </View>
      {services.map((service, i) => (
        <View style={styles.tbody} key={i}>
          <Text style={styles.smallCell_tbody} wrap>
            {service?.name || 'N/A'}
          </Text>
          <Text style={styles.largeCell_tbody} wrap>
            {service?.description || 'N/A'}
          </Text>
          <Text style={styles.smallCellLast_tbody}>
            {service?.amount != null ? service.amount : 'N/A'}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderFooter = () => (
    <>
      <View style={{ ...styles.billTo, marginTop: '20px' }}>
        <Text>Name: Lawspicious</Text>
        <Text>Bank: HDFC Bank, Kolkata High Court Branch</Text>
        <Text>Acc no. 50200088284412</Text>
        <Text>IFSC-HDFC0006504</Text>
        <Text>PAN-AALFL0025D</Text>
        <Text>GSTIN: 19AALFL0025D1ZO</Text>
        <Text style={{ marginTop: '30px' }}>
          Reverse charge mechanism applicable on this Invoice
        </Text>
      </View>

      <View style={styles.signature}>
        <Image
          src={`${window.location.origin}/sign.jpg`}
          style={styles.signatureImage}
        />
        <Text>Abhradip Jha</Text>
      </View>

      <Text style={styles.footer}>Thank you for your business!</Text>
    </>
  );

  return (
    <Document>
      {serviceChunks.map((chunk, pageIndex) => (
        <Page size="A4" style={styles.page} key={pageIndex}>
          {renderHeader()}
          {renderServicesTable(chunk)}

          {pageIndex === serviceChunks.length - 1 && (
            <View style={styles.tbody}>
              <Text style={styles.largeCellTotal}>Total</Text>
              <Text style={styles.smallCellLast_tbody}>
                {invoiceData.totalAmount || 'N/A'}
              </Text>
            </View>
          )}

          {renderFooter()}
        </Page>
      ))}
    </Document>
  );
};

export default PDFfile;
