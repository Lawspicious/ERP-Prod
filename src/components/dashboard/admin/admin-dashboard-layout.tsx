// components/dashboard/Dashboard.tsx
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLoading } from '@/context/loading/loadingContext';
import { useAuth } from '@/context/user/userContext';
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
const AnnouncementTab = dynamic(() => import('./tabs/announcement/index'), {
  ssr: false,
});
const PerformanceTab = dynamic(() => import('./tabs/performance/index'), {
  ssr: false,
});
const MessagesTab = dynamic(() => import('../shared/messages/index'), {
  ssr: false,
});

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const { setLoading } = useLoading();
  const { logout } = useAuth();

  // Add auto logout functionality
  useEffect(() => {
    const AUTO_LOGOUT_TIME = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    let logoutTimer: NodeJS.Timeout;

    const resetTimer = () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      logoutTimer = setTimeout(logout, AUTO_LOGOUT_TIME);
    };

    // Set up event listeners for user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ];
    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    // Initial timer setup
    resetTimer();

    // Cleanup
    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [logout]);

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
      case 'announcement':
        return <AnnouncementTab />;
      case 'performance-report':
        return <PerformanceTab />;
      case 'messages':
        return <MessagesTab user="admin" />;
      default:
        return <HomeTab />;
    }
  };

  return <>{renderTabContent()}</>;
};

export default Dashboard;
