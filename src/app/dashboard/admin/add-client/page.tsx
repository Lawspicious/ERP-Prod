'use client';
import AddClientMain from '@/components/client/add-client-main';
import withAuth from '@/components/shared/hoc-middlware';
import PageLayout from '@/components/ui/page-layout';
import React from 'react';

const AddClientPage = () => {
  return (
    <PageLayout screen="margined">
      <AddClientMain />
    </PageLayout>
  );
};

// Specify allowed roles for this page
const allowedRoles = ['ADMIN', 'HR', 'SUPERADMIN']; // Add roles that should have access

export default withAuth(AddClientPage, allowedRoles);
