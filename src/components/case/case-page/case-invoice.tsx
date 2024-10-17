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
} from '@chakra-ui/react';
import { ArrowDown, ArrowUp, MoreVertical } from 'lucide-react';
import { useLoading } from '@/context/loading/loadingContext';
import { useEffect, useState } from 'react';
import PrintLawyerInvoiceButton from '@/components/dashboard/admin/tabs/invoice/action-button/print-lawyer-invoice-button';
import PrintLawspiciousInvoiceButton from '@/components/dashboard/admin/tabs/invoice/action-button/print-lawspicious-invoice-button';
import { useAuth } from '@/context/user/userContext';

const CaseInvoiceTable = ({ caseId }: { caseId: string }) => {
  const { deleteInvoice, getInvoiceByCaseId } = useInvoice();
  const [invoiceList, setInvoiceList] = useState<IInvoice[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { loading, setLoading } = useLoading();
  const { role } = useAuth();

  useEffect(() => {
    const handleFetch = async () => {
      const _invoiceList = await getInvoiceByCaseId(caseId);
      setInvoiceList(_invoiceList as IInvoice[]);
      setLoading(false);
    };
    handleFetch();
  }, []);

  const handleSortByClientName = () => {
    const sortedInvoices = [...invoiceList].sort((a, b) => {
      const nameA = a.clientDetails.name.toLowerCase();
      const nameB = b.clientDetails.name.toLowerCase();
      if (nameA < nameB) return sortOrder === 'asc' ? -1 : 1;
      if (nameA > nameB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    setInvoiceList(sortedInvoices);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <Box overflowX={'auto'}>
      <Table variant="striped" colorScheme="blackAlpha">
        <Thead>
          <Tr>
            <Th>No</Th>
            <Th>Invoice No</Th>
            <Th>Date</Th>
            <Th
              className="flex items-center"
              onClick={handleSortByClientName}
              cursor="pointer"
            >
              Client Name {sortOrder === 'asc' ? <ArrowUp /> : <ArrowDown />}
            </Th>
            <Th>Total</Th>
            <Th>Status</Th>
            <Th>Team Member</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {invoiceList.map((invoice, index) => (
            <Tr key={invoice.id}>
              <Td>{index + 1}</Td>
              <Td>{invoice.id}</Td>
              <Td>{invoice.createdAt}</Td>
              <Td>{invoice.clientDetails.name}</Td>
              <Td>{invoice.totalAmount}</Td>
              <Td>{invoice.paymentStatus}</Td>
              <Td>
                {invoice.teamMember
                  ? Object.keys(invoice.teamMember).length === 0
                    ? 'NA'
                    : invoice.teamMember?.name
                  : 'NA'}
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
                    {(role === 'ADMIN' || 'SUPERADMIN') && (
                      <MenuItem as={'div'}>
                        <DialogButton
                          title={'Delete'}
                          message={'Do you want to delete the invoice?'}
                          onConfirm={async () =>
                            deleteInvoice(invoice.id as string)
                          }
                          children={'Delete'}
                          confirmButtonColorScheme="red"
                          confirmButtonText="Delete"
                        />
                      </MenuItem>
                    )}
                    <MenuItem as={'div'}>
                      <PrintLawyerInvoiceButton invoiceData={invoice} />
                    </MenuItem>
                    <MenuItem as={'div'}>
                      <PrintLawspiciousInvoiceButton invoiceData={invoice} />
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default CaseInvoiceTable;
