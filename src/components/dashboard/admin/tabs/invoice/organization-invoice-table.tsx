import { DialogButton } from '@/components/ui/alert-dialog';
import { useInvoice } from '@/hooks/useInvoiceHook';
import { IInvoice } from '@/types/invoice';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
} from '@chakra-ui/react';
import { MoreVertical } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLoading } from '@/context/loading/loadingContext';
import LoaderComponent from '@/components/ui/loader';
import PrintLawyerInvoiceButton from './action-button/print-lawyer-invoice-button';
import PrintLawspiciousInvoiceButton from './action-button/print-lawspicious-invoice-button';
import { useRouter } from 'next/navigation';
import withAuth from '@/components/shared/hoc-middlware';
import EditInvoiceModal from './action-button/edit-invoice-modal';
import { useTask } from '@/hooks/useTaskHooks';
import { ITask } from '@/types/task';

const OrganizationInvoiceTable = ({
  organizationInvoices,
}: {
  organizationInvoices: IInvoice[];
}) => {
  const { deleteInvoice } = useInvoice();
  const { loading, setLoading } = useLoading();
  const [filteredInvoices, setFilteredInvoices] = useState<IInvoice[]>([]);
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const { payableTasks, deleteTasks } = useTask();

  // useEffect(() => {
  //   const handleFetchInvoice = async () => {
  //     const data = await getPayableTask();
  //     setTaskInvoices(data as ITask[]);
  //   };

  //   handleFetchInvoice();
  // }, []);

  const filterInvoices = (status: string) => {
    if (status === 'ALL') {
      setFilteredInvoices(organizationInvoices);
    } else {
      setFilteredInvoices(
        organizationInvoices.filter(
          (invoice) => invoice.paymentStatus === status,
        ),
      );
    }
  };

  useEffect(() => {
    filterInvoices(selectedStatus);
  }, [organizationInvoices, selectedStatus]);

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
            setSelectedStatus(['ALL', 'paid', 'unpaid'][index])
          }
        >
          <TabList>
            <Tab>ALL</Tab>
            <Tab>Paid</Tab>
            <Tab>Unpaid</Tab>
            <Tab>Payable Task</Tab>
          </TabList>
          <TabPanels>
            {Array.from({ length: 3 }, (_, index) => (
              <TabPanel key={index}>
                {filteredInvoices?.length === 0 ? (
                  <div className="heading-primary flex h-[40vh] items-center justify-center text-center">
                    No Invoice Found!!
                  </div>
                ) : (
                  <Box overflowX={'auto'}>
                    <Table variant="striped" colorScheme="blackAlpha">
                      <TableCaption fontSize={'lg'} textAlign={'left'}>
                        {selectedStatus === 'ALL' ? (
                          <>
                            Total Amount : Rs.
                            {filteredInvoices.reduce(
                              (sum, invoice) => sum + invoice.totalAmount,
                              0,
                            )}
                          </>
                        ) : selectedStatus === 'paid' ? (
                          <>
                            Total Paid Amount : Rs.
                            {filteredInvoices
                              .filter(
                                (invoice) => invoice.paymentStatus === 'paid',
                              )
                              .reduce(
                                (sum, invoice) => sum + invoice.totalAmount,
                                0,
                              )}
                          </>
                        ) : selectedStatus === 'unpaid' ? (
                          <>
                            Total Unpaid Amount : Rs.
                            {filteredInvoices
                              .filter(
                                (invoice) => invoice.paymentStatus === 'unpaid',
                              )
                              .reduce(
                                (sum, invoice) => sum + invoice.totalAmount,
                                0,
                              )}
                          </>
                        ) : (
                          0
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
                          <Th>Team Member</Th>
                          <Th>Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredInvoices?.map((invoice, index) => (
                          <Tr key={invoice.id}>
                            <Td>{index + 1}</Td>
                            <Td>{invoice.id}</Td>
                            <Td>{invoice.createdAt}</Td>
                            <Td>{invoice.paymentDate || 'NA'}</Td>
                            <Td>{invoice.clientDetails?.name || 'NA'}</Td>
                            <Td>{invoice.totalAmount || 'NA'}</Td>
                            <Td>{invoice.paymentStatus}</Td>
                            {/* @ts-ignore */}
                            <Td>{invoice.teamMember?.name || 'NA'}</Td>
                            <Td>
                              <Menu>
                                <MenuButton
                                  as={IconButton}
                                  aria-label="Options"
                                  icon={<MoreVertical />}
                                  variant="outline"
                                />
                                <MenuList zIndex={50} maxWidth={100}>
                                  <MenuItem as={'div'}>
                                    <Button
                                      colorScheme="purple"
                                      className="w-full"
                                      onClick={() =>
                                        (window.location.href = `/invoice/${invoice.id}`)
                                      }
                                    >
                                      Go to Invoice
                                    </Button>
                                  </MenuItem>
                                  <MenuItem as={'div'}>
                                    <EditInvoiceModal invoiceData={invoice} />
                                  </MenuItem>
                                  <MenuItem as={'div'}>
                                    <DialogButton
                                      title={'Delete'}
                                      message={
                                        'Do you want to delete the invoice?'
                                      }
                                      onConfirm={async () =>
                                        deleteInvoice(invoice.id as string)
                                      }
                                      children={'Delete'}
                                      confirmButtonColorScheme="red"
                                      confirmButtonText="Delete"
                                    />
                                  </MenuItem>
                                  <MenuItem as={'div'}>
                                    <PrintLawyerInvoiceButton
                                      invoiceData={invoice}
                                    />
                                  </MenuItem>
                                  <MenuItem as={'div'}>
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
                  </Box>
                )}
              </TabPanel>
            ))}
            <TabPanel>
              {payableTasks.length == 0 ? (
                <div className="heading-primary flex items-center justify-center">
                  No Payable Task Present
                </div>
              ) : (
                <Box overflowX={'auto'}>
                  <Table variant="striped" colorScheme="blackAlpha">
                    <TableCaption fontSize={'lg'} textAlign={'left'}>
                      Total Payable Amount: Rs.
                      {payableTasks.reduce(
                        (sum, invoice) => sum + Number(invoice.amount ?? 0),
                        0,
                      )}{' '}
                    </TableCaption>

                    <Thead>
                      <Tr>
                        <Th>No</Th>
                        <Th>Task Name</Th>
                        <Th>Case No</Th>
                        <Th>Amount</Th>
                        <Th>Assigned To</Th>
                        <Th>End Date</Th>
                        {/* <Th>Action</Th> */}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {payableTasks.map((task, index) => (
                        <Tr key={task.id}>
                          <Td>{index + 1}</Td>
                          <Td>{task.taskName || 'NA'}</Td>
                          <Td>
                            {task.caseDetails.caseNo || task.taskType || 'NA'}
                          </Td>
                          <Td>{task.amount || 'NA'}</Td>
                          <Td>
                            {task.lawyerDetails.map((lawyer) => (
                              <>
                                {lawyer.name}
                                <br />
                              </>
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
                                <MenuItem as={'div'}>
                                  <DialogButton
                                    title={'Delete'}
                                    message={
                                      'Do you want to delete the invoice?'
                                    }
                                    onConfirm={async () =>
                                      deleteTasks(task.id as string)
                                    }
                                    children={'Delete'}
                                    confirmButtonColorScheme="red"
                                    confirmButtonText="Delete"
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

// Specify allowed roles for this page
const allowedRoles = ['SUPERADMIN', 'ADMIN']; // Add roles that should have access

export default withAuth(OrganizationInvoiceTable, allowedRoles);
