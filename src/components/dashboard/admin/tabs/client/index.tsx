'use client';
import { Button, useDisclosure } from '@chakra-ui/react';
import ShowClientTable from './show-client-table';
import TabLayout from '../tab-layout';
import { useRouter } from 'next/navigation';
import { useClient } from '@/hooks/useClientHook';
import { useEffect } from 'react';
import LoaderComponent from '@/components/ui/loader';
import { useLoading } from '@/context/loading/loadingContext';

const ClientTab = () => {
  const router = useRouter();

  return (
    <TabLayout>
      <section className="mb-6 flex items-center justify-between">
        <h1 className="heading-primary mb-6">Client</h1>
        <Button
          colorScheme="purple"
          onClick={() => router.push('/dashboard/admin/add-client')}
        >
          Add Client
        </Button>
      </section>
      <ShowClientTable />
    </TabLayout>
  );
};

export default ClientTab;
