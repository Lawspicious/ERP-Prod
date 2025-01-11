import React from 'react';
import { Page, Text, Document, View, Image } from '@react-pdf/renderer';
import styles from './pdfStyles';
import converter from 'number-to-words';
import { IInvoice, IService } from '@/types/invoice';

const PDFfile = ({ invoiceData }: { invoiceData: IInvoice }) => {
  const invoiceId = invoiceData.id;
  const date = new Date();

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let currentDate = `${day}/${month}/${year}`;

  const chunkServices = (services: IInvoice['services'], chunkSize: number) => {
    const chunks: (typeof services)[] = [];
    for (let i = 0; i < services.length; i += chunkSize) {
      chunks.push(services.slice(i, i + chunkSize));
    }
    return chunks;
  };

  // Adjust this based on the number of rows that fit on a single page
  const SERVICES_PER_PAGE = 5;
  const serviceChunks = chunkServices(
    invoiceData?.services || [],
    SERVICES_PER_PAGE,
  );

  try {
    // Validate all required fields
    if (!invoiceData || !invoiceData.id) {
      console.error('Invalid invoice data');
      return null;
    }

    return (
      <Document>
        {serviceChunks.map((services, pageIndex) => (
          <Page size="A4" style={styles.page} key={pageIndex}>
            {/* Logo */}
            <Image src="/graphic.png" style={styles.graphicTop} />
            <Image src="/graphic-bottom.png" style={styles.graphicBottom} />
            <View style={styles.container}>
              {/* <Image src="/long_logo_final.png" style={styles.logo} /> */}
            </View>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.billTo}>
                <Text>
                  Bill To:{' '}
                  <Text style={styles.bold}>
                    {invoiceData?.clientDetails?.name || invoiceData.billTo}
                  </Text>
                </Text>
                <Text>Date: {invoiceData.createdAt}</Text>
                <Text>Invoice No: {invoiceData.id}</Text>
              </View>
              <View style={styles.billFrom}>
                <Text>Abhradip Jha</Text>
                <Text>Advocate</Text>
                <Text>High Court, Calcutta</Text>
                <Text>1/1A, Vansittart Row, Kolkata 700001</Text>
                <Text>8017173320</Text>
                <Text> jhaabhradip7@gmail.com</Text>
              </View>
            </View>

            <View style={styles.table}>
              <View style={styles.thead}>
                <Text style={styles.smallCell}>Service Name</Text>
                <Text style={styles.largeCell}>Description</Text>
                <Text style={styles.smallCellLast}>Amount</Text>
              </View>
              {services.map((service, i) => (
                <View style={styles.tbody} key={i}>
                  <Text style={styles.smallCell_tbody}>{service.name}</Text>
                  <Text style={styles.largeCell_tbody}>
                    {service.description}
                  </Text>
                  <Text style={styles.smallCellLast_tbody}>
                    {service.amount}
                  </Text>
                </View>
              ))}
              {serviceChunks.length - 1 === pageIndex && (
                <View style={styles.tbody}>
                  <Text style={styles.largeCellTotal}>Total</Text>
                  <Text style={styles.smallCellLast_tbody}>
                    {invoiceData.totalAmount}
                  </Text>
                </View>
              )}
            </View>

            {/* Payment Details */}
            <View style={styles.billTo}>
              {invoiceData.billTo === 'client' && (
                <Text>Pay To: Abhradip Jha</Text>
              )}
              <Text> State Bank of India(Siriti - Muchipara Branch)</Text>
              <Text>Acc no. 33140676926</Text>
              <Text>IFSC: SBIN0011533</Text>
              <Text>PAN-AYBPJ1201F</Text>
              <Text style={{ marginTop: '30px' }}>
                Reverse charge mechanism applicable on this Invoice
              </Text>
            </View>

            {/* Signature */}
            <View style={styles.signature}>
              <Image src="/sign.jpg" style={styles.signatureImage} />
              <Text>Abhradip Jha</Text>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>Thank you for your business!</Text>
          </Page>
        ))}
      </Document>
    );
  } catch (error) {
    console.error('PDF Generation Critical Error:', error);
    return null;
  }
};

export default PDFfile;
