'use client';
import AddInvoiceForm from '@/components/invoice/add-invoice-form';
import EditInvoiceForm from '@/components/invoice/edit-invoice-form';
import withAuth from '@/components/shared/hoc-middlware';
import LoaderComponent from '@/components/ui/loader';
import PageLayout from '@/components/ui/page-layout';
import { useLoading } from '@/context/loading/loadingContext';
import { useClient } from '@/hooks/useClientHook';
import { useInvoice } from '@/hooks/useInvoiceHook';
import React, { useEffect } from 'react';

const EditInvoicePage = ({
  params,
}: {
  params: {
    invoiceId: string;
  };
}) => {
  const { allClients } = useClient();
  const { loading } = useLoading();
  const { invoice, getInvoiceById } = useInvoice();

  useEffect(() => {
    getInvoiceById(params.invoiceId as string);
  }, []);

  return (
    <PageLayout screen="margined">
      {loading ? (
        <LoaderComponent />
      ) : allClients && allClients.length > 0 && invoice ? (
        <EditInvoiceForm allClients={allClients} invoice={invoice} />
      ) : (
        <div className="heading-secondary flex items-center justify-center">
          Failed to fetch Clients/Invoice!
        </div>
      )}
    </PageLayout>
  );
};
// Specify allowed roles for this page
const allowedRoles = ['SUPERADMIN'];

export default withAuth(EditInvoicePage, allowedRoles);
