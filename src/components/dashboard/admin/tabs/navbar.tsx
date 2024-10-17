'use client';
import { useAuth } from '@/context/user/userContext';
import {
  Avatar,
  Badge,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from '@chakra-ui/react';
import {
  Calendar,
  CalendarPlus,
  Handshake,
  House,
  ListChecks,
  Menu,
  Newspaper,
  Scale,
  Users,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

const Navbar = () => {
  const [isOpen, setISOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('home');
  const { logout, authUser, role } = useAuth();

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
    window.location.href = `/dashboard/admin/workspace-admin#${tab}`;
  };
  return (
    <div className="flex items-center justify-between gap-6 px-4 py-3 shadow-md lg:justify-end">
      <Menu
        size={30}
        color="#6B46C1"
        className="cursor-pointer lg:hidden"
        onClick={() => setISOpen(true)}
      />
      <div className="flex items-center justify-end gap-4">
        <Calendar
          onClick={() => (window.location.href = '/calendar')}
          cursor={'pointer'}
        />
        <Avatar
          name={authUser?.displayName || 'admin'}
          cursor={'pointer'}
          size={'sm'}
          onClick={() => (window.location.href = `/user/${authUser?.uid}`)}
        />
      </div>
      <Drawer isOpen={isOpen} placement="left" onClose={() => setISOpen(false)}>
        <DrawerOverlay />
        <DrawerContent bgColor={'#2f2f2f'}>
          <DrawerCloseButton autoFocus={false} _focus={{ outline: 0 }}>
            <X size={30} color="white" />
          </DrawerCloseButton>
          <DrawerHeader>
            <h2 className="heading-primary mb-4 text-center text-white">
              Lawspicious
            </h2>
            <section className="mb-4">
              <h3 className="mb-2 font-cabin text-lg font-semibold text-white">
                Howdy,
              </h3>
              <h1 className="heading-primary text-white">
                {authUser?.displayName}
              </h1>
              <Badge
                mt={2}
                colorScheme="orange"
                fontSize="xs"
                px={3}
                py={1}
                borderRadius="full"
              >
                Admin
              </Badge>
            </section>
          </DrawerHeader>
          <DrawerBody className="flex flex-col gap-6">
            <div className="z-50 h-full bg-bgPrimary text-sm text-white md:text-base">
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
                    activeTab === 'team' ? 'bg-bgSecondary' : ''
                  }`}
                  onClick={() => handleNavigation('team')}
                >
                  <Users size={20} />
                  <span>Team</span>
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
                    <span>Client Invoices</span>
                  </li>
                  <li
                    className={`mb-3 flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-bgSecondary ${window.location.hash === '#organization-invoices' ? 'bg-bgSecondary' : ''}`}
                    onClick={() => handleNavigation('organization-invoices')}
                  >
                    <span>Organization Invoices</span>
                  </li>
                </ul>
              </ul>
              <Button
                colorScheme="purple"
                className="w-full"
                my={8}
                onClick={logout}
              >
                Logout
              </Button>
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Navbar;
