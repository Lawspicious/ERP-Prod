'use client';
import { useAuth } from '@/context/user/userContext';
import { useNotification } from '@/hooks/useNotificationHook';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import {
  BellIcon,
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
  const [activeTab, setActiveTab] = useState('home');
  const { logout, authUser, role } = useAuth();
  const { allNotifications, updateNotificationStatus } = useNotification();

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] =
    useState<boolean>(false);

  const handleOpenNotificationDrawer = () => {
    try {
      allNotifications.map(
        async (notification) =>
          await updateNotificationStatus(notification.id as string, 'seen'),
      );
      setIsNotificationDrawerOpen(false);
    } catch (error) {
      console.log('error');
    }
  };

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
        onClick={() => setIsSidebarOpen(true)}
      />

      <div className="flex items-center justify-end gap-4">
        <Box position="relative">
          <IconButton
            icon={<BellIcon />}
            aria-label="Notifications"
            onClick={() => setIsNotificationDrawerOpen(true)}
            size="lg"
            bgColor={'transparent'}
            _hover={{ backgroundColor: 'transparent' }}
          />
          {allNotifications.filter((notf) => notf.status === 'unseen').length >
            0 && (
            <Badge
              position="absolute"
              top="-1"
              right="-1"
              colorScheme="red"
              borderRadius="full"
              fontSize="0.8em"
              px={2}
            >
              {
                allNotifications.filter((notf) => notf.status === 'unseen')
                  .length
              }
            </Badge>
          )}
        </Box>
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
      <Drawer
        isOpen={isSidebarOpen}
        placement="left"
        onClose={() => setIsSidebarOpen(false)}
      >
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
      <Drawer
        onClose={() => handleOpenNotificationDrawer()}
        isOpen={isNotificationDrawerOpen}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Notifications</DrawerHeader>

          <DrawerBody>
            <VStack spacing={4} align="stretch">
              {allNotifications.length > 0 ? (
                allNotifications.map((notification) => (
                  <Box
                    key={notification.id}
                    p={4}
                    shadow="md"
                    borderWidth="1px"
                    borderRadius="lg"
                    bg={notification.status === 'unseen' ? 'gray.100' : 'white'}
                    cursor={'pointer'}
                    _hover={{ backgroundColor: 'gray.100' }}
                    onClick={() =>
                      (window.location.href = `/${notification.type.toLowerCase()}/${notification.appointmentId || notification.taskId || notification.caseId}`)
                    }
                  >
                    <Text fontWeight="semibold">
                      {notification.notificationName}
                    </Text>
                    {notification.caseNo && (
                      <Text>Case No: {notification.caseNo}</Text>
                    )}
                    {notification.taskName && (
                      <Text>Task: {notification.taskName}</Text>
                    )}
                    {notification.appointmentName && (
                      <Text>Appointment: {notification.appointmentName}</Text>
                    )}
                    <Text fontSize="sm" color="gray.500">
                      Status: {notification.status}
                    </Text>
                  </Box>
                ))
              ) : (
                <Text>No notifications available.</Text>
              )}
            </VStack>
          </DrawerBody>

          <DrawerFooter>
            <Text fontSize="sm" color="gray.500">
              End of notifications
            </Text>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Navbar;
