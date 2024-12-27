import {
  usePerformanceHook,
  UserWithDetails,
} from '@/hooks/usePerformanceHook';
import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Badge,
  Button,
} from '@chakra-ui/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Pagination from '@/components/dashboard/shared/Pagination';
import TabLayout from '../tab-layout';

export default function PerformanceOverview() {
  const { getUsersWithTasksAndCases } = usePerformanceHook();
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagesWithContent, setPagesWithContent] = useState<number[]>([]);
  const [hasContent, setHasContent] = useState(true); // Added state variable
  const itemsPerPage = 5; // Fixed items per page
  const router = useRouter();

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    const page = Number(searchParams.get('page')) || 1;
    setCurrentPage(page);
    fetchUsers(page);
  }, [searchParams]);

  const fetchUsers = async (page: number) => {
    try {
      const { data, totalPages, pagesWithContent } =
        await getUsersWithTasksAndCases(page, itemsPerPage);
      setUsers(data);
      setTotalPages(totalPages);
      setPagesWithContent(pagesWithContent);
      setHasContent(data.length > 0); // Update to set hasContent
    } catch (error) {
      console.error('Error fetching users:', error);
      setHasContent(false); // Update to set hasContent to false on error
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}#performance-report`);
  };

  const renderTableRows = () => {
    return users.map((user) => (
      <Tr
        key={user.lawyer.id}
        onClick={() => router.push(`/performance/${user.lawyer.id}`)}
        className="hover:bg-gray.300 cursor-pointer transition-colors"
      >
        <Td>{user.lawyer.name}</Td>
        <Td>{user.tasks.length}</Td>
        <Td>{user.cases.length}</Td>
        <Td>
          <Badge
            colorScheme={
              user.tasks.some((task) => task.taskStatus === 'COMPLETED')
                ? 'green'
                : 'yellow'
            }
          >
            {
              user.tasks.filter((task) => task.taskStatus === 'COMPLETED')
                .length
            }
          </Badge>
        </Td>
        <Td>
          <Badge
            colorScheme={
              user.cases.some((caseItem) => caseItem.caseStatus === 'DECIDED')
                ? 'purple'
                : 'blue'
            }
          >
            {
              user.cases.filter((caseItem) => caseItem.caseStatus === 'DECIDED')
                .length
            }
          </Badge>
        </Td>
      </Tr>
    ));
  };

  return (
    <TabLayout>
      <Container maxW="container.xl" py={8} px={4}>
        <VStack spacing={4} align="stretch">
          <Box>
            <Heading as="h1" size="xl" mb={2}>
              Performance Overview
            </Heading>
            <Text color={textColor}>
              View user performance metrics, including tasks and cases.
            </Text>
          </Box>
          {hasContent ? (
            <Box bg={bgColor} shadow="md" borderRadius="lg" overflow="hidden">
              <Box overflowX="auto" width="100%">
                <Table variant="simple" minWidth="650px">
                  <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                    <Tr>
                      <Th>User</Th>
                      <Th>Total Tasks</Th>
                      <Th>Total Cases</Th>
                      <Th>Completed Tasks</Th>
                      <Th>Decided Cases</Th>
                    </Tr>
                  </Thead>
                  <Tbody>{renderTableRows()}</Tbody>
                </Table>
              </Box>
            </Box>
          ) : (
            <Box
              bg={bgColor}
              shadow="md"
              borderRadius="lg"
              p={4}
              textAlign="center"
            >
              <Text fontSize="lg" fontWeight="medium">
                No content available on this page.
              </Text>
              <Text fontSize="sm" color="gray.500">
                Pages with Content :{' '}
                {pagesWithContent && pagesWithContent.length > 0
                  ? pagesWithContent.join(',')
                  : 'NA'}
                .
              </Text>
              <Button
                colorScheme="blue"
                onClick={() => handlePageChange(Math.max(...pagesWithContent))}
                mt={4}
                width="full"
              >
                Go to Last Page with Content
              </Button>
            </Box>
          )}
          <HStack justify="center" flexWrap="wrap">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.max(...pagesWithContent)} // Updated totalPages prop
              onPageChange={handlePageChange}
              pagesWithContent={pagesWithContent}
            />
          </HStack>
        </VStack>
      </Container>
    </TabLayout>
  );
}
