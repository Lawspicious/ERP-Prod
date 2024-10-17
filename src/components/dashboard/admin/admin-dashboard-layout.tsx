// components/dashboard/Dashboard.tsx
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLoading } from '@/context/loading/loadingContext';
import React from 'react';

// Dynamically import the tabs
const HomeTab = dynamic(() => import('./tabs/home/index'), { ssr: false });
const CaseTab = dynamic(() => import('./tabs/case/index'), { ssr: false });
const ClientTab = dynamic(() => import('./tabs/client/index'), { ssr: false });
const InvoiceTab = dynamic(() => import('./tabs/invoice'), { ssr: false });
const TeamsTab = dynamic(() => import('./tabs/team'), { ssr: false });
const TaskTab = dynamic(() => import('./tabs/task/index'), { ssr: false });
const AppointmentTab = dynamic(() => import('./tabs/appointment/index'), {
  ssr: false,
});

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const { setLoading } = useLoading();

  // Handle hash route changes
  useEffect(() => {
    const handleHashChange = () => {
      setLoading(true);
      const hash = window.location.hash.replace('#', '') || 'home';
      setActiveTab(hash);
    };

    if (window.location.hash === '') {
      window.location.href = '/dashboard/admin/workspace-admin#home';
    }

    // Set the active tab based on initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Cleanup the event listener on unmount
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Function to render the tab content dynamically
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />;
      case 'case':
        return <CaseTab />;
      case 'client':
        return <ClientTab />;
      case 'client-invoices':
        return <InvoiceTab type={'client-invoices'} />;
      case 'organization-invoices':
        return <InvoiceTab type={'organization-invoices'} />;
      case 'team':
        return <TeamsTab />;
      case 'task':
        return <TaskTab />;
      case 'appointment':
        return <AppointmentTab />;
      default:
        return <HomeTab />;
    }
  };

  return <>{renderTabContent()}</>;
};

export default Dashboard;
