'use client';
import AddInvoiceForm from '@/components/invoice/add-invoice-form';
import DuplicateInvoiceForm from '@/components/invoice/duplicate-invoice-form';
import withAuth from '@/components/shared/hoc-middlware';
import LoaderComponent from '@/components/ui/loader';
import PageLayout from '@/components/ui/page-layout';
import { useLoading } from '@/context/loading/loadingContext';
import { useClient } from '@/hooks/useClientHook';
import { useInvoice } from '@/hooks/useInvoiceHook';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

const DuplicateInvoice = ({ params }: { params: { invoiceId: string } }) => {
  const { allClients } = useClient();
  const { loading } = useLoading();
  const { invoice, getInvoiceById } = useInvoice();
  const invoiceId = params.invoiceId;
  const router = useRouter();

  useEffect(() => {
    getInvoiceById(invoiceId);
  }, [router]);

  return (
    <PageLayout screen="margined">
      {loading ? (
        <LoaderComponent />
      ) : invoice ? (
        allClients && allClients.length > 0 ? (
          <DuplicateInvoiceForm
            allClients={allClients}
            initialInvoiceData={invoice}
          />
        ) : (
          <div className="heading-secondary flex items-center justify-center">
            No Invoice Found!!
          </div>
        )
      ) : (
        <div className="heading-secondary flex items-center justify-center">
          Failed to fetch Clients!
        </div>
      )}
    </PageLayout>
  );
};
// Specify allowed roles for this page
const allowedRoles = ['ADMIN', 'SUPERADMIN']; // Add roles that should have access

export default withAuth(DuplicateInvoice, allowedRoles);
