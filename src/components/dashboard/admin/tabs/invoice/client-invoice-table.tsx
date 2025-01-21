import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Table,
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
import { useLoading } from '@/context/loading/loadingContext';
import { IInvoice } from '@/types/invoice';
import Pagination from '@/components/dashboard/shared/Pagination';
import EditInvoiceModal from './action-button/edit-invoice-modal';
import PrintLawyerInvoiceButton from './action-button/print-lawyer-invoice-button';
import PrintLawspiciousInvoiceButton from './action-button/print-lawspicious-invoice-button';
import { useInvoice } from '@/hooks/useInvoiceHook';
import withAuth from '@/components/shared/hoc-middlware';

const ClientInvoiceTable = ({
  clientInvoices,
}: {
  clientInvoices: IInvoice[];
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [searchClientName, setSearchClientName] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 10;

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
    if (clientInvoices.length === 0) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [clientInvoices]);

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
                ['ALL', 'paid', 'unpaid', 'Abhradip Jha', 'Lawspicious'][index],
              )
            }
          >
            <TabList overflowX={'auto'} overflowY={'hidden'}>
              <Tab>ALL</Tab>
              <Tab>Paid</Tab>
              <Tab>Unpaid</Tab>
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
                    </Flex>
                    {paginatedData.length === 0 ? (
                      <div className="heading-primary flex h-[40vh] items-center justify-center text-center">
                        No Invoice Found!!
                      </div>
                    ) : (
                      <Box overflowX="auto">
                        <Table variant="striped" colorScheme="blackAlpha">
                          <TableCaption fontSize={'lg'} textAlign={'left'}>
                            {status === 'ALL' ? (
                              <>
                                Total Amount : Rs.
                                {filteredData.reduce(
                                  (sum, invoice) => sum + invoice.totalAmount,
                                  0,
                                )}
                              </>
                            ) : status === 'paid' ? (
                              <>
                                Total Paid Amount : Rs.
                                {filteredData
                                  .filter(
                                    (invoice) =>
                                      invoice.paymentStatus === 'paid',
                                  )
                                  .reduce(
                                    (sum, invoice) => sum + invoice.totalAmount,
                                    0,
                                  )}
                              </>
                            ) : status === 'unpaid' ? (
                              <>
                                Total Unpaid Amount : Rs.
                                {filteredData
                                  .filter(
                                    (invoice) =>
                                      invoice.paymentStatus === 'unpaid',
                                  )
                                  .reduce(
                                    (sum, invoice) => sum + invoice.totalAmount,
                                    0,
                                  )}
                              </>
                            ) : status === 'Abhradip Jha' ? (
                              <>
                                Total Amount : Rs.
                                {filteredData
                                  .filter(
                                    (invoice) =>
                                      invoice.invoiceType === 'abhradip',
                                  )
                                  .reduce(
                                    (sum, invoice) => sum + invoice.totalAmount,
                                    0,
                                  )}
                              </>
                            ) : (
                              <>
                                Total Amount : Rs.
                                {filteredData
                                  .filter(
                                    (invoice) =>
                                      invoice.invoiceType === 'lawspicious',
                                  )
                                  .reduce(
                                    (sum, invoice) => sum + invoice.totalAmount,
                                    0,
                                  )}
                              </>
                            )}
                          </TableCaption>
                          <Thead>
                            <Tr>
                              <Th>No</Th>
                              <Th>Invoice No</Th>
                              <Th>Date</Th>
                              <Th>Payment Date </Th>
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
        <MenuItem as="div">
          <EditInvoiceModal invoiceData={invoice} />
        </MenuItem>
        <MenuItem as="div">
          <Button
            colorScheme="purple"
            className="w-full"
            onClick={() =>
              window.open(
                `/dashboard/admin/duplicate-invoice/${invoice.id}`,
                '_blank',
              )
            }
          >
            Duplicate
          </Button>
        </MenuItem>
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
        {invoice.invoiceType === 'lawspicious' ? (
          <MenuItem as="div">
            <PrintLawspiciousInvoiceButton invoiceData={invoice} />
          </MenuItem>
        ) : (
          <MenuItem as="div">
            <PrintLawyerInvoiceButton invoiceData={invoice} />
          </MenuItem>
        )}
      </MenuList>
    </Menu>
  );
};

const allowedRoles = ['SUPERADMIN'];

export default withAuth(ClientInvoiceTable, allowedRoles);
