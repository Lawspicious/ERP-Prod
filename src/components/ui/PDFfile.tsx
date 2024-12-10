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

  try {
    // Validate all required fields
    if (!invoiceData || !invoiceData.id) {
      console.error('Invalid invoice data');
      return null;
    }

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Logo */}
          <Image src="/graphic.png" style={styles.graphicTop} />
          <Image src="/graphic-bottom.png" style={styles.graphicBottom} />
          <View style={styles.container}>
            <Image src="/long_logo_final.png" style={styles.logo} />
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
              <Text>
                8017173320
                {invoiceData.billTo === 'organization'
                  ? 'info@lawspicious.com'
                  : 'jhaabhradip7@gmail.com'}
              </Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.thead}>
              <Text style={styles.smallCell}>Service Name</Text>
              <Text style={styles.largeCell}>Description</Text>
              <Text style={styles.smallCellLast}>Amount</Text>
            </View>
            {invoiceData.services.map((service, i) => (
              <View style={styles.tbody} key={i}>
                <Text style={styles.smallCell_tbody}>{service.name}</Text>
                <Text style={styles.largeCell_tbody}>
                  {service.description}
                </Text>
                <Text style={styles.smallCellLast_tbody}>{service.amount}</Text>
              </View>
            ))}
            <View style={styles.tbody}>
              <Text style={styles.largeCellTotal}>Total</Text>
              <Text style={styles.smallCellLast_tbody}>
                {invoiceData.totalAmount}
              </Text>
            </View>
          </View>

          {/* Payment Details */}
          <View style={styles.billTo}>
            {invoiceData.billTo === 'client' && (
              <Text>Pay To: Abhradip Jha</Text>
            )}
            <Text>
              {' '}
              {invoiceData.billTo === 'organization'
                ? 'Bank: HDFC Bank, Kolkata High Court Branch'
                : 'State Bank of India (Siriti- Muchipara Branch)'}
            </Text>
            <Text>
              Acc no.{' '}
              {invoiceData.billTo === 'organization'
                ? '5020008284412'
                : '33140676926'}
            </Text>
            <Text>
              IFSC-{' '}
              {invoiceData.billTo === 'organization'
                ? 'HDFC0006504'
                : 'SBIN0011533'}
            </Text>
            <Text>
              PAN-
              {invoiceData.billTo === 'organization'
                ? 'AALFL0025D'
                : 'AYBPJ1201F'}
            </Text>
            {invoiceData.billTo === 'organization' && 'GSTIN: 19AALFL0025D1ZO'}
            <Text></Text>
          </View>
          {/* Signature */}
          <View style={styles.signature}>
            <Image src="/sign.jpg" style={styles.signatureImage} />
            <Text>Abhradip Jha</Text>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>Thank you for your business!</Text>
        </Page>
      </Document>
    );
  } catch (error) {
    console.error('PDF Generation Critical Error:', error);
    return null;
  }
};

export default PDFfile;
