'use client';

import LawyerDashboard from '@/components/dashboard/lawyer/lawyer-dashboard-layout';
import LawyerSidebar from '@/components/dashboard/lawyer/sidebar-dashboard-lawyer';
import withAuth from '@/components/shared/hoc-middlware';

const LawyerDashboardPage = () => {
  return (
    <div className="flex">
      <div className="hidden lg:block">
        <LawyerSidebar />
      </div>
      <div className="max-w-screen min-h-screen w-full overflow-hidden lg:ml-[20vw]">
        <LawyerDashboard />
      </div>
    </div>
  );
};

const allowedRoles = ['ADMIN', 'HR', 'LAWYER']; // Add roles that should have access

export default withAuth(LawyerDashboardPage, allowedRoles);
