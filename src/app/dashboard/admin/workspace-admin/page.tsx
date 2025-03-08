'use client';
import Dashboard from '@/components/dashboard/admin/admin-dashboard-layout';
import Sidebar from '@/components/dashboard/admin/sidebar-dashboard-admin';
import React, { useEffect } from 'react';
import withAuth from '@/components/shared/hoc-middlware';

const AdminDashboardPage = () => {
  return (
    <div className="flex">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="max-w-screen min-h-screen w-full overflow-hidden lg:ml-[20vw]">
        <Dashboard />
      </div>
    </div>
  );
};

// Specify allowed roles for this page
const allowedRoles = ['ADMIN', 'SUPERADMIN']; // Add roles that should have access

export default withAuth(AdminDashboardPage, allowedRoles);
