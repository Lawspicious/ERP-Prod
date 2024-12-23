import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  VStack,
  Heading,
  Text,
  Container,
  Flex,
  useDisclosure,
  useColorModeValue,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { Plus, Bell, Megaphone, ArrowRight } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import TabLayout from '../tab-layout';
import AnnouncementList from './AnnouncementList';
import AnnouncementModal from './AnnouncementModal';
import Pagination from './Pagination';
import { useAuth } from '@/context/user/userContext';
import { Announcement } from '@/types/announcement';
import { useAnnouncementHook } from '@/hooks/useAnnouncementHook';

const ITEMS_PER_PAGE = 5;

const AnnouncementTab = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    createAnnouncement,
    getAllAnnouncementsFunction,
    deleteAnnouncement,
  } = useAnnouncementHook();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagesWithContent, setPagesWithContent] = useState<number[]>([]);

  useEffect(() => {
    const page = Number(searchParams.get('page')) || 1;
    setCurrentPage(page);
    fetchAnnouncements(page);
  }, [searchParams]);

  const fetchAnnouncements = async (page: number) => {
    try {
      const { data, totalPages, pagesWithContent } =
        await getAllAnnouncementsFunction(page, ITEMS_PER_PAGE);
      setAnnouncements(data);
      setTotalPages(totalPages);
      setPagesWithContent(pagesWithContent);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const handleAddAnnouncement = async (newAnnouncement: Announcement) => {
    try {
      await createAnnouncement(newAnnouncement);
      fetchAnnouncements(currentPage);
      const params = new URLSearchParams(searchParams);
      params.set('page', currentPage.toString());
      router.push(`${pathname}?${params.toString()}#announcement`);
      onClose();
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await deleteAnnouncement(id);
      fetchAnnouncements(currentPage);
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}#announcement`);
  };

  const navigateToLastPageWithContent = () => {
    const lastPageWithContent = Math.max(...pagesWithContent);
    handlePageChange(lastPageWithContent);
  };

  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const headerBgColor = useColorModeValue('white', 'gray.700');

  if (role !== 'SUPERADMIN') {
    return (
      <TabLayout>
        <Box bg={bgColor} minH="100vh">
          <Container maxW="container.xl">
            <Flex justify="center" align="center" minH="80vh">
              <Box textAlign="center">
                <Megaphone size={64} color="blue.500" />
                <Heading size="lg" mt={4}>
                  Announcement Dashboard
                </Heading>
                <Text mt={4}>
                  You do not have permission to view this page. Please contact
                  your administrator for more information.
                </Text>
              </Box>
            </Flex>
          </Container>
        </Box>
      </TabLayout>
    );
  }

  return (
    <TabLayout>
      <Box bg={bgColor} minH="100vh">
        <Box bg={headerBgColor} py={4} boxShadow="sm">
          <Container maxW="container.xl">
            <Flex justify="space-between" align="center">
              <Heading size="lg">Announcement Dashboard</Heading>
              <Button
                leftIcon={<Plus size={20} />}
                colorScheme="blue"
                onClick={onOpen}
              >
                New Announcement
              </Button>
            </Flex>
          </Container>
        </Box>

        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">
            <Box bg={headerBgColor} p={6} borderRadius="md" boxShadow="md">
              <Flex align="center" mb={4}>
                <Bell size={24} color="blue.500" />
                <Heading size="md" ml={2}>
                  Welcome to the Announcement System
                </Heading>
              </Flex>
              <Text>
                This dashboard allows you to manage and view all announcements.
                Use the "New Announcement" button to create announcements with
                different priority levels.
              </Text>
            </Box>

            <Box>
              <Heading size="md" mb={4}>
                Recent Announcements
              </Heading>
              {announcements.length > 0 ? (
                <AnnouncementList
                  announcements={announcements}
                  onDelete={handleDeleteAnnouncement}
                />
              ) : (
                <Alert status="info" borderRadius="md" mb={4}>
                  <AlertIcon as={Megaphone} />
                  <VStack align="start" spacing={2}>
                    <Text>
                      There are no announcements on this page.
                      {pagesWithContent.length > 0 && (
                        <> Pages with content: {pagesWithContent.join(', ')}.</>
                      )}
                    </Text>
                    {pagesWithContent.length > 0 &&
                      currentPage !== Math.max(...pagesWithContent) && (
                        <Button
                          size="sm"
                          colorScheme="blue"
                          rightIcon={<ArrowRight size={16} />}
                          onClick={navigateToLastPageWithContent}
                        >
                          Go to Last Page with Content
                        </Button>
                      )}
                  </VStack>
                </Alert>
              )}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  pagesWithContent={pagesWithContent}
                />
              )}
            </Box>
          </VStack>
        </Container>
      </Box>
      <AnnouncementModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleAddAnnouncement}
      />
    </TabLayout>
  );
};

export default AnnouncementTab;
