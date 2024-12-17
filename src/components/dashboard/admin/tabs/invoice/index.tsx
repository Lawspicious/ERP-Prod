// components/tabs/InvoiceTab.tsx
import { Button, Input } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import TabLayout from '../tab-layout';
import { useInvoice } from '@/hooks/useInvoiceHook';
import ClientInvoiceTable from './client-invoice-table';
import OrganizationInvoiceTable from './organization-invoice-table';
import { useEffect, useState } from 'react';
import { today } from '@/lib/utils/todayDate';
import { IInvoice } from '@/types/invoice';

const InvoiceTab = ({ type }: { type: string }) => {
  const router = useRouter();
  const { allInvoices, getInvoiceByPaymentDate } = useInvoice();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [filteredInvoices, setFilteredInvoices] = useState(allInvoices);

  // Fetch invoices based on the selected date
  useEffect(() => {
    const fetchInvoices = async () => {
      if (selectedDate === '') {
        // If no date is selected, show all invoices
        setFilteredInvoices(allInvoices);
      } else {
        // Fetch invoices by the selected payment date
        const invoices = await getInvoiceByPaymentDate(selectedDate as string);
        setFilteredInvoices(invoices as IInvoice[]);
      }
    };

    fetchInvoices();
  }, [router, selectedDate, allInvoices, getInvoiceByPaymentDate]);

  // Filter invoices by type
  const clientInvoices = filteredInvoices?.filter(
    (invoice: IInvoice) => invoice.billTo === 'client',
  );
  const organizationInvoices = filteredInvoices?.filter(
    (invoice: IInvoice) => invoice.billTo === 'organization',
  );

  return (
    <TabLayout>
      <section className="mb-6 flex items-center justify-between">
        <h1 className="heading-primary mb-6">Invoice</h1>
        <div className="flex flex-col gap-4 md:flex-row">
          <Button
            onClick={() =>
              (window.location.href = '/Letterhead_lawspicious.docx')
            }
            colorScheme="purple"
          >
            Download LetterHead
          </Button>
          <Button
            colorScheme="purple"
            onClick={() => router.push('/dashboard/admin/add-invoice')}
          >
            Add Invoice
          </Button>
        </div>
      </section>
      <div className="flex w-full items-center justify-end gap-2">
        <span>Filter By Payment Date :</span>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-fit max-w-44"
          placeholder="Select payment date"
        />
      </div>
      {type === 'client-invoices' ? (
        <ClientInvoiceTable clientInvoices={clientInvoices} />
      ) : (
        <OrganizationInvoiceTable organizationInvoices={organizationInvoices} />
      )}
    </TabLayout>
  );
};

export default InvoiceTab;
