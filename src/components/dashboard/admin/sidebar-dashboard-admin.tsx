'use client';
import React, { useEffect, useState } from 'react';
import {
  CalendarPlus,
  CircleArrowRightIcon,
  Handshake,
  House,
  ListChecks,
  Newspaper,
  Megaphone,
  Scale,
  Users,
  BarChart,
  MessagesSquare,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/context/user/userContext';
import { Badge, Button } from '@chakra-ui/react';

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { logout, authUser, role } = useAuth();

  useEffect(() => {
    const onHashChanged = () => {
      const _activeTab = window.location.hash.replace('#', '');

      // Set active tab directly from hash for client-invoices and organization-invoices
      setActiveTab(_activeTab);
    };

    window.addEventListener('hashchange', onHashChanged);

    return () => {
      window.removeEventListener('hashchange', onHashChanged);
    };
  }, []);

  useEffect(() => {
    const _initialTab = window.location.hash.replace('#', '');
    setActiveTab(_initialTab);
  }, []);

  const handleNavigation = (tab: string) => {
    window.location.hash = tab;
    const url = new URL(window.location.href);
    url.search = '';
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="fixed left-0 z-50 h-full overflow-y-auto bg-bgPrimary p-6 text-sm text-white md:text-base lg:w-[20vw]">
      <h2 className="heading-secondary mb-4 text-center">Lawspicious</h2>
      <section className="mb-4">
        <h3 className="mb-2 font-cabin text-lg font-semibold">Howdy,</h3>
        <h1 className="heading-primary">{authUser?.displayName}</h1>
        <Badge
          mt={2}
          colorScheme="orange"
          fontSize="xs"
          px={3}
          py={1}
          borderRadius="full"
        >
          {role}
        </Badge>
      </section>
      <ul>
        <li
          className={`mb-3 flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-bgSecondary ${
            activeTab === 'home' ? 'bg-bgSecondary' : ''
          }`}
          onClick={() => handleNavigation('home')}
        >
          <House size={20} />
          <span>Home</span>
        </li>
        <li
          className={`mb-3 flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-bgSecondary ${
            activeTab === 'case' ? 'bg-bgSecondary' : ''
          }`}
          onClick={() => handleNavigation('case')}
        >
          <Scale size={20} />
          <span>Cases</span>
        </li>
        <li
          className={`mb-3 flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-bgSecondary ${
            activeTab === 'client' ? 'bg-bgSecondary' : ''
          }`}
          onClick={() => handleNavigation('client')}
        >
          <Handshake size={20} />
          <span>Clients</span>
        </li>
        <li
          className={`mb-3 flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-bgSecondary ${
            activeTab === 'appointment' ? 'bg-bgSecondary' : ''
          }`}
          onClick={() => handleNavigation('appointment')}
        >
          <CalendarPlus size={20} />
          <span>Appointment</span>
        </li>
        {role === 'SUPERADMIN' && (
          <li
            className={`mb-3 flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-bgSecondary ${
              activeTab === 'announcement' ? 'bg-bgSecondary' : ''
            }`}
            onClick={() => handleNavigation('announcement')}
          >
            <Megaphone size={20} />
            <span>Announcement</span>
          </li>
        )}
        <li
          className={`mb-3 flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-bgSecondary ${
            activeTab === 'team' ? 'bg-bgSecondary' : ''
          }`}
          onClick={() => handleNavigation('team')}
        >
          <Users size={20} />
          <span>Team</span>
        </li>
        <li
          className={`mb-3 flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-bgSecondary ${
            activeTab === 'messages' ? 'bg-bgSecondary' : ''
          }`}
          onClick={() => handleNavigation('messages')}
        >
          <MessagesSquare size={20} />
          <span>Messages</span>
        </li>
        <li
          className={`mb-3 flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-bgSecondary ${
            activeTab === 'task' ? 'bg-bgSecondary' : ''
          }`}
          onClick={() => handleNavigation('task')}
        >
          <ListChecks size={20} />
          <span>Task</span>
        </li>
        <li
          className={`mb-3 flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-bgSecondary ${
            activeTab === 'attendance' ? 'bg-bgSecondary' : ''
          }`}
          onClick={() => handleNavigation('attendance')}
        >
          <Clock size={20} />
          <span>Attendance</span>
        </li>
        {(role === 'SUPERADMIN' || role === 'ADMIN') && (
          <li
            className={`mb-3 flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-bgSecondary ${
              activeTab === 'performance-report' ? 'bg-bgSecondary' : ''
            }`}
            onClick={() => handleNavigation('performance-report')}
          >
            <BarChart size={20} />
            <span>Performance Report</span>
          </li>
        )}
        {/* Client Invoices */}
        <li
          className={`mb-3 flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-bgSecondary ${activeTab.includes('invoice') ? 'bg-bgSecondary' : ''}`}
        >
          <Newspaper size={20} />
          <span>Invoice</span>
        </li>
        <ul className="pl-6">
          <li
            className={`mb-3 flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-bgSecondary ${window.location.hash === '#client-invoices' ? 'bg-bgSecondary' : ''}`}
            onClick={() => handleNavigation('client-invoices')}
          >
            <CircleArrowRightIcon size={15} />
            <span>Client Invoices</span>
          </li>
          <li
            className={`mb-3 flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-bgSecondary ${window.location.hash === '#organization-invoices' ? 'bg-bgSecondary' : ''}`}
            onClick={() => handleNavigation('organization-invoices')}
          >
            <CircleArrowRightIcon size={15} />
            <span>Organization Invoices</span>
          </li>
        </ul>
      </ul>
      <Button colorScheme="purple" my={8} className="w-full" onClick={logout}>
        Logout
      </Button>
    </div>
  );
};

export default Sidebar;
