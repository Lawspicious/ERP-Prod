'use client';
import AddInvoiceForm from '@/components/invoice/add-invoice-form';
import withAuth from '@/components/shared/hoc-middlware';
import LoaderComponent from '@/components/ui/loader';
import PageLayout from '@/components/ui/page-layout';
import { useLoading } from '@/context/loading/loadingContext';
import { useClient } from '@/hooks/useClientHook';
import React, { useEffect } from 'react';

const AddInvoicePage = () => {
  const { allClients } = useClient();
  const { loading } = useLoading();

  return (
    <PageLayout screen="margined">
      {loading ? (
        <LoaderComponent />
      ) : allClients && allClients.length > 0 ? (
        <AddInvoiceForm allClients={allClients} />
      ) : (
        <div className="heading-secondary flex items-center justify-center">
          Failed to fetch Clients!
        </div>
      )}
    </PageLayout>
  );
};
// Specify allowed roles for this page
const allowedRoles = ['ADMIN', 'HR', 'SUPERADMIN']; // Add roles that should have access

export default withAuth(AddInvoicePage, allowedRoles);
