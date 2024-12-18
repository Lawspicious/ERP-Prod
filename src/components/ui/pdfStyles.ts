import { Font, StyleSheet } from '@react-pdf/renderer';
import { relative } from 'path';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    //   fontFamily: 'cabin',
    fontSize: 12,
    position: 'relative',
  },
  bold: {
    fontWeight: 800,
  },
  graphicTop: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 200,
  },
  graphicBottom: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 200,
  },
  container: {
    width: '100%',
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 'auto',
    marginBottom: 10,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
  billTo: {
    flex: 1,
    gap: 4,
  },
  billFrom: {
    flex: 1,
    textAlign: 'right',
    gap: 4,
    paddingTop: 8,
  },
  thead: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tbody: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  largeCell: {
    width: '50%',
    border: '1px solid black',
    borderRight: 0,
    textAlign: 'center',
    fontSize: '12px',
    padding: '8px',
  },
  smallCell: {
    width: '25%',
    border: '1px solid black',
    borderRight: 0,
    textAlign: 'center',
    fontSize: '12px',
    padding: '8px',
  },
  smallCellLast: {
    width: '25%',
    border: '1px solid black',
    textAlign: 'center',
    fontSize: '12px',
    padding: '8px',
  },
  smallCellLast_tbody: {
    width: '25%',
    border: '1px solid black',
    borderTop: 0,
    textAlign: 'center',
    fontSize: '12px',
    padding: '8px',
  },
  largeCell_tbody: {
    width: '50%',
    border: '1px solid black',
    borderRight: 0,
    borderTop: 0,
    fontSize: '12px',
    padding: '8px',
  },
  smallCell_tbody: {
    width: '25%',
    border: '1px solid black',
    borderRight: 0,
    borderTop: 0,
    textAlign: 'center',
    fontSize: '12px',
    padding: '8px',
  },
  table: {
    marginBottom: '20px',
  },
  largeCellTotal: {
    width: '75%',
    border: '1px solid black',
    borderRight: 0,
    textAlign: 'center',
    borderTop: 0,
    fontSize: '12px',
    padding: '8px',
  },
  footer: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 10,
  },
  signature: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    flexDirection: 'column',
    textAlign: 'right',
    marginTop: 20,
  },
  signatureImage: {
    width: 100,
    height: 'auto',
    marginBottom: 5,
  },
});

export default styles;
