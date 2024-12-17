import { DialogButton } from '@/components/ui/alert-dialog';
import LoaderComponent from '@/components/ui/loader';
import { useLoading } from '@/context/loading/loadingContext';
import { IInvoice } from '@/types/invoice';
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
import { useEffect, useState } from 'react';
import EditInvoiceModal from './action-button/edit-invoice-modal';
import PrintLawyerInvoiceButton from './action-button/print-lawyer-invoice-button';
import { useInvoice } from '@/hooks/useInvoiceHook';
import withAuth from '@/components/shared/hoc-middlware';
import PrintLawspiciousInvoiceButton from './action-button/print-lawspicious-invoice-button';
import { useRouter } from 'next/navigation';

const ClientInvoiceTable = ({
  clientInvoices,
}: {
  clientInvoices: IInvoice[];
}) => {
  const { loading, setLoading } = useLoading();
  const [filteredInvoices, setFilteredInvoices] = useState<IInvoice[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchClientName, setSearchClientName] = useState<string>('');
  const router = useRouter();

  const filterInvoices = (status: string, searchName: string) => {
    try {
      setLoading(true);
      let invoices = clientInvoices;

      if (status !== 'ALL') {
        invoices = invoices.filter(
          (invoice) => invoice.paymentStatus === status,
        );
      }

      if (searchName) {
        invoices = invoices.filter((invoice) =>
          invoice.clientDetails?.name
            ?.toLowerCase()
            .includes(searchName.toLowerCase()),
        );
      }
      setFilteredInvoices(invoices);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterInvoices(selectedStatus, searchClientName);
  }, [router, clientInvoices, selectedStatus, searchClientName]);

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
              setSelectedStatus(['ALL', 'paid', 'unpaid'][index])
            }
          >
            <TabList overflowX={'auto'} overflowY={'hidden'}>
              <Tab>ALL</Tab>
              <Tab>Paid</Tab>
              <Tab>Unpaid</Tab>
            </TabList>
            <TabPanels>
              {['ALL', 'paid', 'unpaid'].map((status, index) => (
                <TabPanel key={index}>
                  <Flex mb={4} justify="space-between" align="center">
                    <Input
                      placeholder="Search by Client Name"
                      value={searchClientName}
                      onChange={(e) => setSearchClientName(e.target.value)}
                    />
                  </Flex>
                  {filteredInvoices?.length === 0 ? (
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
                              {filteredInvoices.reduce(
                                (sum, invoice) => sum + invoice.totalAmount,
                                0,
                              )}
                            </>
                          ) : status === 'paid' ? (
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
                          ) : status === 'unpaid' ? (
                            <>
                              Total Unpaid Amount : Rs.
                              {filteredInvoices
                                .filter(
                                  (invoice) =>
                                    invoice.paymentStatus === 'unpaid',
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
                            <Th>Action</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {filteredInvoices?.map((invoice, index) => (
                            <Tr key={invoice.id}>
                              <Td>{index + 1}</Td>
                              <Td>{invoice.id}</Td>
                              <Td>{invoice.createdAt}</Td>
                              <Td>{invoice?.paymentDate || 'NA'}</Td>
                              <Td>{invoice.clientDetails?.name || 'NA'}</Td>
                              <Td>{invoice?.totalAmount}</Td>
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
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </>
      )}
    </div>
  );
};

const TableInvoiceMenu = ({ invoice }: { invoice: IInvoice }) => {
  const [selectedItem, setSelectedItem] = useState<null | IInvoice>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { deleteInvoice } = useInvoice();

  const handleOpen = () => {
    setSelectedItem(invoice); // Set the selected invoice when the menu opens
    onOpen(); // Open the menu
  };
  const handleClose = () => {
    setSelectedItem(null);
    onClose();
  };

  return (
    <Menu isOpen={isOpen} onClose={handleClose}>
      <MenuButton
        as={IconButton}
        aria-label="Options"
        icon={<MoreVertical />}
        variant="outline"
        onClick={handleOpen}
      />
      <MenuList zIndex={50} maxWidth={100} overflowY={'auto'} maxHeight={300}>
        <MenuItem as={'div'}>
          <Button
            colorScheme="purple"
            className="w-full"
            onClick={() => (window.location.href = `/invoice/${invoice.id}`)}
          >
            Go to Invoice
          </Button>
        </MenuItem>
        <MenuItem as={'div'}>
          <EditInvoiceModal invoiceData={invoice} />
        </MenuItem>
        <MenuItem as={'div'}>
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
        <MenuItem as={'div'}>
          <DialogButton
            title={'Delete'}
            message={'Do you want to delete the invoice?'}
            onConfirm={async () => deleteInvoice(invoice.id as string)}
            children={'Delete'}
            confirmButtonColorScheme="red"
            confirmButtonText="Delete"
          />
        </MenuItem>
        <MenuItem as={'div'}>
          {selectedItem && isOpen && (
            <PrintLawyerInvoiceButton invoiceData={selectedItem as IInvoice} />
          )}
        </MenuItem>
        <MenuItem as={'div'}>
          <PrintLawspiciousInvoiceButton
            invoiceData={selectedItem as IInvoice}
          />
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
const allowedRoles = ['SUPERADMIN'];

export default withAuth(ClientInvoiceTable, allowedRoles);
