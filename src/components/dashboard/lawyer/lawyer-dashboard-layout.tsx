// components/dashboard/Dashboard.tsx
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the tabs
const HomeTab = dynamic(() => import('./tabs/home/index'), { ssr: false });
const CaseTab = dynamic(() => import('./tabs/case/index'), { ssr: false });
const ClientTab = dynamic(() => import('./tabs/client/index'), { ssr: false });
// const InvoiceTab = dynamic(() => import('./tabs/invoice'), { ssr: false });
// const TeamsTab = dynamic(() => import('./tabs/team'), { ssr: false });
const TaskTab = dynamic(() => import('./tabs/task/index'), { ssr: false });
const AppointmentTab = dynamic(() => import('./tabs/appointment/index'), {
  ssr: false,
});
const MessagesTab = dynamic(() => import('../shared/messages/index'), {
  ssr: false,
});

const LawyerDashboard = () => {
  const [activeTab, setActiveTab] = useState<string>('home');

  // Handle hash route changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      setActiveTab(hash);
    };

    if (window.location.hash === '') {
      window.location.href = '/dashboard/lawyer/workspace-lawyer#home';
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
      // case 'invoice':
      //   return <InvoiceTab />;
      // case 'team':
      //   return <TeamsTab />;
      case 'task':
        return <TaskTab />;
      case 'appointment':
        return <AppointmentTab />;
      case 'messages':
        return <MessagesTab user="lawyer" />;
      default:
        return <CaseTab />;
    }
  };

  return <>{renderTabContent()}</>;
};

export default LawyerDashboard;
