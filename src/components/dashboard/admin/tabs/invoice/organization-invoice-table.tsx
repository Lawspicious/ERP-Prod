import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  TableCaption,
  Input,
  Flex,
} from '@chakra-ui/react';
import { MoreVertical } from 'lucide-react';
import { DialogButton } from '@/components/ui/alert-dialog';
import { useInvoice } from '@/hooks/useInvoiceHook';
import { useTask } from '@/hooks/useTaskHooks';
import { useLoading } from '@/context/loading/loadingContext';
import LoaderComponent from '@/components/ui/loader';
import Pagination from '@/components/dashboard/shared/Pagination';
import PrintLawyerInvoiceButton from './action-button/print-lawyer-invoice-button';
import PrintLawspiciousInvoiceButton from './action-button/print-lawspicious-invoice-button';
import EditInvoiceModal from './action-button/edit-invoice-modal';
import withAuth from '@/components/shared/hoc-middlware';
import { IInvoice } from '@/types/invoice';
import * as XLSX from 'xlsx';
import { useAuth } from '@/context/user/userContext';

const OrganizationInvoiceTable = ({
  organizationInvoices,
}: {
  organizationInvoices: IInvoice[];
}) => {
  const { deleteInvoice, updateInvoice } = useInvoice();
  const { payableTasks, deleteTasks } = useTask();
  const { loading } = useLoading();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(
    new Set(),
  );
  const rowsPerPage = 10;

  const { role } = useAuth();

  const handleExportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(
      filteredData.map((invoice) => ({
        'Invoice No': invoice.id,
        Date: invoice.createdAt,
        'Payment Date': invoice.paymentDate || 'NA',
        'Client Name': invoice.clientDetails?.name || 'NA',
        Total: invoice.totalAmount,
        Status: invoice.paymentStatus,
      })),
    );

    XLSX.utils.book_append_sheet(wb, ws, 'Invoices');
    XLSX.writeFile(wb, 'org_invoices.xlsx');
  };

  // Filter invoices based on selected status and search query
  const filteredData = useMemo(() => {
    let result = organizationInvoices;

    if (selectedStatus !== 'ALL') {
      if (selectedStatus.toLowerCase() === 'abhradip jha') {
        result = result.filter(
          (invoice) => invoice.invoiceType?.toLowerCase() === 'abhradip',
        );
      } else if (selectedStatus.toLowerCase() === 'lawspicious') {
        result = result.filter(
          (invoice) => invoice.invoiceType?.toLowerCase() === 'lawspicious',
        );
      } else {
        result = result.filter(
          (invoice) =>
            invoice.paymentStatus?.toLowerCase() ===
            selectedStatus.toLowerCase(),
        );
      }
    }

    if (searchQuery) {
      result = result.filter(
        (invoice) =>
          invoice.clientDetails?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          invoice.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          invoice.teamMember?.some((member) =>
            member.name?.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    return result;
  }, [organizationInvoices, selectedStatus, searchQuery]);

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredData]);

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
    for (const id of Array.from(selectedInvoices)) {
      await deleteInvoice(id);
    }
    setSelectedInvoices(new Set());
  };

  const handleBulkStatusUpdate = async (
    status: 'paid' | 'unpaid' | undefined,
  ) => {
    for (const id of Array.from(selectedInvoices)) {
      for (const invoice of organizationInvoices) {
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
      ) : organizationInvoices.length === 0 ? (
        <div className="heading-primary flex h-screen items-center justify-center text-center">
          No invoice found!!
        </div>
      ) : (
        <Tabs
          onChange={(index) =>
            setSelectedStatus(
              [
                'ALL',
                'paid',
                'unpaid',
                'Abhradip Jha',
                'Lawspicious',
                'Payable Task',
              ][index],
            )
          }
        >
          <TabList>
            <Tab>ALL</Tab>
            <Tab>Paid</Tab>
            <Tab>Unpaid</Tab>
            <Tab>Abhradip Jha</Tab>
            <Tab>Lawspicious</Tab>
            <Tab>Payable Task</Tab>
          </TabList>
          <TabPanels>
            {['ALL', 'paid', 'unpaid', 'Abhradip Jha', 'Lawspicious'].map(
              (status, index) => (
                <TabPanel key={index}>
                  <Flex mb={4} justify="space-between" align="center">
                    <Input
                      placeholder="Search by Client Name or Invoice No."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button onClick={handleExportToExcel} colorScheme="green">
                      Export to Excel
                    </Button>
                  </Flex>
                  {selectedInvoices.size > 0 && role === 'SUPERADMIN' && (
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
                        <TableCaption fontSize="lg" textAlign="left">
                          Total Amount : Rs.
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
                                  selectedInvoices.size === paginatedData.length
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
                            <Th>Team Member</Th>
                            <Th>Action</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {paginatedData.map((invoice, index) => (
                            <Tr key={invoice.id}>
                              <Td>
                                <Checkbox
                                  className="cursor-pointer border-gray-600"
                                  isChecked={selectedInvoices.has(invoice.id!)}
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
                              <Td>{invoice.totalAmount || 'NA'}</Td>
                              <Td>{invoice.paymentStatus}</Td>
                              <Td>
                                {invoice?.teamMember?.map((member) => (
                                  <div key={member.id}>{member.name}</div>
                                )) || 'NA'}
                              </Td>
                              <Td>
                                <Menu>
                                  <MenuButton
                                    as={IconButton}
                                    aria-label="Options"
                                    icon={<MoreVertical />}
                                    variant="outline"
                                  />
                                  <MenuList zIndex={50} maxWidth={100}>
                                    <MenuItem>
                                      <Button
                                        colorScheme="purple"
                                        onClick={() =>
                                          (window.location.href = `/invoice/${invoice.id}`)
                                        }
                                      >
                                        Go to Invoice
                                      </Button>
                                    </MenuItem>
                                    {role === 'SUPERADMIN' ? (
                                      <>
                                        <MenuItem>
                                          <EditInvoiceModal
                                            invoiceData={invoice}
                                          />
                                        </MenuItem>
                                        <MenuItem>
                                          <DialogButton
                                            title="Delete"
                                            message="Do you want to delete the invoice?"
                                            onConfirm={async () =>
                                              deleteInvoice(
                                                invoice.id as string,
                                              )
                                            }
                                            confirmButtonColorScheme="red"
                                            children="Delete"
                                          />
                                        </MenuItem>
                                      </>
                                    ) : null}

                                    <MenuItem>
                                      <PrintLawyerInvoiceButton
                                        invoiceData={invoice}
                                      />
                                    </MenuItem>
                                    <MenuItem>
                                      <PrintLawspiciousInvoiceButton
                                        invoiceData={invoice}
                                      />
                                    </MenuItem>
                                  </MenuList>
                                </Menu>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => {
                          if (page >= 1 && page <= totalPages) {
                            setCurrentPage(page);
                          }
                        }}
                        pagesWithContent={Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        )}
                      />
                    </Box>
                  )}
                </TabPanel>
              ),
            )}
            <TabPanel>
              {payableTasks.length === 0 ? (
                <div className="heading-primary flex items-center justify-center">
                  No Payable Task Present
                </div>
              ) : (
                <Box overflowX="auto">
                  <Table variant="striped" colorScheme="blackAlpha">
                    <TableCaption fontSize="lg" textAlign="left">
                      Total Payable Amount: Rs.
                      {payableTasks.reduce(
                        (sum, task) => sum + Number(task.amount ?? 0),
                        0,
                      )}
                    </TableCaption>
                    <Thead>
                      <Tr>
                        <Th>No</Th>
                        <Th>Task Name</Th>
                        <Th>Case No / Related To</Th>
                        <Th>Amount</Th>
                        <Th>Assigned To</Th>
                        <Th>End Date</Th>
                        <Th>Action</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {payableTasks.map((task, index) => (
                        <Tr key={task.id}>
                          <Td>{index + 1}</Td>
                          <Td>{task.taskName || 'NA'}</Td>
                          <Td>
                            {task.caseDetails?.caseNo || task.taskType || 'NA'}
                          </Td>
                          <Td>{task.amount || 'NA'}</Td>
                          <Td>
                            {task.lawyerDetails.map((lawyer) => (
                              <div key={lawyer.id}>{lawyer.name}</div>
                            ))}
                          </Td>
                          <Td>{task.endDate || 'NA'}</Td>
                          <Td>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                aria-label="Options"
                                icon={<MoreVertical />}
                                variant="outline"
                              />
                              <MenuList zIndex={50} maxWidth={100}>
                                <MenuItem>
                                  <DialogButton
                                    title="Delete"
                                    message="Do you want to delete the task?"
                                    onConfirm={async () =>
                                      deleteTasks(
                                        task.id as string,
                                        task.taskName,
                                      )
                                    }
                                    confirmButtonColorScheme="red"
                                    children="Delete"
                                  />
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </div>
  );
};

const allowedRoles = ['SUPERADMIN', 'ADMIN'];

export default withAuth(OrganizationInvoiceTable, allowedRoles);
