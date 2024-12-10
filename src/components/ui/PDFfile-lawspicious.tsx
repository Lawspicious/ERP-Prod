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
              <Text>
                1/1A, Vansittart row, Second Floor, Room No 6, Kolkata - 700001
              </Text>
              <Text>8017173320</Text>
              <Text>info@lawspicious.com</Text>
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
            <Text>Name: Lawspicious</Text>
            <Text>Bank: HDFC Bank, Kolkata High Court Branch</Text>
            <Text>Acc no. 5020008284412</Text>
            <Text>IFSC-HDFC0006504</Text>
            <Text>PAN-AALFL0025D</Text>
            <Text>GSTIN: 19AALFL0025D1ZO</Text>
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
