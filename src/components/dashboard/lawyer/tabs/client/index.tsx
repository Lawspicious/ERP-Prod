'use client';
import { Button } from '@chakra-ui/react';
import TabLayout from '../tab-layout';
import { useRouter } from 'next/navigation';
import { useClient } from '@/hooks/useClientHook';
import { useEffect } from 'react';
import LoaderComponent from '@/components/ui/loader';
import { useLoading } from '@/context/loading/loadingContext';
import NormalClientTableLawyer from './client-table';

const ClientTab = () => {
  const router = useRouter();
  const { allClients, getAllClients } = useClient();
  const { loading, setLoading } = useLoading();

  useEffect(() => {
    setLoading(true);
    getAllClients();
    setLoading(false);
  }, []);

  return (
    <TabLayout>
      <section className="flex items-center justify-between">
        <h1 className="heading-primary mb-6">Client</h1>
      </section>
      {loading ? (
        <LoaderComponent />
      ) : allClients.length > 0 ? (
        <NormalClientTableLawyer />
      ) : (
        <div className="heading-secondary flex items-center justify-center">
          No Client Present
        </div>
      )}
    </TabLayout>
  );
};

export default ClientTab;
