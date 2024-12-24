'use client';
import React, { useEffect, useState } from 'react';
import {
  CalendarPlus,
  Handshake,
  House,
  ListChecks,
  Scale,
} from 'lucide-react';
import { useAuth } from '@/context/user/userContext';
import { Badge, Button } from '@chakra-ui/react';

const LawyerSidebar = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { logout, authUser } = useAuth();

  useEffect(() => {
    const onHashChanged = () => {
      const _activeTab = window.location.hash;
      if (_activeTab !== '') {
        setActiveTab(_activeTab.replace('#', ''));
      }
    };

    window.addEventListener('hashchange', onHashChanged);

    return () => {
      window.removeEventListener('hashchange', onHashChanged);
    };
  }, []);

  useEffect(() => {
    setActiveTab(window.location.hash.replace('#', ''));
  }, []);

  const handleNavigation = (tab: string) => {
    window.location.hash = tab;
    const url = new URL(window.location.href);
    url.search = '';
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="fixed left-0 z-50 h-full w-[40vw] overflow-y-auto bg-bgPrimary p-6 text-sm text-white md:w-[30vw] md:text-base lg:w-[20vw]">
      <h2 className="heading-secondary mb-4 text-center">Lawspicious</h2>
      <section className="mb-4">
        <h3 className="mb-2 font-cabin text-lg font-semibold">Howdy,</h3>
        <h1 className="heading-primary">{authUser?.displayName}</h1>
        <Badge
          mt={2}
          colorScheme="green"
          fontSize="xs"
          px={3}
          py={1}
          borderRadius="full"
        >
          Lawyer
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

        <li
          className={`mb-3 flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-bgSecondary ${
            activeTab === 'task' ? 'bg-bgSecondary' : ''
          }`}
          onClick={() => handleNavigation('task')}
        >
          <ListChecks size={20} />
          <span>Task</span>
        </li>
      </ul>
      <Button colorScheme="purple" className="mt-8 w-full" onClick={logout}>
        Logout
      </Button>
    </div>
  );
};

export default LawyerSidebar;
