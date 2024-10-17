'use client';
import { ClientPageMain } from '@/components/client/client-page-main';
import LoaderComponent from '@/components/ui/loader';
import PageLayout from '@/components/ui/page-layout';
import { useLoading } from '@/context/loading/loadingContext';
import { useCases } from '@/hooks/useCasesHook';
import { useClient } from '@/hooks/useClientHook';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

const IndividualClientPage = ({ params }: { params: { clientId: string } }) => {
  const clientId = params.clientId;
  const { client, getClientById } = useClient();
  const { loading, setLoading } = useLoading();
  const { allCases, fetchCasesByClientId } = useCases();
  const router = useRouter();

  useEffect(() => {
    const handleFetch = async () => {
      await getClientById(clientId as string);
      await fetchCasesByClientId(clientId as string);
    };

    setLoading(true);
    handleFetch();
    setLoading(false);
  }, [clientId, router]);
  return (
    <PageLayout screen="margined">
      {loading ? (
        <LoaderComponent />
      ) : client ? (
        <ClientPageMain client={client} allCases={allCases} />
      ) : (
        <div className="heading-secondary flex h-screen items-center justify-center">
          No Such Client Exist!
        </div>
      )}
    </PageLayout>
  );
};

export default IndividualClientPage;
