import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Table,
  Checkbox,
  Menu,
  Input,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Flex,
  TableCaption,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  MenuButton,
  IconButton,
  MenuList,
  MenuItem,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { MoreVertical } from 'lucide-react';
import { DialogButton } from '@/components/ui/alert-dialog';
import LoaderComponent from '@/components/ui/loader';
import { IInvoice } from '@/types/invoice';
import Pagination from '@/components/dashboard/shared/Pagination';
import EditInvoiceModal from './action-button/edit-invoice-modal';
import PrintLawyerInvoiceButton from './action-button/print-lawyer-invoice-button';
import PrintLawspiciousInvoiceButton from './action-button/print-lawspicious-invoice-button';
import { useInvoice } from '@/hooks/useInvoiceHook';
import withAuth from '@/components/shared/hoc-middlware';
import * as XLSX from 'xlsx';
import { useAuth } from '@/context/user/userContext';

const ClientInvoiceTable = ({
  clientInvoices,
}: {
  clientInvoices: IInvoice[];
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [searchClientName, setSearchClientName] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 10;
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(
    new Set(),
  );
  const { deleteInvoice, updateInvoice } = useInvoice();

  // const handleExportToExcel = () => {
  //   const wb = XLSX.utils.book_new();
  //   const ws = XLSX.utils.json_to_sheet(
  //     filteredData.map((invoice) => ({
  //       'Invoice No': invoice.id,
  //       Date: invoice.createdAt,
  //       'Payment Date': invoice.paymentDate || 'NA',
  //       'Client Name': invoice.clientDetails?.name || 'NA',
  //       Total: invoice.totalAmount,
  //       Status: invoice.paymentStatus,
  //     })),
  //   );

  //   XLSX.utils.book_append_sheet(wb, ws, 'Invoices');
  //   XLSX.writeFile(wb, 'client_invoices.xlsx');
  // };
  const handleExportToExcel = () => {
    const wb = XLSX.utils.book_new();

    const ws = XLSX.utils.json_to_sheet(
      filteredData.map((invoice) => ({
        'Invoice No': invoice.id,
        'Invoice Type': invoice.invoiceType || 'NA',
        'Created At': invoice.createdAt || 'NA',
        'Due Date': invoice.dueDate || 'NA',
        'Payment Date': invoice.paymentDate || 'NA',
        'Payment Status': invoice.paymentStatus || 'NA',
        'Total Amount': invoice.totalAmount || 0,
        'PAN No': invoice.panNo || 'NA',
        'GST Note': invoice.gstNote || 'NA',
        'Bill To': invoice.billTo || 'NA',

        // Client details
        'Client Name': invoice.clientDetails?.name || 'NA',
        'Client Email': invoice.clientDetails?.email || 'NA',
        'Client Mobile': invoice.clientDetails?.mobile || 'NA',
        'Client Location': invoice.clientDetails?.location || 'NA',

        // Services
        Services:
          invoice.services
            ?.map((s) => `${s.name} (${s.amount}) - ${s.description}`)
            .join(' | ') || 'NA',

        // RE Case IDs
        'Case IDs': invoice.RE?.map((r) => r.caseId || 'NA').join(', ') || 'NA',

        // Optional: Add more fields as needed
        'Team Member': invoice.teamMember || 'NA',
        'Rejection Remark': invoice.remark || 'NA',
      })),
    );

    XLSX.utils.book_append_sheet(wb, ws, 'Invoices');
    XLSX.writeFile(wb, 'client_invoices.xlsx');
  };

  const filteredData = useMemo(() => {
    let invoices = clientInvoices;

    if (selectedStatus !== 'ALL') {
      if (selectedStatus.toLowerCase() === 'abhradip jha') {
        invoices = invoices.filter(
          (invoice) => invoice.invoiceType?.toLowerCase() === 'abhradip',
        );
      } else if (selectedStatus.toLowerCase() === 'lawspicious') {
        invoices = invoices.filter(
          (invoice) => invoice.invoiceType?.toLowerCase() === 'lawspicious',
        );
      } else {
        invoices = invoices.filter(
          (invoice) => invoice.paymentStatus === selectedStatus,
        );
      }
    }

    if (searchClientName) {
      invoices = invoices.filter((invoice) =>
        invoice.clientDetails?.name
          ?.toLowerCase()
          .includes(searchClientName.toLowerCase()),
      );
    }

    return invoices;
  }, [clientInvoices, selectedStatus, searchClientName]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [selectedStatus, searchClientName]);

  useEffect(() => {
    if (clientInvoices.length > 0) {
      setLoading(false);
    }
  }, [clientInvoices]);

  const toggleInvoiceSelection = (id: string) => {
    setSelectedInvoices((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  };

  const toggleSelectAll = () => {
    if (selectedInvoices.size === paginatedData.length) {
      setSelectedInvoices(new Set());
    } else {
      setSelectedInvoices(new Set(paginatedData.map((invoice) => invoice.id!)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedInvoices.size > 0) {
      for (const id of Array.from(selectedInvoices)) {
        await deleteInvoice(id);
      }
      setSelectedInvoices(new Set());
    }
  };

  const handleBulkStatusUpdate = async (
    status: 'paid' | 'unpaid' | undefined,
  ) => {
    for (const id of Array.from(selectedInvoices)) {
      for (const invoice of clientInvoices) {
        if (invoice.id === id) {
          await updateInvoice(invoice.id as string, {
            paymentDate: new Date().toISOString().split('T')[0],
            paymentStatus: status,
          });
        }
      }
    }
    setSelectedInvoices(new Set());
  };

  return (
    <div>
      {loading ? (
        <LoaderComponent />
      ) : clientInvoices?.length === 0 ? (
        <div className="heading-primary flex h-screen items-center justify-center text-center">
          No invoice found!!
        </div>
      ) : (
        <>
          <Tabs
            onChange={(index) =>
              setSelectedStatus(
                [
                  'ALL',
                  'paid',
                  'unpaid',
                  'rejected',
                  'Abhradip Jha',
                  'Lawspicious',
                ][index],
              )
            }
          >
            <TabList overflowX={'auto'} overflowY={'hidden'}>
              <Tab>ALL</Tab>
              <Tab>Paid</Tab>
              <Tab>Unpaid</Tab>
              <Tab>Rejected</Tab>
              <Tab>Abhradip Jha</Tab>
              <Tab>Lawspicious</Tab>
            </TabList>
            <TabPanels>
              {['ALL', 'paid', 'unpaid', 'Abhradip Jha', 'Lawspicious'].map(
                (status, index) => (
                  <TabPanel key={index}>
                    <Flex mb={4} justify="space-between" align="center">
                      <Input
                        placeholder="Search by Client Name"
                        value={searchClientName}
                        onChange={(e) => setSearchClientName(e.target.value)}
                      />
                      <Button onClick={handleExportToExcel} colorScheme="green">
                        Export to Excel
                      </Button>
                    </Flex>
                    {selectedInvoices.size > 0 && (
                      <Flex mb={4} gap={2}>
                        <Button colorScheme="red" onClick={handleBulkDelete}>
                          Delete Selected
                        </Button>
                        <Button
                          colorScheme="blue"
                          onClick={() => handleBulkStatusUpdate('paid')}
                        >
                          Mark as Paid
                        </Button>
                        <Button
                          colorScheme="yellow"
                          onClick={() => handleBulkStatusUpdate('unpaid')}
                        >
                          Mark as Unpaid
                        </Button>
                      </Flex>
                    )}
                    {paginatedData.length === 0 ? (
                      <div className="heading-primary flex h-[40vh] items-center justify-center text-center">
                        No Invoice Found!!
                      </div>
                    ) : (
                      <Box overflowX="auto">
                        <Table variant="striped" colorScheme="blackAlpha">
                          <TableCaption fontSize={'lg'} textAlign={'left'}>
                            Total Amount: Rs.
                            {filteredData.reduce(
                              (sum, invoice) => sum + invoice.totalAmount,
                              0,
                            )}
                          </TableCaption>
                          <Thead>
                            <Tr>
                              <Th>
                                <Checkbox
                                  className="cursor-pointer border-gray-600"
                                  isChecked={
                                    selectedInvoices.size ===
                                    paginatedData.length
                                  }
                                  onChange={toggleSelectAll}
                                />
                              </Th>
                              <Th>No</Th>
                              <Th>Invoice No</Th>
                              <Th>Date</Th>
                              <Th>Payment Date</Th>
                              <Th>Client Name</Th>
                              <Th>Total</Th>
                              <Th>Status</Th>
                              <Th>Action</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {paginatedData.map((invoice, index) => (
                              <Tr key={invoice.id}>
                                <Td>
                                  <Checkbox
                                    className="cursor-pointer border-gray-600"
                                    isChecked={selectedInvoices.has(
                                      invoice.id!,
                                    )}
                                    onChange={() =>
                                      toggleInvoiceSelection(invoice.id!)
                                    }
                                  />
                                </Td>
                                <Td>
                                  {(currentPage - 1) * rowsPerPage + index + 1}
                                </Td>
                                <Td>{invoice.id}</Td>
                                <Td>{invoice.createdAt}</Td>
                                <Td>{invoice.paymentDate || 'NA'}</Td>
                                <Td>{invoice.clientDetails?.name || 'NA'}</Td>
                                <Td>{invoice.totalAmount}</Td>
                                <Td>{invoice.paymentStatus}</Td>
                                <Td>
                                  <TableInvoiceMenu invoice={invoice} />
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    )}
                    {filteredData.length > 0 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        pagesWithContent={Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        )}
                      />
                    )}
                  </TabPanel>
                ),
              )}
            </TabPanels>
          </Tabs>
        </>
      )}
    </div>
  );
};

const TableInvoiceMenu = ({ invoice }: { invoice: IInvoice }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { deleteInvoice } = useInvoice();
  const { role } = useAuth();

  return (
    <Menu isOpen={isOpen} onClose={onClose}>
      <MenuButton
        as={IconButton}
        aria-label="Options"
        icon={<MoreVertical />}
        variant="outline"
        onClick={onOpen}
      />
      <MenuList zIndex={50} maxWidth={100} overflowY={'auto'} maxHeight={300}>
        <MenuItem as="div">
          <Button
            colorScheme="purple"
            className="w-full"
            onClick={() => (window.location.href = `/invoice/${invoice.id}`)}
          >
            Go to Invoice
          </Button>
        </MenuItem>

        {invoice.paymentStatus === 'unpaid' && role === 'SUPERADMIN' && (
          <MenuItem>
            <Button
              w="100%"
              colorScheme="purple"
              onClick={() =>
                (window.location.href = `/dashboard/admin/edit-invoice/${invoice.id}`)
              }
            >
              Edit Invoice
            </Button>
          </MenuItem>
        )}

        {invoice.paymentStatus !== 'rejected' && (
          <MenuItem as="div">
            <EditInvoiceModal invoiceData={invoice} />
          </MenuItem>
        )}

        <MenuItem as="div">
          <DialogButton
            title={'Delete'}
            message={'Do you want to delete the invoice?'}
            onConfirm={async () => {
              if (invoice.id) {
                await deleteInvoice(invoice.id);
              }
            }}
            children={'Delete'}
            confirmButtonColorScheme="red"
          />
        </MenuItem>
        {invoice.paymentStatus !== 'rejected' &&
          (invoice.invoiceType === 'lawspicious' ? (
            <MenuItem as="div">
              <PrintLawspiciousInvoiceButton invoiceData={invoice} />
            </MenuItem>
          ) : (
            <MenuItem as="div">
              <PrintLawyerInvoiceButton invoiceData={invoice} />
            </MenuItem>
          ))}
      </MenuList>
    </Menu>
  );
};

const allowedRoles = ['SUPERADMIN'];

export default withAuth(ClientInvoiceTable, allowedRoles);
