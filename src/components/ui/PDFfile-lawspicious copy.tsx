import React from 'react';
import { Page, Text, Document, View, Image } from '@react-pdf/renderer';
import styles from './pdfStyles';
import { IInvoice } from '@/types/invoice';

const PDFfile = ({ invoiceData }: { invoiceData: IInvoice }) => {
  console.log(invoiceData);

  if (!invoiceData || !invoiceData.id) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Invalid invoice data</Text>
        </Page>
      </Document>
    );
  }

  const SERVICES_PER_PAGE = 4;

  const chunkServices = (services: IInvoice['services'], chunkSize: number) => {
    const chunks: (typeof services)[] = [];
    for (let i = 0; i < services?.length; i += chunkSize) {
      chunks.push(services.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const serviceChunks = chunkServices(
    invoiceData?.services || [],
    SERVICES_PER_PAGE,
  );

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
          <Text style={styles.smallCell_tbody}>{service?.name || 'N/A'}</Text>
          <Text style={styles.largeCell_tbody}>
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
      {/* Page 1 */}
      <Page size="A4" style={styles.page}>
        {renderHeader()}
        {renderServicesTable(serviceChunks[0] || [])}

        {serviceChunks.length === 1 && (
          <>
            {/* Total on single-page invoice */}
            <View style={styles.tbody}>
              <Text style={styles.largeCellTotal}>Total</Text>
              <Text style={styles.smallCellLast_tbody}>
                {invoiceData.totalAmount || 'N/A'}
              </Text>
            </View>
          </>
        )}
        {renderFooter()}
      </Page>

      {/* Extra pages if services exceed page 1 */}
      {serviceChunks.slice(1).map((services, pageIndex) => (
        <Page size="A4" style={styles.page} key={pageIndex + 1}>
          {renderHeader()}
          {renderServicesTable(services)}

          {/* Only show total on the last page */}
          {pageIndex === serviceChunks.length - 2 && (
            <View style={styles.tbody}>
              <Text style={styles.largeCellTotal}>Total</Text>
              <Text style={styles.smallCellLast_tbody}>
                {invoiceData.totalAmount || 'N/A'}
              </Text>
            </View>
          )}

          {/* Render footer only on last page */}
          {pageIndex === serviceChunks.length - 2 && renderFooter()}
        </Page>
      ))}
    </Document>
  );
};

export default PDFfile;
