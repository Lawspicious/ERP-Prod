// 'use client';
// import Dashboard from '@/components/dashboard/admin/admin-dashboard-layout';
// import Sidebar from '@/components/dashboard/admin/sidebar-dashboard-admin';
// import React, { useState, useEffect } from 'react';

// const AdminDashboardPage = () => {
//   return (
//     <div className="flex">
//       <div className="hidden lg:block">
//         <Sidebar />
//       </div>
//       <div className="max-w-screen min-h-screen w-full overflow-hidden lg:ml-[20vw]">
//         <Dashboard />
//       </div>
//     </div>
//   );
// };

// export default AdminDashboardPage;
'use client';
import Dashboard from '@/components/dashboard/admin/admin-dashboard-layout';
import Sidebar from '@/components/dashboard/admin/sidebar-dashboard-admin';
import React from 'react';
import withAuth from '@/components/shared/hoc-middlware'; // Adjust the import path accordingly

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
