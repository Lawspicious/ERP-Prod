'use client';
import { Button, HStack } from '@chakra-ui/react';
import ShowClientTable from './show-client-table';
import TabLayout from '../tab-layout';
import { useRouter } from 'next/navigation';
import { DownloadIcon } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useClient } from '@/hooks/useClientHook';

const ClientTab = () => {
  const router = useRouter();
  const { normalClient, prospectClient } = useClient();

  const handleExportNormalClients = () => {
    try {
      const normalClientsData = normalClient.map((client) => ({
        Name: client.name,
        Email: client.email,
        Mobile: client.mobile,
        City: client.city,
        Rating: client.rating,
      }));

      const ws = XLSX.utils.json_to_sheet(normalClientsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Normal Clients');
      XLSX.writeFile(wb, 'normal_clients.xlsx');
    } catch (error) {
      console.error('Error exporting normal clients:', error);
    }
  };

  const handleExportProspectClients = () => {
    try {
      const prospectClientsData = prospectClient.map((client) => ({
        Name: client.name,
        Mobile: client.mobile,
        Location: client.location,
        'Follow-up': client.followUp ? 'YES' : 'NO',
        'Next Follow-up Date': client.nextFollowUpDate || 'N/A',
        Source: client.source,
        Service: client.service,
        Feedback: client.client_feedback || 'N/A',
        Rating: client.rating,
      }));

      const ws = XLSX.utils.json_to_sheet(prospectClientsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Prospect Clients');
      XLSX.writeFile(wb, 'prospect_clients.xlsx');
    } catch (error) {
      console.error('Error exporting prospect clients:', error);
    }
  };

  return (
    <TabLayout>
      <section className="mb-6 flex items-center justify-between">
        <h1 className="heading-primary mb-6">Client</h1>
        <HStack spacing={2}>
          <Button
            leftIcon={<DownloadIcon />}
            colorScheme="green"
            size="sm"
            onClick={handleExportNormalClients}
          >
            Export Normal Clients
          </Button>
          <Button
            leftIcon={<DownloadIcon />}
            colorScheme="teal"
            size="sm"
            onClick={handleExportProspectClients}
          >
            Export Prospect Clients
          </Button>
          <Button
            colorScheme="purple"
            onClick={() => router.push('/dashboard/admin/add-client')}
          >
            Add Client
          </Button>
        </HStack>
      </section>
      <ShowClientTable />
    </TabLayout>
  );
};

export default ClientTab;
